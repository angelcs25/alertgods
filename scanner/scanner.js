// ─────────────────────────────────────────────────────────────────────────────
// ALERTGODS SCANNER — scanner.js
// Run: node scanner.js
// Keep running with: pm2 start scanner.js --name alertgods-scanner
// ─────────────────────────────────────────────────────────────────────────────

import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

import { initSchwab, getAuthUrl, exchangeCode, fetchQuotes, fetchOptionsChain, isAuthorized, getFrontMonthFuturesSymbol } from "./schwab.js";
import { analyzeWithClaude } from "./claude.js";
import { dispatchSignal, dispatchSkip, setSubscribers, getSubscribers, addFreeSubscriber, addProSubscriber, saveSubscribers } from "./notify.js";
import { isMarketOpen, getMarketPhase, getScanInterval } from "./market_hours.js";

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Same reasoning as schwab.js: Railway's container filesystem resets on every
// redeploy, so signals/subscribers written to __dirname would vanish on each
// push. DATA_DIR points at a mounted Volume instead, when one is attached.
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || __dirname;
const SIGNALS_FILE    = path.join(DATA_DIR, "signals.json");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");
const PORT = process.env.PORT || 3001;

// Tickers to scan — equities + futures.
const EQUITY_TICKERS  = ["SPY","QQQ","AAPL","NVDA","AMD","AVGO"];
const FUTURES_ROOTS = ["ES", "NQ"]; // PRO ONLY — resolved to the live front-month contract each scan
const SKIP_IN_MID     = ["AAPL","AMD","AVGO"]; // too erratic mid-day for 0DTE

let signals    = [];
let scanLog    = [];
let isScanning = false;
let nextScanAt = null;
let scanTimer  = null;
let stats      = { totalScans: 0, signalsGenerated: 0, signalsSkipped: 0, signalsThrottled: 0, lastScan: null };

// ─── Repeat-signal cooldown ─────────────────────────────────────────────────
// Without this, a trending ticker clears Claude's bar on every single scan
// cycle (every 5min during OPEN/POWER_HOUR) and re-signals the *same* move
// over and over — e.g. QQQ BUY PUT at 9:37, 9:44, and 9:51 for the same
// sell-off. This suppresses a same-direction repeat on a ticker within the
// cooldown window; a genuine reversal (side or type flips) still fires.
// Tune with SIGNAL_COOLDOWN_MINUTES in Railway — no code change needed.
const SIGNAL_COOLDOWN_MS = (parseInt(process.env.SIGNAL_COOLDOWN_MINUTES) || 30) * 60 * 1000;
let lastSignalByTicker = {}; // { SPY: { side: "BUY", type: "PUT", at: <ms epoch> } }

function isRepeatSignal(ticker, side, type) {
  const last = lastSignalByTicker[ticker];
  if (!last) return false;
  const sameDirection = last.side === side && last.type === type;
  return sameDirection && (Date.now() - last.at) < SIGNAL_COOLDOWN_MS;
}

// ─── Manual pause ────────────────────────────────────────────────────────────
// A hand toggle for "I've got what I wanted today, stop spending on this" —
// independent of the daily cap below. Flips scanning off/on without touching
// Railway at all: the server keeps running (dashboard, signups, Stripe
// webhook all still work), it just stops calling Schwab/Claude until you
// resume it. Resets to false on every redeploy/restart, so a normal push
// never accidentally leaves it paused. Toggle it with:
//   POST /api/admin/pause  -H "x-admin-key: <ADMIN_KEY>"
//   POST /api/admin/resume -H "x-admin-key: <ADMIN_KEY>"
let scanningPaused = false;

// ─── Daily signal cap + quality floor ───────────────────────────────────────
// The cooldown above only blocks the SAME ticker/direction combo — it doesn't
// cap the total number of signals across every ticker and every scan cycle,
// which is how a busy day turns into 15-20+ alerts. This adds two levers:
// MIN_DISPATCH_CONFIDENCE holds back anything that cleared Claude's own (much
// lower) per-phase minimum but isn't actually a top-tier setup, and
// MAX_DAILY_SIGNALS stops dispatching to subscribers once that many have gone
// out today — and once the cap is hit, runScan() below skips analysis
// entirely for the rest of the day, which also stops paying for Claude calls
// on tickers whose signals would just get held back anyway. Held-back signals
// still log to the admin channel so you keep visibility. Resets automatically
// at the next ET calendar day. Tune both with MAX_DAILY_SIGNALS /
// MIN_DISPATCH_CONFIDENCE in Railway — no code change needed.
const MAX_DAILY_SIGNALS = parseInt(process.env.MAX_DAILY_SIGNALS) || 10;
const MIN_DISPATCH_CONFIDENCE = parseInt(process.env.MIN_DISPATCH_CONFIDENCE) || 75;
let dailySignalCount = 0;
let dailySignalDate = null;

function getETDateString() {
  return new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
}

function checkDailyReset() {
  const today = getETDateString();
  if (dailySignalDate !== today) {
    dailySignalDate = today;
    dailySignalCount = 0;
  }
}

// ─── Load persisted data ──────────────────────────────────────────────────────

async function loadData() {
  try {
    signals = JSON.parse(await fs.readFile(SIGNALS_FILE, "utf8"));
    console.log(`  Loaded ${signals.length} saved signals`);
  } catch { signals = []; }

  try {
    const subs = JSON.parse(await fs.readFile(SUBSCRIBERS_FILE, "utf8"));
    setSubscribers(subs);
    console.log(`  Loaded subscribers`);
  } catch {
    setSubscribers({ free: [], pro: [] });
  }
}

async function saveSignals() {
  await fs.writeFile(SIGNALS_FILE, JSON.stringify(signals.slice(0, 300), null, 2));
}

// ─── Core scan ────────────────────────────────────────────────────────────────

async function runScan() {
  if (isScanning) { console.log("  Scan already running — skipping"); return; }
  if (!isAuthorized()) { console.warn("  [Schwab] Not authorized — skipping scan. Visit /auth"); scheduleNextScan(); return; }

  if (scanningPaused) {
    console.log("  ⏸ Scanning is manually paused — skipping (POST /api/admin/resume to turn back on)");
    scheduleNextScan();
    return;
  }

  isScanning = true;
  const phase = getMarketPhase();
  const start = new Date();
  console.log(`\n🔍 [${start.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false })} ET] Scanning — phase: ${phase}`);

  stats.totalScans++;
  stats.lastScan = start;
  const log = { ts: start.toISOString(), phase, results: [] };

  checkDailyReset();
  if (dailySignalCount >= MAX_DAILY_SIGNALS) {
    console.log(`  💤 Daily cap of ${MAX_DAILY_SIGNALS} signals already reached — skipping analysis for the rest of today (saves the Claude API cost too). Resumes automatically at the next ET trading day.`);
    log.results.push({ ticker: "*", result: `daily cap reached (${dailySignalCount}/${MAX_DAILY_SIGNALS}) — scan skipped` });
    scanLog = [log, ...scanLog].slice(0, 50);
    isScanning = false;
    scheduleNextScan();
    return;
  }

  // Determine which tickers to scan this phase
  let equities = phase === "MID"
    ? EQUITY_TICKERS.filter(t => !SKIP_IN_MID.includes(t))
    : EQUITY_TICKERS;

  const futuresTickers = FUTURES_ROOTS.map(getFrontMonthFuturesSymbol);
  const allTickers = [...equities, ...futuresTickers];

  try {
    // 1. Batch fetch all quotes
    console.log(`  Fetching quotes for: ${allTickers.join(", ")}`);
    const quotes = await fetchQuotes(allTickers);

    // 2. Analyze each ticker
    for (const ticker of allTickers) {
      const quote = quotes[ticker];
      if (!quote?.price) {
        log.results.push({ ticker, result: "no quote" });
        // This used to fail completely silently — no console line, no Discord,
        // nothing — which is exactly how /ES and /NQ went unnoticed for so long.
        // Surface it to admin so a bad/expired symbol is never invisible again.
        await dispatchSkip(ticker, "No quote returned from Schwab — check the symbol is correct/still active").catch(() => {});
        continue;
      }

      try {
        // Fetch options chain for equities (not futures)
        let chain = null;
        if (!ticker.startsWith("/")) {
          chain = await fetchOptionsChain(ticker, 5);
        }

        console.log(`  Analyzing ${ticker} @ $${quote.price}...`);
        const result = await analyzeWithClaude(ticker, quote, chain, phase);

        if (result.skip) {
          console.log(`     ↳ Skip: ${result.reason}`);
          log.results.push({ ticker, result: "no setup" });
          stats.signalsSkipped++;
          await dispatchSkip(ticker, result.reason);
        } else if (isRepeatSignal(ticker, result.side, result.type)) {
          // Same ticker, same direction, still inside the cooldown window —
          // this is the current move continuing, not a new setup. Log it to
          // admin only so you keep visibility without spamming subscribers.
          const minutesAgo = Math.round((Date.now() - lastSignalByTicker[ticker].at) / 60000);
          console.log(`     ↳ Throttled: ${ticker} ${result.side} ${result.type} repeat (last one ${minutesAgo}m ago)`);
          log.results.push({ ticker, result: "throttled (repeat)" });
          stats.signalsThrottled++;
          await dispatchSkip(ticker, `Repeat ${result.side} ${result.type} setup — already signaled ${minutesAgo}m ago, cooldown active`);
        } else {
          console.log(`     ↳ SIGNAL: ${result.side} ${result.type} ${result.expiry} @ ${result.confidence}% ✅`);
          log.results.push({ ticker, result: `${result.side} ${result.type} ${result.expiry} ${result.confidence}%` });
          stats.signalsGenerated++;
          lastSignalByTicker[ticker] = { side: result.side, type: result.type, at: Date.now() };

          const signal = {
            ...result,
            ticker,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ts: new Date().toISOString(),
            phase,
            aiGenerated: true,
            status: "pending",
            delivered: false,
          };

          signals = [signal, ...signals].slice(0, 300);
          await saveSignals();

          if (result.confidence < MIN_DISPATCH_CONFIDENCE) {
            console.log(`     ↳ Held: ${result.confidence}% is below the ${MIN_DISPATCH_CONFIDENCE}% dispatch bar`);
            await dispatchSkip(ticker, `${result.confidence}% confidence is below the ${MIN_DISPATCH_CONFIDENCE}% bar for alerting subscribers — held back to keep quality high`);
          } else if (dailySignalCount >= MAX_DAILY_SIGNALS) {
            console.log(`     ↳ Held: daily cap of ${MAX_DAILY_SIGNALS} signals already reached`);
            await dispatchSkip(ticker, `Daily cap of ${MAX_DAILY_SIGNALS} signals already reached — this ${result.confidence}% ${result.side} ${result.type} setup was held back from subscribers for today`);
          } else {
            dailySignalCount++;
            await dispatchSignal(signal);
            signal.delivered = true;
            await saveSignals();
            console.log(`     ↳ Sent to subscribers (${dailySignalCount}/${MAX_DAILY_SIGNALS} today)`);
          }
        }

        await sleep(1200); // Rate limit buffer between Claude calls
      } catch (e) {
        console.error(`  ✗ ${ticker}: ${e.message}`);
        log.results.push({ ticker, result: `error: ${e.message}` });
      }
    }
  } catch (e) {
    console.error("  ✗ Scan error:", e.message);
    log.error = e.message;
  }

  scanLog = [log, ...scanLog].slice(0, 50);
  isScanning = false;
  console.log(`  ✓ Done in ${((Date.now() - start) / 1000).toFixed(1)}s\n`);
  scheduleNextScan();
}

function scheduleNextScan() {
  if (scanTimer) clearTimeout(scanTimer);
  const phase = getMarketPhase();
  if (phase === "CLOSED") {
    nextScanAt = new Date(Date.now() + 5 * 60 * 1000);
    scanTimer = setTimeout(scheduleNextScan, 5 * 60 * 1000);
    console.log(`  💤 Market closed — next check ${nextScanAt.toLocaleTimeString()}`);
    return;
  }
  const ms = getScanInterval(phase);
  nextScanAt = new Date(Date.now() + ms);
  scanTimer = setTimeout(runScan, ms);
  console.log(`  ⏱ Next scan: ${nextScanAt.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false })} ET (${ms / 60000}min)`);
}

// ─── Express API ──────────────────────────────────────────────────────────────

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// ── Schwab OAuth routes ───────────────────────────────────────────────────────

// Step 1: Visit this to start auth
app.get("/auth", (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// Step 2: Schwab redirects here with the auth code
app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No auth code received");
  try {
    await exchangeCode(code);
    res.send(`
      <html><body style="font-family:monospace;background:#050c18;color:#00c97a;padding:40px">
        <h2>✓ Schwab Connected</h2>
        <p>AlertGods scanner is now authorized to access your Schwab account.</p>
        <p>Tokens saved. You can close this window.</p>
        <p style="color:#3a5a7a">Access tokens expire in 30 min (auto-refreshed). Refresh tokens expire in 7 days — re-visit /auth to renew.</p>
      </body></html>
    `);
  } catch (e) {
    res.status(500).send(`Auth failed: ${e.message}`);
  }
});

// ── Signal API ────────────────────────────────────────────────────────────────

app.get("/api/signals", (req, res) => {
  const { plan = "free", limit = 100 } = req.query;
  let filtered = signals.slice(0, parseInt(limit));

  // Gate futures signals to Pro only
  if (plan !== "pro") {
    filtered = filtered.filter(s => !s.isFutures && !s.ticker?.startsWith("/"));
  }
  res.json(filtered);
});

app.get("/api/status", (req, res) => {
  res.json({
    isScanning,
    scanningPaused,
    isMarketOpen: isMarketOpen(),
    marketPhase: getMarketPhase(),
    nextScanAt,
    scanInterval: getScanInterval(getMarketPhase()),
    schwabAuthorized: isAuthorized(),
    dailySignalCount,
    maxDailySignals: MAX_DAILY_SIGNALS,
    stats,
    lastLog: scanLog[0] || null,
  });
});

app.get("/api/logs", (req, res) => res.json(scanLog.slice(0, 20)));
app.get("/api/health", (req, res) => res.json({ ok: true, ts: new Date() }));

app.post("/api/scan", async (req, res) => {
  if (isScanning) return res.json({ ok: false, message: "Scan already running" });
  res.json({ ok: true, message: "Scan triggered" });
  runScan();
});

// Free signup — called from FreeSignupPage.jsx on submit. This is what actually
// persists free subscribers to subscribers.json; previously they only ever
// existed in Formspree/Discord, so /api/verify below could never find them.
app.post("/api/signup-free", async (req, res) => {
  const { name, email, discord } = req.body || {};
  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Enter a valid email address" });
  }
  try {
    addFreeSubscriber(email, name, discord);
    await saveSubscribers();
    res.json({ ok: true });
  } catch (e) {
    console.error("  [Signup-Free] Failed:", e.message);
    res.status(500).json({ error: "Could not save signup — try again" });
  }
});

// Admin-only: grant Pro access (Discord + SMS + dashboard) without going
// through Stripe checkout — for yourself, testers, or anyone you want to comp.
// Protect it by setting ADMIN_KEY in Railway; the route refuses every request
// until that env var exists, so it's inert until you turn it on. Call once with:
//   curl -X POST https://<your-railway-app>.up.railway.app/api/admin/add-pro \
//     -H "Content-Type: application/json" -H "x-admin-key: <your ADMIN_KEY>" \
//     -d '{"phone":"+15551234567","email":"you@example.com"}'
// (phone in E.164 format — country code + number, no spaces/dashes — since
// that's what Twilio requires for SMS delivery.)
app.post("/api/admin/add-pro", async (req, res) => {
  if (!process.env.ADMIN_KEY || req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { phone, email } = req.body || {};
  if (!email?.trim()) return res.status(400).json({ error: "email is required" });
  try {
    addProSubscriber(phone?.trim() || "", email.trim());
    await saveSubscribers();
    res.json({ ok: true, message: `${email} added as Pro (Discord${phone ? " + SMS" : ""} + dashboard)` });
  } catch (e) {
    console.error("  [Admin] add-pro failed:", e.message);
    res.status(500).json({ error: "Could not add subscriber" });
  }
});

// Admin-only: manually pause/resume scanning — for "I've got what I wanted
// today, stop spending on this" without touching Railway at all. Same
// ADMIN_KEY as add-pro above. Paused state is in-memory only, so it resets to
// running on every redeploy/restart — a normal push never leaves you stuck
// paused by accident.
app.post("/api/admin/pause", (req, res) => {
  if (!process.env.ADMIN_KEY || req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  scanningPaused = true;
  console.log("  ⏸ Scanning paused via /api/admin/pause");
  res.json({ ok: true, scanningPaused });
});

app.post("/api/admin/resume", (req, res) => {
  if (!process.env.ADMIN_KEY || req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  scanningPaused = false;
  console.log("  ▶ Scanning resumed via /api/admin/resume");
  res.json({ ok: true, scanningPaused });
});

// This lets the frontend verify a subscriber's email and get their plan
app.post("/api/verify", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const normalized = email.toLowerCase().trim();

  // Load subscribers from the in-memory list (kept in sync by Stripe webhooks)
  const subs = getSubscribers(); // { free: [...], pro: [...] }

  const isPro  = subs.pro.some(s => s.email?.toLowerCase() === normalized);
  const isFree = subs.free.some(s => s.email?.toLowerCase() === normalized);

  if (isPro)  return res.json({ email: normalized, plan: "pro" });
  if (isFree) return res.json({ email: normalized, plan: "free" });

  // Not in either list — genuinely unknown email. Free signups are persisted
  // immediately by POST /api/signup-free, so a legit free subscriber should
  // already be in subs.free by the time this is called.
  return res.json({ email: normalized, plan: "none" });
});

// ── Stripe webhook — auto-add/remove Pro subscribers ─────────────────────────
// (See stripe.js for the full implementation)
app.post("/api/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  try {
    const { handleStripeWebhook } = await import("./stripe.js");
    await handleStripeWebhook(req.body, sig);
    res.json({ received: true });
  } catch (e) {
    console.error("Stripe webhook error:", e.message);
    res.status(400).send(`Webhook Error: ${e.message}`);
  }
});
app.get("/api/quote", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });
  try {
    const quotes = await fetchQuotes([symbol]);
    const quote = quotes[symbol];
    if (!quote) return res.status(404).json({ error: `No quote for ${symbol}` });
    res.json(quote);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Options chain — called when admin clicks Generate in SignalComposer
app.get("/api/chain", async (req, res) => {
  const { symbol, maxDte = 5 } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });
  if (symbol.startsWith("/")) return res.json(null); // futures have no options chain
  try {
    const chain = await fetchOptionsChain(symbol, parseInt(maxDte));
    res.json(chain);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

async function start() {
  await loadData();
  await initSchwab();

  app.listen(PORT, () => {
    console.log(`\n◈ ALERTGODS SCANNER`);
    console.log(`  API:  http://localhost:${PORT}`);
    console.log(`  Auth: http://localhost:${PORT}/auth  ← visit this to connect Schwab`);
    console.log(`  Phase: ${getMarketPhase()}`);
    if (!process.env.ANTHROPIC_API_KEY) console.error("  ✗ ANTHROPIC_API_KEY missing");
    if (!process.env.TWILIO_ACCOUNT_SID) console.warn("  ⚠ Twilio not configured — SMS disabled");
    if (!process.env.DISCORD_WEBHOOK_FREE) console.warn("  ⚠ DISCORD_WEBHOOK_FREE not set");
    if (!process.env.DISCORD_WEBHOOK_PRO) console.warn("  ⚠ DISCORD_WEBHOOK_PRO not set");
    console.log();
  });

  if (isMarketOpen()) {
    console.log("  📈 Market open — starting scan...");
    await runScan();
  } else {
    scheduleNextScan();
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
start().catch(console.error);