// ─────────────────────────────────────────────────────────────────────────────
// ALERT DELIVERY — notify.js
// Handles Discord webhooks and Twilio SMS
// Futures signals and SMS are PRO ONLY
// ─────────────────────────────────────────────────────────────────────────────

import twilio from "twilio";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Same DATA_DIR reasoning as scanner.js/schwab.js — points at the mounted
// Railway Volume so this survives redeploys, when one is attached.
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || __dirname;
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

// ─── Subscriber list ──────────────────────────────────────────────────────────
// Source of truth on disk is subscribers.json (mounted volume). Pro subscribers
// are added/removed by the Stripe webhook (see stripe.js). Free subscribers are
// added here directly by the /api/signup-free route in scanner.js.
// Format: { free: [{email, name, discord, added_at}], pro: [{phone, email, added_at}] }

let subscribers = { free: [], pro: [] };

export function setSubscribers(data) {
  subscribers = data;
}

export function getSubscribers() {
  return subscribers;
}

// Shared persistence — anything that mutates `subscribers` should call this
// afterward so the change survives a restart/redeploy.
export async function saveSubscribers() {
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
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

// ─── Free subscribers ─────────────────────────────────────────────────────────
// Called by POST /api/signup-free (scanner.js) when someone submits the free
// signup form. Dedupes by email so a repeat submission just updates the record
// instead of creating a duplicate. Persists immediately so this data is never
// only sitting in Formspree/Discord — it lives on your own server.

export function addFreeSubscriber(email, name, discord) {
  const normalized = email.toLowerCase().trim();
  const existing = subscribers.free.find(s => s.email?.toLowerCase() === normalized);
  if (existing) {
    existing.name = name || existing.name;
    existing.discord = discord || existing.discord;
    existing.updated_at = new Date().toISOString();
    console.log(`  [Notify] Updated Free subscriber: ${normalized}`);
  } else {
    subscribers.free.push({
      email: normalized,
      name: name || "",
      discord: discord || "",
      added_at: new Date().toISOString(),
    });
    console.log(`  [Notify] Added Free subscriber: ${normalized}`);
  }
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
  // SMS is futures-only now (see dispatchSignal below) — these go to traders
  // who want the level and get out, not the full writeup, so this uses the
  // short, purpose-built smsLine Claude generates alongside the full Discord
  // "notes". Falls back to the old first-sentence trim for any older signal
  // object saved before smsLine existed.
  const reasoning = signal.smsLine || signal.notes?.split(".")[0] || "";
  const msg =
    `${dir} ALERTGODS: ${signal.ticker} ${signal.side} ${signal.type} ${signal.expiry}\n` +
    `Strike: ${signal.strike}\n` +
    `Entry: $${signal.price}\n` +
    `Stop: $${signal.stop}\n` +
    `Target: $${signal.target}\n` +
    `${signal.strategy} | ${signal.confidence}% conf\n` +
    `${reasoning}\n` +
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
    // FUTURES — PRO ONLY: Pro Discord + SMS. SMS is reserved for futures on
    // purpose — prop-firm/futures traders need the alert the instant it
    // fires, so they get the fast text with just the level and get-out info
    // (see buildSMSMessage/smsLine). Options traders get the full reasoning
    // on Discord instead of a text.
    console.log(`  [Notify] Futures signal — Pro only delivery (Discord + SMS)`);
    await Promise.allSettled([
      sendProDiscord(signal),
      sendSMSToProSubscribers(signal),
    ]);
  } else {
    // OPTIONS — Free Discord + Pro Discord. No SMS for options anymore —
    // the full writeup lives on Discord and doesn't cost a text per signal.
    console.log(`  [Notify] Options signal — Free + Pro Discord delivery`);
    await Promise.allSettled([
      sendFreeDiscord(signal),
      sendProDiscord(signal),
    ]);
  }
}

// Dispatch for skip events (admin only)
export async function dispatchSkip(ticker, reason) {
  await sendAdminDiscord({ ticker }, reason).catch(() => {});
}

// ─── Trade resolution (win/loss) follow-up ─────────────────────────────────────
// Posted by scanner.js when a pending signal's target or stop actually gets hit.
// Discord-only, no SMS — this is a transparency/trust follow-up, not a new
// alert, and keeping it out of SMS avoids adding to text volume.

function buildResolutionEmbed(signal) {
  const won = signal.status === "won";
  return {
    color: won ? 0x00c97a : 0xe05050,
    title: `${won ? "✅ WIN" : "🛑 STOPPED OUT"} — ${signal.ticker} ${signal.side} ${signal.type}`,
    description: `Entry $${signal.price} → ${won ? "target" : "stop"} hit at $${signal.resolvedPrice}. Pausing new ${signal.ticker} signals for a bit before scanning it again — trade the moves you already have, don't chase the next one.`,
    fields: [
      { name: "Entry", value: `$${signal.price}`, inline: true },
      { name: won ? "Target Hit" : "Stop Hit", value: `$${signal.resolvedPrice}`, inline: true },
      { name: "Strategy", value: signal.strategy || "—", inline: true },
    ],
    footer: { text: "AlertGods Signal Engine · Trade at your own risk" },
    timestamp: new Date().toISOString(),
  };
}

export async function dispatchResolution(signal) {
  const isFutures = signal.isFutures || signal.ticker?.startsWith("/");
  const embed = buildResolutionEmbed(signal);
  const webhooks = isFutures
    ? [process.env.DISCORD_WEBHOOK_PRO]
    : [process.env.DISCORD_WEBHOOK_FREE, process.env.DISCORD_WEBHOOK_PRO];

  await Promise.allSettled(
    webhooks.filter(Boolean).map(webhook =>
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      })
    )
  );
  console.log(`  [Discord] Resolution posted for ${signal.ticker}: ${signal.status}`);
}