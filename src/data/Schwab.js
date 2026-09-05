// ─────────────────────────────────────────────────────────────────────────────
// SCHWAB (formerly TD Ameritrade) API — browser-safe, options + futures
//
// SETUP (free with a Schwab brokerage account):
// 1. Go to developer.schwab.com → Create account → New App
// 2. Set redirect URI to http://localhost:5173/callback (for local dev)
// 3. Copy your App Key and App Secret
// 4. Add to .env:
//      VITE_SCHWAB_APP_KEY=your_app_key
//      VITE_SCHWAB_REDIRECT_URI=http://localhost:5173/callback
//
// AUTH FLOW:
// Schwab uses OAuth2. On first run you'll need to authorize via browser.
// After authorization you get an access token (30 min) + refresh token (7 days).
// Store tokens in localStorage and refresh automatically.
//
// WHY SCHWAB OVER TRADIER:
// ✅ Full real-time options chains with greeks (delta, gamma, theta, vega, IV)
// ✅ Futures: /ES, /NQ, /CL, /GC — all covered
// ✅ No CORS issues — browser requests work directly
// ✅ Free with any Schwab brokerage account
// ✅ Level 2 quotes (bid/ask with size)
// ─────────────────────────────────────────────────────────────────────────────

const APP_KEY = import.meta.env.VITE_SCHWAB_APP_KEY || "";
const REDIRECT_URI = import.meta.env.VITE_SCHWAB_REDIRECT_URI || "http://localhost:5173/callback";
const BASE = "https://api.schwabapi.com/marketdata/v1";
const AUTH_BASE = "https://api.schwabapi.com/v1/oauth";
const TOKEN_KEY = "schwab_tokens";

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function getTokens() {
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY)) || null; }
  catch { return null; }
}

function saveTokens(tokens) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ ...tokens, saved_at: Date.now() }));
}

export function isAuthorized() {
  const tokens = getTokens();
  return !!tokens?.access_token;
}

// Step 1: Redirect user to Schwab login
export function startAuth() {
  const url = `${AUTH_BASE}/authorize?response_type=code&client_id=${APP_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  window.location.href = url;
}

// Step 2: Exchange auth code for tokens (call this on the /callback page)
export async function handleCallback(code) {
  const credentials = btoa(`${APP_KEY}:${import.meta.env.VITE_SCHWAB_APP_SECRET}`);
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const tokens = await res.json();
  saveTokens(tokens);
  return tokens;
}

// Auto-refresh access token using refresh token
async function refreshAccessToken() {
  const tokens = getTokens();
  if (!tokens?.refresh_token) throw new Error("No refresh token — please re-authorize");
  const credentials = btoa(`${APP_KEY}:${import.meta.env.VITE_SCHWAB_APP_SECRET}`);
  const res = await fetch(`${AUTH_BASE}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: tokens.refresh_token }),
  });
  if (!res.ok) throw new Error("Token refresh failed — please re-authorize");
  const newTokens = await res.json();
  saveTokens(newTokens);
  return newTokens.access_token;
}

async function getAccessToken() {
  const tokens = getTokens();
  if (!tokens) throw new Error("Not authorized — call startAuth() first");
  // Schwab access tokens expire in 30 min
  const age = (Date.now() - (tokens.saved_at || 0)) / 1000;
  if (age > 1700) return refreshAccessToken(); // refresh with 100s buffer
  return tokens.access_token;
}

async function schwabFetch(path) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Schwab ${res.status}: ${text.slice(0, 120)}`);
  }
  return res.json();
}

// ─── Market data functions ────────────────────────────────────────────────────

// Get real-time quote for any symbol (stocks, ETFs, futures)
// Futures symbols: /ES, /NQ, /CL, /GC etc. — Schwab uses the slash prefix natively
export async function fetchQuote(symbol) {
  // Schwab futures format: /ES → %2FES in URL
  const encoded = encodeURIComponent(symbol);
  const data = await schwabFetch(`/quotes?symbols=${encoded}&fields=quote,reference`);
  const q = data[symbol]?.quote;
  const ref = data[symbol]?.reference;
  if (!q) throw new Error(`No quote for ${symbol}`);

  const isFutures = symbol.startsWith("/");
  return {
    symbol,
    price: q.lastPrice ?? q.mark,
    bid: q.bidPrice,
    ask: q.askPrice,
    open: q.openPrice,
    high: q.highPrice,
    low: q.lowPrice,
    change: q.netChange,
    changePct: q.netPercentChange,
    volume: q.totalVolume,
    mark: q.mark,
    isFutures,
    // Futures-specific
    ...(isFutures && {
      tickSize: ref?.futureTickSize,
      tickValue: ref?.futureTickValue,
      multiplier: ref?.futureMultiplier,
    }),
  };
}

// Batch quote for multiple symbols
export async function fetchQuotes(symbols) {
  const encoded = symbols.map(s => encodeURIComponent(s)).join("%2C");
  const data = await schwabFetch(`/quotes?symbols=${encoded}&fields=quote`);
  const result = {};
  for (const [sym, val] of Object.entries(data)) {
    const q = val.quote;
    if (q) result[sym] = {
      symbol: sym, price: q.lastPrice ?? q.mark,
      bid: q.bidPrice, ask: q.askPrice,
      open: q.openPrice, high: q.highPrice, low: q.lowPrice,
      change: q.netChange, changePct: q.netPercentChange,
      volume: q.totalVolume, isFutures: sym.startsWith("/"),
    };
  }
  return result;
}

// Get options chain for a symbol — 0-5DTE, with full greeks
export async function fetchOptionsChain(symbol, maxDte = 5) {
  if (symbol.startsWith("/")) return null; // futures don't have option chains this way

  const toDate = new Date();
  toDate.setDate(toDate.getDate() + maxDte);
  const toDateStr = toDate.toISOString().split("T")[0]; // YYYY-MM-DD

  const data = await schwabFetch(
    `/chains?symbol=${encodeURIComponent(symbol)}&contractType=ALL&includeUnderlyingQuote=true&strategy=SINGLE&toDate=${toDateStr}&optionType=S`
  );

  if (data.status === "FAILED") throw new Error("No options chain available");

  const underlyingPrice = data.underlyingPrice;
  const allExp = { ...data.callExpDateMap, ...(data.putExpDateMap || {}) };

  // Parse into flat list
  const options = [];
  for (const [expKey, strikes] of Object.entries(data.callExpDateMap || {})) {
    const [dateStr, dteStr] = expKey.split(":");
    const dte = parseInt(dteStr);
    for (const [strike, contracts] of Object.entries(strikes)) {
      const c = contracts[0];
      if (!c) continue;
      options.push({
        option_type: "call",
        strike: parseFloat(strike),
        expiration: dateStr,
        dte,
        last: c.last,
        bid: c.bid,
        ask: c.ask,
        volume: c.totalVolume,
        open_interest: c.openInterest,
        greeks: {
          delta: c.delta,
          gamma: c.gamma,
          theta: c.theta,
          vega: c.vega,
          rho: c.rho,
          smv_vol: c.volatility / 100, // Schwab gives % not decimal
        },
        iv: c.volatility,
        inTheMoney: c.inTheMoney,
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
        option_type: "put",
        strike: parseFloat(strike),
        expiration: dateStr,
        dte,
        last: c.last,
        bid: c.bid,
        ask: c.ask,
        volume: c.totalVolume,
        open_interest: c.openInterest,
        greeks: {
          delta: c.delta,
          gamma: c.gamma,
          theta: c.theta,
          vega: c.vega,
          rho: c.rho,
          smv_vol: c.volatility / 100,
        },
        iv: c.volatility,
        inTheMoney: c.inTheMoney,
      });
    }
  }

  // Find the nearest expiration within maxDte
  const dtes = [...new Set(options.map(o => o.dte))].sort((a, b) => a - b);
  const nearestDte = dtes[0] ?? 0;
  const nearestExp = options.find(o => o.dte === nearestDte)?.expiration;
  const dteLabel = nearestDte === 0 ? "0DTE" : nearestDte === 1 ? "1DTE" : nearestDte === 2 ? "2DTE" : `${nearestDte}DTE`;

  // Filter to nearest expiry, sort by volume
  const chainOpts = options
    .filter(o => o.dte === nearestDte)
    .sort((a, b) => (b.volume || 0) - (a.volume || 0));

  const calls = chainOpts.filter(o => o.option_type === "call").slice(0, 8);
  const puts  = chainOpts.filter(o => o.option_type === "put").slice(0, 8);

  return {
    underlyingPrice,
    expiration: nearestExp,
    dte: nearestDte,
    dteLabel,
    calls,
    puts,
    allOptions: [...calls, ...puts],
    allExpirations: dtes.map(d => {
      const exp = options.find(o => o.dte === d);
      return { dte: d, date: exp?.expiration };
    }),
  };
}

// Format for Claude — same interface as before, drop-in replacement
export function formatForClaude({ symbol, quote, chain }) {
  let ctx = `TICKER: ${symbol}\n`;
  ctx += `PRICE: $${quote.price} (${quote.change >= 0 ? "+" : ""}${quote.change?.toFixed(2)}, ${quote.changePct >= 0 ? "+" : ""}${quote.changePct?.toFixed(2)}%)\n`;
  ctx += `BID: $${quote.bid} | ASK: $${quote.ask}\n`;
  ctx += `TODAY: Open $${quote.open} | High $${quote.high} | Low $${quote.low}\n`;
  ctx += `VOLUME: ${(quote.volume / 1000).toFixed(0)}K\n`;

  if (quote.isFutures) {
    ctx += `TYPE: Futures contract\n`;
    if (quote.tickValue) ctx += `Tick value: $${quote.tickValue} per ${quote.tickSize} tick\n`;
  }

  if (chain) {
    ctx += `\n${chain.dteLabel} OPTIONS CHAIN (exp: ${chain.expiration}, DTE: ${chain.dte})\n`;
    ctx += `Underlying: $${chain.underlyingPrice}\n`;
    ctx += `TOP CALLS by volume:\n`;
    chain.calls.forEach(o => {
      ctx += `  CALL $${o.strike} | Last $${o.last ?? "—"} | Bid $${o.bid ?? "—"} | Ask $${o.ask ?? "—"} | Vol ${o.volume ?? 0} | OI ${o.open_interest ?? 0}`;
      if (o.greeks) {
        ctx += ` | IV ${o.iv?.toFixed(1) ?? "—"}%`;
        ctx += ` | Δ ${o.greeks.delta?.toFixed(2) ?? "—"}`;
        ctx += ` | Γ ${o.greeks.gamma?.toFixed(4) ?? "—"}`;
        ctx += ` | Θ ${o.greeks.theta?.toFixed(3) ?? "—"}`;
        ctx += ` | V ${o.greeks.vega?.toFixed(3) ?? "—"}`;
      }
      if (o.inTheMoney) ctx += ` | ITM`;
      ctx += "\n";
    });
    ctx += `TOP PUTS by volume:\n`;
    chain.puts.forEach(o => {
      ctx += `  PUT $${o.strike} | Last $${o.last ?? "—"} | Bid $${o.bid ?? "—"} | Ask $${o.ask ?? "—"} | Vol ${o.volume ?? 0} | OI ${o.open_interest ?? 0}`;
      if (o.greeks) {
        ctx += ` | IV ${o.iv?.toFixed(1) ?? "—"}%`;
        ctx += ` | Δ ${o.greeks.delta?.toFixed(2) ?? "—"}`;
        ctx += ` | Θ ${o.greeks.theta?.toFixed(3) ?? "—"}`;
      }
      if (o.inTheMoney) ctx += ` | ITM`;
      ctx += "\n";
    });

    if (chain.allExpirations?.length > 1) {
      ctx += `\nAll available expirations within ${5}DTE: `;
      ctx += chain.allExpirations.map(e => `${e.date}(${e.dte}DTE)`).join(", ");
      ctx += "\n";
    }
  }
  return ctx;
}

// ─── Auth status component (drop this in AlertSettings or AdminPanel) ─────────
export function SchwabAuthStatus({ onNavigate }) {
  const authed = isAuthorized();
  const mono = "'JetBrains Mono','Fira Code',monospace";

  if (authed) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontFamily: mono }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00c97a", display: "inline-block" }} />
        <span style={{ color: "#00c97a" }}>Schwab connected — real-time data active</span>
        <button onClick={() => { localStorage.removeItem("schwab_tokens"); window.location.reload(); }}
          style={{ background: "none", border: "1px solid #2a1a1a", color: "#6a3a3a", fontFamily: mono, fontSize: 9, padding: "2px 8px", borderRadius: 2, cursor: "pointer", marginLeft: 8 }}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 3, padding: "16px 18px" }}>
      <div style={{ fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 10, fontFamily: mono }}>◆ SCHWAB MARKET DATA</div>
      <p style={{ fontSize: 12, color: "#3a5a7a", lineHeight: 1.7, marginBottom: 14 }}>
        Connect your free Schwab developer account for real-time options chains with full greeks, and futures quotes (/ES, /NQ, /CL).
      </p>
      <button
        onClick={startAuth}
        style={{ background: "#00c97a", color: "#030f08", border: "none", padding: "9px 18px", borderRadius: 2, fontFamily: mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", cursor: "pointer" }}
      >
        CONNECT SCHWAB →
      </button>
      <div style={{ fontSize: 10, color: "#1e2a38", marginTop: 10, lineHeight: 1.7 }}>
        Free at <span style={{ color: "#4a9adf" }}>developer.schwab.com</span> · requires Schwab brokerage account
      </div>
    </div>
  );
}