// ─────────────────────────────────────────────────────────────────────────────
// MARKET HOURS & SCAN INTERVALS
// All times in US Eastern (ET) — market timezone
// ─────────────────────────────────────────────────────────────────────────────

// Market phases and their scan intervals:
//
// CLOSED       all other times incl. 12:00am–9:30 AM ET → no scans at all —
//                                   no Schwab calls, no Claude calls, no
//                                   cost, nothing before the bell. Previously
//                                   a "PRE_MARKET" phase scanned (and could
//                                   dispatch real signals!) starting at
//                                   6:00 AM — that's gone.
// EARLY_OPEN   9:30–9:50 AM ET    → scans every 10 min like OPEN below, but
//                                   signals are deliberately held back from
//                                   subscribers (see scanner.js) — spreads
//                                   are wide and direction isn't set yet
//                                   right off the bell, so this window exists
//                                   purely to have eyes on the open without
//                                   acting on the first 20min of chop.
// OPEN         9:50–11:30 AM ET   → scan every 10 min, signals go out normally
// MID          11:30 AM–3:00 PM   → scan every 30 min (midday grind)
// POWER_HOUR   3:00–4:00 PM ET    → scan every 15 min (volume surges into
//                                   close, but every 5min here was most of
//                                   the daily Claude API cost for little
//                                   extra benefit — 15min still catches the
//                                   close-session move)

const SCAN_INTERVALS = {
  EARLY_OPEN:  10 * 60 * 1000,  // 10 minutes — scans, but dispatch is held back
  OPEN:        10 * 60 * 1000,  // 10 minutes
  MID:         30 * 60 * 1000,  // 30 minutes
  POWER_HOUR:  15 * 60 * 1000,  // 15 minutes
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
  const MARKET_OPEN    = 9 * 60 + 30;  // 9:30 AM — nothing scans before this, period
  const EARLY_OPEN_END = 9 * 60 + 50;  // 9:50 AM — end of the held-back "chop" window
  const MID_START       = 11 * 60 + 30; // 11:30 AM
  const POWER_HOUR      = 15 * 60;      // 3:00 PM
  const CLOSE           = 16 * 60;      // 4:00 PM

  if (t < MARKET_OPEN)    return "CLOSED";
  if (t < EARLY_OPEN_END) return "EARLY_OPEN";
  if (t < MID_START)      return "OPEN";
  if (t < POWER_HOUR)     return "MID";
  if (t < CLOSE)          return "POWER_HOUR";
  return "CLOSED";
}

export function getScanInterval(phase) {
  return SCAN_INTERVALS[phase] || SCAN_INTERVALS.CLOSED;
}

// Returns human-readable phase description for Claude's context
export function getPhaseContext(phase) {
  const contexts = {
    EARLY_OPEN:  "First 20min after the bell (9:30-9:50 AM ET). Spreads are wide and direction isn't set yet. Analyze normally and be honest about setups, but know that whatever you return here is held back from subscribers regardless of confidence — this window is for visibility only, not dispatch.",
    OPEN:        "Market open (9:50-11:30 AM ET). High volatility, high volume, direction established. This is prime time for 0DTE entries. Look for directional moves off the open.",
    MID:         "Mid-day session (11:30 AM - 3 PM ET). Lower volatility, often choppy. Be very selective — only high-conviction setups. Theta decay accelerating on 0DTE.",
    POWER_HOUR:  "Power hour (3-4 PM ET). Volume surging into close. 0DTE gamma risk is extreme. Look for momentum continuation or late reversals. Tight stops required.",
    CLOSED:      "Market closed.",
  };
  return contexts[phase] || "";
}