// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE SIGNAL ANALYZER
// Sends real market data → gets structured signal or "skip"
// ─────────────────────────────────────────────────────────────────────────────

import { formatForClaude } from "src/data/tradier.js";
import { getPhaseContext } from "src/scanner/marketHours.js";

const ANTHROPIC_KEY = process.env.VITE_ANTHROPIC_API_KEY;

export async function analyzeWithClaude(data, phase) {
  if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not set in .env");

  const marketContext = formatForClaude(data);
  const phaseContext  = getPhaseContext(phase);
  const now = new Date().toLocaleTimeString("en-US", {
    timeZone: "America/New_York", hour12: false
  });

  const prompt = `
MARKET TIME: ${now} ET
MARKET PHASE: ${phase}
PHASE CONTEXT: ${phaseContext}

${marketContext}

Based on this REAL market data, determine if there is a high-quality 0DTE or 1DTE options setup right now.

Focus criteria for ${phase}:
${phase === "OPEN" ? "- Look for directional momentum off the open\n- Volume confirmation is critical\n- Favor ATM or slightly OTM strikes with high delta (0.40-0.60)\n- Accept 65%+ confidence" : ""}
${phase === "MID" ? "- Only very clear setups — be very strict\n- Mid-day chop kills 0DTE\n- Require 80%+ confidence to generate a signal\n- Theta is eating premium fast" : ""}
${phase === "POWER_HOUR" ? "- Momentum continuation or clear reversal only\n- Tight stops — 0DTE gamma is extreme near close\n- High volume required\n- Accept 70%+ confidence" : ""}
${phase === "PRE_MARKET" ? "- Gap plays and pre-market trend continuation\n- Lower confidence threshold okay (65%+)\n- Note wider spreads in the rationale" : ""}
`;

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
      system: `You are a professional 0-1DTE options signal analyst for Signalos, an elite trading alert service.

You receive REAL market data: current price, today's OHLCV, options chain with Greeks.

Your job: decide if there is a HIGH-QUALITY setup RIGHT NOW. Be selective — only send signals that have a genuine edge.

Rules:
- Use the ACTUAL price from the data (never estimate)
- Pick the specific strike from the chain with the best risk/reward (consider IV, delta, volume, OI)
- Set stop and target at real price levels relative to today's range
- For 0DTE: stops must be tight (0.5-1.5% of stock price), theta will kill you
- SKIP if: choppy/no clear direction, very low volume, or no good strike available
- SKIP if confidence would be below the phase threshold

Respond ONLY with valid JSON, no markdown, no backticks, no explanation:

If there IS a setup:
{
  "skip": false,
  "ticker": string,
  "side": "BUY" | "SELL",
  "type": "CALL" | "PUT",
  "price": string (actual current price),
  "strike": string (specific strike e.g. "480C @ 3.20" — call/put + strike + current premium),
  "expiry": "0DTE" | "1DTE",
  "stop": string (specific stock price for stop),
  "target": string (specific stock price for target),
  "strategy": string (one of: RSI Divergence, MACD Cross, EMA Breakout, Volume Spike, BB Squeeze, Order Flow, VWAP Reclaim, Support Bounce, Resistance Break, Gap Fill),
  "tf": "1m" | "5m" | "15m",
  "confidence": number (65-95),
  "notes": string (2-3 sentences: what the data shows, why NOW, key level to watch)
}

If there is NO clear setup:
{
  "skip": true,
  "reason": string (brief reason: e.g. "Low volume, no directional bias", "Choppy price action near VWAP")
}`,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err.slice(0, 100)}`);
  }

  const apiData = await res.json();
  const text = apiData.content?.find(b => b.type === "text")?.text || "";
  
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error(`Claude returned invalid JSON: ${text.slice(0, 100)}`);
  }
}