// ─────────────────────────────────────────────────────────────────────────────
// SIGNALOS AUTONOMOUS SCANNER
// Run with: node scanner.js
// Keep this running on your computer during market hours.
// Your React app reads signals from this via http://localhost:3001
// ─────────────────────────────────────────────────────────────────────────────

import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { scanAllTickers } from "./tradier.js";
import { analyzeWithClaude } from "src/services/claude.js";
import { sendDiscord } from "./notify.js";
import { isMarketOpen, getMarketPhase, getScanInterval } from "./marketHours.js";

config(); // load .env

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIGNALS_FILE = path.join(__dirname, "signals.json");
const PORT = 3001;

// ─── State ────────────────────────────────────────────────────────────────────
let signals = [];
let scanLog = [];
let isScanning = false;
let nextScanAt = null;
let scanTimer = null;
let stats = { totalScans: 0, signalsGenerated: 0, signalsSkipped: 0, lastScan: null };

// Load saved signals on startup
async function loadSignals() {
  try {
    const data = await fs.readFile(SIGNALS_FILE, "utf8");
    signals = JSON.parse(data);
    console.log(`📂 Loaded ${signals.length} saved signals`);
  } catch {
    signals = [];
  }
}

async function saveSignals() {
  await fs.writeFile(SIGNALS_FILE, JSON.stringify(signals.slice(0, 200), null, 2));
}

// ─── Core scan logic ──────────────────────────────────────────────────────────
async function runScan() {
  if (isScanning) return;
  isScanning = true;
  const phase = getMarketPhase();
  const scanStart = new Date();
  
  console.log(`\n🔍 [${scanStart.toLocaleTimeString()}] Scan starting — market phase: ${phase}`);
  stats.totalScans++;
  stats.lastScan = scanStart;

  const log = { ts: scanStart, phase, results: [] };

  try {
    // 1. Fetch market data for all tickers
    console.log("  📡 Fetching market data...");
    const marketData = await scanAllTickers(phase);

    // 2. Analyze each ticker with Claude
    for (const data of marketData) {
      try {
        console.log(`  🤖 Analyzing ${data.ticker}...`);
        const result = await analyzeWithClaude(data, phase);

        if (result.skip) {
          console.log(`     ↳ ${data.ticker}: no setup`);
          log.results.push({ ticker: data.ticker, result: "no setup" });
          stats.signalsSkipped++;
        } else {
          console.log(`     ↳ ${data.ticker}: ${result.side} ${result.type} ${result.confidence}% conf ✅`);
          log.results.push({ ticker: data.ticker, result: `${result.side} ${result.type} @ ${result.confidence}%` });
          stats.signalsGenerated++;

          const signal = {
            ...result,
            id: Date.now() + Math.random(),
            ts: new Date().toISOString(),
            delivered: false,
            aiGenerated: true,
            phase,
          };

          // Add to signals list
          signals = [signal, ...signals].slice(0, 200);
          await saveSignals();

          // Fire Discord notification
          if (process.env.DISCORD_WEBHOOK) {
            await sendDiscord(process.env.DISCORD_WEBHOOK, signal);
            signal.delivered = true;
            await saveSignals();
          }
        }

        // Small delay between Claude calls to avoid rate limits
        await sleep(1200);

      } catch (err) {
        console.log(`     ↳ ${data.ticker}: error — ${err.message}`);
        log.results.push({ ticker: data.ticker, result: `error: ${err.message}` });
      }
    }
  } catch (err) {
    console.error("  ❌ Scan error:", err.message);
    log.error = err.message;
  }

  scanLog = [log, ...scanLog].slice(0, 50);
  isScanning = false;
  console.log(`  ✓ Scan complete in ${((Date.now() - scanStart) / 1000).toFixed(1)}s`);

  // Schedule next scan
  scheduleNextScan();
}

function scheduleNextScan() {
  if (scanTimer) clearTimeout(scanTimer);

  const phase = getMarketPhase();
  if (phase === "CLOSED") {
    console.log("  💤 Market closed — will check again in 5 minutes");
    nextScanAt = new Date(Date.now() + 5 * 60 * 1000);
    scanTimer = setTimeout(scheduleNextScan, 5 * 60 * 1000);
    return;
  }

  const intervalMs = getScanInterval(phase);
  nextScanAt = new Date(Date.now() + intervalMs);
  console.log(`  ⏱ Next scan in ${intervalMs / 60000} min at ${nextScanAt.toLocaleTimeString()}`);
  scanTimer = setTimeout(runScan, intervalMs);
}

// ─── Express API for React frontend ──────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Get all signals (newest first)
app.get("/api/signals", (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json(signals.slice(0, limit));
});

// Get scanner status
app.get("/api/status", (req, res) => {
  res.json({
    isScanning,
    isMarketOpen: isMarketOpen(),
    marketPhase: getMarketPhase(),
    nextScanAt,
    scanInterval: getScanInterval(getMarketPhase()),
    stats,
    lastLog: scanLog[0] || null,
  });
});

// Get scan logs
app.get("/api/logs", (req, res) => {
  res.json(scanLog.slice(0, 20));
});

// Trigger a manual scan
app.post("/api/scan", async (req, res) => {
  if (isScanning) return res.json({ ok: false, message: "Scan already running" });
  res.json({ ok: true, message: "Scan started" });
  runScan(); // don't await — runs in background
});

// Mark a signal as approved/dismissed
app.patch("/api/signals/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "approved" | "dismissed"
  signals = signals.map(s =>
    String(s.id) === String(id) ? { ...s, status } : s
  );
  saveSignals();
  res.json({ ok: true });
});

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true, ts: new Date() }));

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
  await loadSignals();
  app.listen(PORT, () => {
    console.log(`\n◈ SIGNALOS SCANNER`);
    console.log(`  API running at http://localhost:${PORT}`);
    console.log(`  Market phase: ${getMarketPhase()}`);
    console.log(`  Scan interval: ${getScanInterval(getMarketPhase()) / 60000} min\n`);
  });

  // Start first scan immediately if market is open, else schedule
  if (isMarketOpen()) {
    console.log("  📈 Market is open — starting first scan...");
    await runScan();
  } else {
    console.log("  🌙 Market is closed — waiting for open...");
    scheduleNextScan();
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

start().catch(console.error);