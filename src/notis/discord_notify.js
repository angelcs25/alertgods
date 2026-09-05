// ─────────────────────────────────────────────────────────────────────────────
// DISCORD NOTIFIER
// ─────────────────────────────────────────────────────────────────────────────

export async function sendDiscord(signal) {
    const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK;
  if (!webhookUrl) return;

  const isCall = signal.type === "CALL";
  const isBuy  = signal.side === "BUY";
  const color  = isBuy ? 0x00c97a : 0xe05050;
  const emoji  = isBuy ? "🟢" : "🔴";

  const phaseEmojis = {
    OPEN: "🔔",
    MID: "📊",
    POWER_HOUR: "⚡",
    PRE_MARKET: "🌅",
  };

  const body = {
    embeds: [{
      color,
      title: `${emoji} ${signal.ticker} — ${signal.side} ${signal.type} ${signal.expiry}`,
      description: signal.notes || "New signal generated.",
      fields: [
        { name: "Ticker",      value: signal.ticker,                     inline: true },
        { name: "Direction",   value: `${signal.side} ${signal.type}`,   inline: true },
        { name: "Expiry",      value: signal.expiry,                     inline: true },
        { name: "Entry Price", value: `$${signal.price}`,                inline: true },
        { name: "Strike",      value: signal.strike || "—",              inline: true },
        { name: "Strategy",    value: signal.strategy || "—",            inline: true },
        { name: "Stop",        value: `$${signal.stop}`,                 inline: true },
        { name: "Target",      value: `$${signal.target}`,              inline: true },
        { name: "Confidence",  value: `${signal.confidence}%`,           inline: true },
        { name: "Timeframe",   value: signal.tf || "—",                  inline: true },
        { name: "Phase",       value: `${phaseEmojis[signal.phase] || "📈"} ${signal.phase || "—"}`, inline: true },
      ],
      footer: { text: `Signalos AI Scanner · ${new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false })} ET` },
      timestamp: new Date().toISOString(),
    }],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("  ⚠ Discord delivery failed:", res.status);
    else console.log("  📨 Discord alert sent");
  } catch (e) {
    console.error("  ⚠ Discord error:", e.message);
  }
}