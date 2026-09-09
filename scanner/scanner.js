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

import { initSchwab, getAuthUrl, exchangeCode, fetchQuotes, fetchOptionsChain, isAuthorized } from "./schwab.js";
import { analyzeWithClaude } from "./claude.js";
import { dispatchSignal, dispatchSkip, setSubscribers } from "./notify.js";
import { isMarketOpen, getMarketPhase, getScanInterval } from "./marketHours.js";

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIGNALS_FILE    = path.join(__dirname, "signals.json");
const SUBSCRIBERS_FILE = path.join(__dirname, "subscribers.json");
const PORT = process.env.PORT || 3001;

// Tickers to scan — equities + futures
const EQUITY_TICKERS  = ["SPY","QQQ","IWM","AAPL","TSLA","NVDA","MSFT","AMZN","META","AMD","AVGO"];
const FUTURES_TICKERS = ["/ES", "/NQ"]; // PRO ONLY — Schwab supports these natively
const SKIP_IN_MID     = ["TSLA","AMD","AVGO"]; // too erratic mid-day for 0DTE

let signals    = [];
let scanLog    = [];
let isScanning = false;
let nextScanAt = null;
let scanTimer  = null;
let stats      = { totalScans: 0, signalsGenerated: 0, signalsSkipped: 0, lastScan: null };

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

  isScanning = true;
  const phase = getMarketPhase();
  const start = new Date();
  console.log(`\n🔍 [${start.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false })} ET] Scanning — phase: ${phase}`);

  stats.totalScans++;
  stats.lastScan = start;
  const log = { ts: start.toISOString(), phase, results: [] };

  // Determine which tickers to scan this phase
  let equities = phase === "MID"
    ? EQUITY_TICKERS.filter(t => !SKIP_IN_MID.includes(t))
    : EQUITY_TICKERS;

  const allTickers = [...equities, ...FUTURES_TICKERS];

  try {
    // 1. Batch fetch all quotes
    console.log(`  Fetching quotes for: ${allTickers.join(", ")}`);
    const quotes = await fetchQuotes(allTickers);

    // 2. Analyze each ticker
    for (const ticker of allTickers) {
      const quote = quotes[ticker];
      if (!quote?.price) {
        log.results.push({ ticker, result: "no quote" });
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
        } else {
          console.log(`     ↳ SIGNAL: ${result.side} ${result.type} ${result.expiry} @ ${result.confidence}% ✅`);
          log.results.push({ ticker, result: `${result.side} ${result.type} ${result.expiry} ${result.confidence}%` });
          stats.signalsGenerated++;

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
          await dispatchSignal(signal);
          signal.delivered = true;
          await saveSignals();
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
    isMarketOpen: isMarketOpen(),
    marketPhase: getMarketPhase(),
    nextScanAt,
    scanInterval: getScanInterval(getMarketPhase()),
    schwabAuthorized: isAuthorized(),
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