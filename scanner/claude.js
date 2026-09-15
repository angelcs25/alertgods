// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE SIGNAL ANALYZER
// scanner/claude.js
//
// This is the core of the scanner. It takes real market data from Schwab
// and asks Claude to decide: is there a tradeable setup or not?
// ─────────────────────────────────────────────────────────────────────────────

import { getPhaseContext } from "./marketHours.js";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// ─── Build the market data context string ─────────────────────────────────────

export function buildMarketContext(symbol, quote, chain, phase) {
  let ctx = "";

  // Header
  ctx += `═══════════════════════════════════════\n`;
  ctx += `TICKER: ${symbol}\n`;
  ctx += `MARKET PHASE: ${phase} — ${getPhaseContext(phase)}\n`;
  ctx += `SCAN TIME: ${new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false })} ET\n`;
  ctx += `═══════════════════════════════════════\n\n`;

  // Quote data
  ctx += `PRICE ACTION:\n`;
  ctx += `  Last:   $${quote.price}\n`;
  ctx += `  Bid/Ask: $${quote.bid} / $${quote.ask}  (spread: $${((quote.ask || 0) - (quote.bid || 0)).toFixed(2)})\n`;
  ctx += `  Change: ${quote.change >= 0 ? "+" : ""}${quote.change?.toFixed(2)} (${quote.changePct >= 0 ? "+" : ""}${quote.changePct?.toFixed(2)}%)\n`;
  ctx += `  Open: $${quote.open}  High: $${quote.high}  Low: $${quote.low}\n`;
  ctx += `  Range: $${((quote.high || 0) - (quote.low || 0)).toFixed(2)} (${(((quote.high - quote.low) / quote.open) * 100).toFixed(2)}% of open)\n`;
  ctx += `  Volume: ${(quote.volume / 1000).toFixed(0)}K\n\n`;

  if (quote.isFutures) {
    ctx += `TYPE: Futures contract — no options chain\n`;
    ctx += `Focus on: momentum, key levels, VWAP proximity, volume\n\n`;
  }

  // Options chain
  if (chain) {
    ctx += `OPTIONS CHAIN — ${chain.dteLabel} (exp: ${chain.expiration}, DTE: ${chain.dte})\n`;
    ctx += `Underlying: $${chain.underlyingPrice}\n\n`;

    ctx += `TOP CALLS by volume:\n`;
    chain.calls.forEach(o => {
      const spread = ((o.ask || 0) - (o.bid || 0)).toFixed(2);
      ctx += `  CALL $${o.strike}`;
      ctx += ` | Last $${o.last ?? "—"}`;
      ctx += ` | Bid $${o.bid ?? "—"} / Ask $${o.ask ?? "—"} (spread $${spread})`;
      ctx += ` | Vol ${(o.volume || 0).toLocaleString()}`;
      ctx += ` | OI ${(o.open_interest || 0).toLocaleString()}`;
      if (o.greeks?.delta != null)  ctx += ` | Δ ${o.greeks.delta.toFixed(2)}`;
      if (o.greeks?.gamma != null)  ctx += ` | Γ ${o.greeks.gamma.toFixed(4)}`;
      if (o.greeks?.theta != null)  ctx += ` | Θ ${o.greeks.theta.toFixed(3)}`;
      if (o.greeks?.vega != null)   ctx += ` | V ${o.greeks.vega.toFixed(3)}`;
      if (o.iv != null)             ctx += ` | IV ${o.iv.toFixed(1)}%`;
      if (o.inTheMoney)             ctx += ` | ITM`;
      ctx += "\n";
    });

    ctx += `\nTOP PUTS by volume:\n`;
    chain.puts.forEach(o => {
      const spread = ((o.ask || 0) - (o.bid || 0)).toFixed(2);
      ctx += `  PUT  $${o.strike}`;
      ctx += ` | Last $${o.last ?? "—"}`;
      ctx += ` | Bid $${o.bid ?? "—"} / Ask $${o.ask ?? "—"} (spread $${spread})`;
      ctx += ` | Vol ${(o.volume || 0).toLocaleString()}`;
      ctx += ` | OI ${(o.open_interest || 0).toLocaleString()}`;
      if (o.greeks?.delta != null)  ctx += ` | Δ ${o.greeks.delta.toFixed(2)}`;
      if (o.greeks?.theta != null)  ctx += ` | Θ ${o.greeks.theta.toFixed(3)}`;
      if (o.iv != null)             ctx += ` | IV ${o.iv.toFixed(1)}%`;
      if (o.inTheMoney)             ctx += ` | ITM`;
      ctx += "\n";
    });

    if (chain.allExpirations?.length > 1) {
      ctx += `\nAll expirations within 5DTE: `;
      ctx += chain.allExpirations.map(e => `${e.date}(${e.dte}DTE)`).join(", ");
      ctx += "\n";
    }
  }

  return ctx;
}

// ─── The Claude prompt ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a professional 0-5DTE options and futures signal analyst for AlertGods, an elite trading alert service.

You receive REAL, LIVE market data from the Schwab ThinkorSwim API: actual current prices, today's OHLCV, bid/ask spreads, and the full options chain with greeks (delta, gamma, theta, vega, IV) for the nearest expiration.

YOUR JOB: Determine if there is a HIGH-QUALITY, actionable setup RIGHT NOW. Be selective — only generate signals with a genuine edge. It is better to skip 10 setups than to send one bad signal to subscribers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SIGNAL CRITERIA (ALL must be met):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DIRECTION is clear — price action shows a definitive bias (not choppy, not mid-range with no catalyst)
2. VOLUME confirms — current volume is meaningful relative to the day's pattern
3. STRIKE makes sense — choose a strike from the actual chain with:
   - Delta between 0.35–0.65 for directional plays (higher delta = more expensive but cleaner)
   - Reasonable IV (not buying high IV into earnings/events unless catalyst-driven)
   - Adequate volume and OI (avoid illiquid strikes — wide spreads kill P&L)
   - Bid/ask spread < 15% of the mid price ideally
4. RISK/REWARD is defined — stop and target at real technical levels (today's high/low, round numbers, VWAP proximity)
5. TIME makes sense — for 0DTE: entry before 3pm ET. Mid-day 0DTE in choppy tape = skip.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE-SPECIFIC RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPEN (9:30–10:30 AM):     Min confidence 65%. Directional momentum. Volume spike entries.
MID  (10:30 AM–3:00 PM):  Min confidence 82%. Very selective. Theta killing 0DTE. Only crystal clear setups.
POWER_HOUR (3–4 PM):      Min confidence 72%. Momentum continuation or reversal. 0DTE gamma extreme — tight stops.
PRE_MARKET (6–9:30 AM):   Min confidence 65%. Gap plays. Wider spreads expected — note in rationale.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPOND WITH VALID JSON ONLY — no markdown, no backticks, no explanation outside the JSON:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If there IS a high-quality setup:
{
  "skip": false,
  "ticker": string,
  "side": "BUY" | "SELL",
  "type": "CALL" | "PUT" | "FUT",
  "price": string (the EXACT current price from data — never estimate),
  "strike": string (specific from chain, e.g. "480C @ 3.20" or "480P @ 2.85"),
  "expiry": "0DTE" | "1DTE" | "2DTE" | "3DTE" | "4DTE" | "5DTE",
  "stop": string (specific stock price level — not a percentage),
  "target": string (specific stock price level — not a percentage),
  "strategy": string (one of: RSI Divergence | MACD Cross | EMA Breakout | Volume Spike | BB Squeeze | Order Flow | VWAP Reclaim | Support Bounce | Resistance Break | Gap Fill),
  "tf": "1m" | "5m" | "15m" | "30m",
  "confidence": number (integer, phase minimum to 95),
  "isFutures": boolean,
  "notes": string (2-3 sentences: what the data shows RIGHT NOW, why this specific entry, the key level to watch)
}

If there is NO clear setup:
{
  "skip": true,
  "reason": string (specific: e.g. "Low volume on SPY, price choppy between 479-481 with no directional bias" — not generic)
}`;

// ─── Main analyzer function ───────────────────────────────────────────────────

export async function analyzeWithClaude(symbol, quote, chain, phase) {
  if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not set in .env");

  const marketContext = buildMarketContext(symbol, quote, chain, phase);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: marketContext }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err.slice(0, 120)}`);
  }

  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "";

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error(`Claude returned invalid JSON: ${text.slice(0, 100)}`);
  }
}