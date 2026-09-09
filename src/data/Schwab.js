// ─────────────────────────────────────────────────────────────────────────────
// SCHWAB / THINKORSWIM API CLIENT
// scanner/schwab.js  — runs in Node.js (not the browser)
//
// SETUP:
//   1. Go to developer.schwab.com → Create App
//   2. Callback URL: http://localhost:3001/callback
//   3. Wait for "Ready for use" status (2-5 days)
//   4. Add to scanner/.env:
//        SCHWAB_APP_KEY=your_key
//        SCHWAB_APP_SECRET=your_secret
//        SCHWAB_REDIRECT_URI=http://localhost:3001/callback
// ─────────────────────────────────────────────────────────────────────────────

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = path.join(__dirname, ".schwab_tokens.json");

const APP_KEY      = process.env.SCHWAB_APP_KEY;
const APP_SECRET   = process.env.SCHWAB_APP_SECRET;
const REDIRECT_URI = process.env.SCHWAB_REDIRECT_URI || "http://localhost:3001/callback";
const BASE         = "https://api.schwabapi.com/marketdata/v1";
const AUTH_BASE    = "https://api.schwabapi.com/v1/oauth";

// ─── Token management ─────────────────────────────────────────────────────────

let _tokens = null;

async function loadTokens() {
  try {
    const data = await fs.readFile(TOKEN_FILE, "utf8");
    _tokens = JSON.parse(data);
    console.log("  [Schwab] Tokens loaded from disk");
  } catch {
    _tokens = null;
  }
}

async function saveTokens(tokens) {
  _tokens = { ...tokens, saved_at: Date.now() };
  await fs.writeFile(TOKEN_FILE, JSON.stringify(_tokens, null, 2));
}

export function getAuthUrl() {
  return `${AUTH_BASE}/authorize?response_type=code&client_id=${APP_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
}

export async function exchangeCode(code) {
  const credentials = Buffer.from(`${APP_KEY}:${APP_SECRET}`).toString("base64");
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  if (!res.ok) throw new Error(`Auth exchange failed: ${res.status} ${await res.text()}`);
  const tokens = await res.json();
  await saveTokens(tokens);
  console.log("  [Schwab] Authorized successfully");
  return tokens;
}

async function refreshTokens() {
  if (!_tokens?.refresh_token) throw new Error("No refresh token — re-authorize at /auth");
  const credentials = Buffer.from(`${APP_KEY}:${APP_SECRET}`).toString("base64");
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: _tokens.refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} — re-authorize at /auth`);
  const tokens = await res.json();
  await saveTokens(tokens);
  console.log("  [Schwab] Tokens refreshed");
  return tokens.access_token;
}

async function getAccessToken() {
  if (!_tokens) await loadTokens();
  if (!_tokens?.access_token) throw new Error("Not authorized — visit http://localhost:3001/auth");
  const age = (Date.now() - (_tokens.saved_at || 0)) / 1000;
  if (age > 1700) return refreshTokens(); // Refresh 100s before 30min expiry
  return _tokens.access_token;
}

export function isAuthorized() {
  return !!_tokens?.access_token;
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function schwabFetch(path) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Schwab ${res.status}: ${text.slice(0, 150)}`);
  }
  return res.json();
}

// Batch quotes — stocks, ETFs, and futures all in one call
// Futures symbols: /ES, /NQ, /CL, /GC (Schwab uses the slash prefix natively)
export async function fetchQuotes(symbols) {
  const encoded = symbols.map(s => encodeURIComponent(s)).join(",");
  const data = await schwabFetch(`/quotes?symbols=${encoded}&fields=quote`);
  const result = {};
  for (const [sym, val] of Object.entries(data || {})) {
    const q = val.quote;
    if (!q) continue;
    result[sym] = {
      symbol: sym,
      price: q.lastPrice ?? q.mark ?? q.closePrice,
      bid: q.bidPrice,
      ask: q.askPrice,
      open: q.openPrice,
      high: q.highPrice,
      low: q.lowPrice,
      change: q.netChange,
      changePct: q.netPercentChange,
      volume: q.totalVolume,
      mark: q.mark,
      isFutures: sym.startsWith("/"),
    };
  }
  return result;
}

// 0-5DTE options chain with full Greeks
export async function fetchOptionsChain(symbol, maxDte = 5) {
  if (symbol.startsWith("/")) return null;
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + maxDte);
  const toDateStr = toDate.toISOString().split("T")[0];
  const data = await schwabFetch(
    `/chains?symbol=${encodeURIComponent(symbol)}&contractType=ALL&includeUnderlyingQuote=true&strategy=SINGLE&toDate=${toDateStr}&optionType=S`
  );
  if (data.status === "FAILED" || !data.callExpDateMap) return null;

  const underlyingPrice = data.underlyingPrice;
  const options = [];

  for (const [expKey, strikes] of Object.entries(data.callExpDateMap || {})) {
    const [dateStr, dteStr] = expKey.split(":");
    const dte = parseInt(dteStr);
    for (const [strike, contracts] of Object.entries(strikes)) {
      const c = contracts[0];
      if (!c) continue;
      options.push({
        option_type: "call", strike: parseFloat(strike),
        expiration: dateStr, dte,
        last: c.last, bid: c.bid, ask: c.ask,
        volume: c.totalVolume, open_interest: c.openInterest,
        greeks: { delta: c.delta, gamma: c.gamma, theta: c.theta, vega: c.vega, smv_vol: c.volatility ? c.volatility / 100 : null },
        iv: c.volatility, inTheMoney: c.inTheMoney,
      });
    }
  }
  for (const [expKey, strikes] of Object.entries(data.putExpDateMap || {})) {
    const [dateStr, dteStr] = expKey.split(":");
    const dte = parseInt(dteStr);
    for (const [strike, contracts] of Object.entries(strikes)) {
      const c = contracts[0];
      if (!c) continue;
      options.push({
        option_type: "put", strike: parseFloat(strike),
        expiration: dateStr, dte,
        last: c.last, bid: c.bid, ask: c.ask,
        volume: c.totalVolume, open_interest: c.openInterest,
        greeks: { delta: c.delta, gamma: c.gamma, theta: c.theta, vega: c.vega, smv_vol: c.volatility ? c.volatility / 100 : null },
        iv: c.volatility, inTheMoney: c.inTheMoney,
      });
    }
  }

  // Find nearest expiry within maxDte
  const dtes = [...new Set(options.map(o => o.dte))].sort((a, b) => a - b);
  const nearestDte = dtes[0] ?? 0;
  const dteLabel = nearestDte === 0 ? "0DTE" : `${nearestDte}DTE`;
  const chainOpts = options
    .filter(o => o.dte === nearestDte)
    .sort((a, b) => (b.volume || 0) - (a.volume || 0));

  return {
    underlyingPrice,
    expiration: chainOpts[0]?.expiration,
    dte: nearestDte,
    dteLabel,
    calls: chainOpts.filter(o => o.option_type === "call").slice(0, 8),
    puts:  chainOpts.filter(o => o.option_type === "put").slice(0, 8),
    allExpirations: dtes.map(d => ({ dte: d, date: options.find(o => o.dte === d)?.expiration })),
  };
}

// Initialize — load saved tokens on startup
export async function initSchwab() {
  await loadTokens();
  if (_tokens) {
    console.log("  [Schwab] Ready — tokens loaded");
    // Pre-refresh if close to expiry
    const age = (Date.now() - (_tokens.saved_at || 0)) / 1000;
    if (age > 1700) await refreshTokens().catch(e => console.warn("  [Schwab] Pre-refresh failed:", e.message));
  } else {
    console.warn("  [Schwab] Not authorized — visit http://localhost:3001/auth to connect");
  }
}