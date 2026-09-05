// ─────────────────────────────────────────────────────────────────────────────
// MARKET HOURS & SCAN INTERVALS
// All times in US Eastern (ET) — market timezone
// ─────────────────────────────────────────────────────────────────────────────

// Market phases and their scan intervals:
//
// PRE_MARKET   6:00–9:30 AM ET   → scan every 15 min (slower, less liquid)
// OPEN         9:30–10:30 AM ET  → scan every 5 min  (high volatility open)
// MID          10:30 AM–3:00 PM  → scan every 15 min (midday grind)
// POWER_HOUR   3:00–4:00 PM ET   → scan every 5 min  (volume surges)
// CLOSED       all other times   → no scans

const SCAN_INTERVALS = {
  PRE_MARKET:  15 * 60 * 1000,  // 15 minutes
  OPEN:         5 * 60 * 1000,  //  5 minutes
  MID:         15 * 60 * 1000,  // 15 minutes
  POWER_HOUR:   5 * 60 * 1000,  //  5 minutes
  CLOSED:       5 * 60 * 1000,  //  5 min (just to recheck)
};

// Get current ET time components
function getETTime() {
  const now = new Date();
  const etStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const et = new Date(etStr);
  return {
    hours: et.getHours(),
    minutes: et.getMinutes(),
    day: et.getDay(), // 0=Sun, 6=Sat
    totalMinutes: et.getHours() * 60 + et.getMinutes(),
  };
}

export function isMarketOpen() {
  const { day, totalMinutes } = getETTime();
  if (day === 0 || day === 6) return false; // weekend
  const marketOpen  = 9 * 60 + 30;  // 9:30 AM
  const marketClose = 16 * 60;       // 4:00 PM
  return totalMinutes >= marketOpen && totalMinutes < marketClose;
}

export function getMarketPhase() {
  const { day, totalMinutes } = getETTime();

  // Weekend
  if (day === 0 || day === 6) return "CLOSED";

  const t = totalMinutes;
  const PRE_OPEN   = 6 * 60;        // 6:00 AM
  const OPEN       = 9 * 60 + 30;   // 9:30 AM
  const MID_START  = 10 * 60 + 30;  // 10:30 AM
  const POWER_HOUR = 15 * 60;       // 3:00 PM
  const CLOSE      = 16 * 60;       // 4:00 PM

  if (t < PRE_OPEN)   return "CLOSED";
  if (t < OPEN)       return "PRE_MARKET";
  if (t < MID_START)  return "OPEN";
  if (t < POWER_HOUR) return "MID";
  if (t < CLOSE)      return "POWER_HOUR";
  return "CLOSED";
}

export function getScanInterval(phase) {
  return SCAN_INTERVALS[phase] || SCAN_INTERVALS.CLOSED;
}

// Returns human-readable phase description for Claude's context
export function getPhaseContext(phase) {
  const contexts = {
    PRE_MARKET:  "Pre-market session (6-9:30 AM ET). Lower liquidity, wider spreads. Focus on gap setups and overnight moves. Be more selective.",
    OPEN:        "Market open (9:30-10:30 AM ET). High volatility, high volume. This is prime time for 0DTE entries. Look for directional moves off the open.",
    MID:         "Mid-day session (10:30 AM - 3 PM ET). Lower volatility, often choppy. Be very selective — only high-conviction setups. Theta decay accelerating on 0DTE.",
    POWER_HOUR:  "Power hour (3-4 PM ET). Volume surging into close. 0DTE gamma risk is extreme. Look for momentum continuation or late reversals. Tight stops required.",
    CLOSED:      "Market closed.",
  };
  return contexts[phase] || "";
}