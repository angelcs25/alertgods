// ─────────────────────────────────────────────────────────────────────────────
// ALERT DELIVERY — notify.js
// Handles Discord webhooks and Twilio SMS
// Futures signals and SMS are PRO ONLY
// ─────────────────────────────────────────────────────────────────────────────

import twilio from "twilio";

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// ─── Subscriber list ──────────────────────────────────────────────────────────
// In production these come from your database (Stripe webhook adds/removes them)
// For now, load from a local JSON file you maintain manually
// Format: { free: [{phone, discord_id}], pro: [{phone, discord_id}] }

let subscribers = { free: [], pro: [] };

export function setSubscribers(data) {
  subscribers = data;
}

export function addProSubscriber(phone, email) {
  if (!subscribers.pro.find(s => s.phone === phone)) {
    subscribers.pro.push({ phone, email, added_at: new Date().toISOString() });
    console.log(`  [Notify] Added Pro subscriber: ${email}`);
  }
}

export function removeProSubscriber(phone) {
  subscribers.pro = subscribers.pro.filter(s => s.phone !== phone);
}

// ─── Discord delivery ─────────────────────────────────────────────────────────

function buildDiscordEmbed(signal) {
  const isBuy = signal.side === "BUY";
  const isFutures = signal.isFutures || signal.ticker?.startsWith("/");
  const color = isBuy ? 0x00c97a : 0xe05050;
  const dirEmoji = isBuy ? "🟢" : "🔴";
  const typeEmoji = isFutures ? "📊" : signal.type === "CALL" ? "📈" : "📉";

  const phaseLabel = {
    OPEN: "🔔 Market Open",
    MID: "📊 Mid-Day",
    POWER_HOUR: "⚡ Power Hour",
    PRE_MARKET: "🌅 Pre-Market",
  }[signal.phase] || "📈";

  return {
    color,
    title: `${dirEmoji} ${typeEmoji} ${signal.ticker} — ${signal.side} ${signal.type} ${signal.expiry}`,
    description: signal.notes || "",
    fields: [
      { name: "Entry",      value: `$${signal.price}`,                      inline: true },
      { name: "Strike",     value: signal.strike || "—",                    inline: true },
      { name: "Strategy",   value: signal.strategy || "—",                  inline: true },
      { name: "Stop",       value: `$${signal.stop}`,                       inline: true },
      { name: "Target",     value: `$${signal.target}`,                     inline: true },
      { name: "Confidence", value: `${signal.confidence}%`,                 inline: true },
      { name: "Timeframe",  value: signal.tf || "—",                        inline: true },
      { name: "Session",    value: phaseLabel,                              inline: true },
    ],
    footer: { text: "AlertGods Signal Engine · Trade at your own risk" },
    timestamp: new Date().toISOString(),
  };
}

// Send to free Discord channel (options only)
async function sendFreeDiscord(signal) {
  const webhook = process.env.DISCORD_WEBHOOK_FREE;
  if (!webhook) return;
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [buildDiscordEmbed(signal)] }),
  });
  console.log(`  [Discord-Free] Sent ${signal.ticker} signal`);
}

// Send to pro Discord channel (options + futures)
async function sendProDiscord(signal) {
  const webhook = process.env.DISCORD_WEBHOOK_PRO;
  if (!webhook) return;
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [buildDiscordEmbed(signal)] }),
  });
  console.log(`  [Discord-Pro] Sent ${signal.ticker} signal`);
}

// Send to admin channel (all signals, for your monitoring)
async function sendAdminDiscord(signal, skipReason = null) {
  const webhook = process.env.DISCORD_WEBHOOK_ADMIN;
  if (!webhook) return;
  if (skipReason) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          color: 0x1a2a3a,
          title: `⏭ ${signal.ticker} — Skipped`,
          description: skipReason,
          footer: { text: "AlertGods Scanner" },
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    return;
  }
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        ...buildDiscordEmbed(signal),
        title: `🔍 ADMIN | ${buildDiscordEmbed(signal).title}`,
        color: 0x2a4060,
      }],
    }),
  });
}

// ─── Twilio SMS (PRO ONLY) ────────────────────────────────────────────────────

function buildSMSMessage(signal) {
  const dir = signal.side === "BUY" ? "🟢" : "🔴";
  const msg =
    `${dir} ALERTGODS: ${signal.ticker} ${signal.side} ${signal.type} ${signal.expiry}\n` +
    `Strike: ${signal.strike}\n` +
    `Entry: $${signal.price} | Stop: $${signal.stop} | Target: $${signal.target}\n` +
    `${signal.strategy} | ${signal.confidence}% conf\n` +
    `${signal.notes?.split(".")[0] || ""}\n` +
    `Reply STOP to unsubscribe.`;
  return msg;
}

async function sendSMSToNumber(toNumber, message) {
  if (!twilioClient) {
    console.warn("  [SMS] Twilio not configured — skipping");
    return;
  }
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_FROM_NUMBER,
      to: toNumber,
    });
    console.log(`  [SMS] Sent to ${toNumber.slice(0, 6)}...`);
  } catch (e) {
    console.error(`  [SMS] Failed to ${toNumber.slice(0, 6)}:`, e.message);
  }
}

async function sendSMSToProSubscribers(signal) {
  if (subscribers.pro.length === 0) {
    console.log("  [SMS] No Pro subscribers");
    return;
  }
  const message = buildSMSMessage(signal);
  const results = await Promise.allSettled(
    subscribers.pro
      .filter(s => s.phone)
      .map(s => sendSMSToNumber(s.phone, message))
  );
  const sent = results.filter(r => r.status === "fulfilled").length;
  console.log(`  [SMS] Delivered to ${sent}/${subscribers.pro.length} Pro subscribers`);
}

// ─── Main dispatch function ───────────────────────────────────────────────────
// This is what scanner.js calls for every generated signal

export async function dispatchSignal(signal) {
  const isFutures = signal.isFutures || signal.ticker?.startsWith("/");

  // Always log to admin channel
  await sendAdminDiscord(signal).catch(e => console.error("Admin Discord failed:", e.message));

  if (isFutures) {
    // FUTURES — PRO ONLY: Pro Discord + SMS
    console.log(`  [Notify] Futures signal — Pro only delivery`);
    await Promise.allSettled([
      sendProDiscord(signal),
      sendSMSToProSubscribers(signal),
    ]);
  } else {
    // OPTIONS — Free Discord + Pro Discord + Pro SMS
    console.log(`  [Notify] Options signal — Free + Pro delivery`);
    await Promise.allSettled([
      sendFreeDiscord(signal),
      sendProDiscord(signal),
      sendSMSToProSubscribers(signal),
    ]);
  }
}

// Dispatch for skip events (admin only)
export async function dispatchSkip(ticker, reason) {
  await sendAdminDiscord({ ticker }, reason).catch(() => {});
}