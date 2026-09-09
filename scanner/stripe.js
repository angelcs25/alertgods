// ─────────────────────────────────────────────────────────────────────────────
// STRIPE INTEGRATION — scanner/stripe.js
//
// SETUP:
//   1. stripe.com → Create account → verify identity
//   2. Dashboard → Products → Add Product
//      Name: "AlertGods Pro" · Price: $36/mo · Recurring
//   3. Dashboard → Payment Links → Create → select your product
//      Copy the link → paste into ProSignupPage.jsx as STRIPE_PAYMENT_LINK
//   4. Dashboard → Developers → API Keys → copy Secret Key
//   5. Dashboard → Developers → Webhooks → Add endpoint:
//      URL: https://your-scanner.railway.app/api/stripe-webhook
//      Events: customer.subscription.created, customer.subscription.deleted,
//              customer.subscription.updated, invoice.payment_failed
//   6. Copy the Webhook Signing Secret
//   7. Add to scanner/.env:
//        STRIPE_SECRET_KEY=sk_live_...
//        STRIPE_WEBHOOK_SECRET=whsec_...
// ─────────────────────────────────────────────────────────────────────────────

import Stripe from "stripe";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { addProSubscriber, removeProSubscriber } from "./notify.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUBSCRIBERS_FILE = path.join(__dirname, "subscribers.json");

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

async function saveSubscribers(subs) {
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subs, null, 2));
}

export async function handleStripeWebhook(body, sig) {
  if (!stripe) throw new Error("Stripe not configured — add STRIPE_SECRET_KEY to .env");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    throw new Error(`Webhook signature invalid: ${e.message}`);
  }

  console.log(`  [Stripe] Event: ${event.type}`);

  switch (event.type) {

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object;
      if (sub.status !== "active") break;

      // Get customer email and metadata (phone stored in Stripe customer)
      const customer = await stripe.customers.retrieve(sub.customer);
      const phone = customer.metadata?.phone || customer.phone || "";
      const email = customer.email || "";

      if (email) {
        addProSubscriber(phone, email);
        console.log(`  [Stripe] Pro activated: ${email}`);

        // Send welcome Discord notification to admin
        const webhook = process.env.DISCORD_WEBHOOK_ADMIN;
        if (webhook) {
          await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              embeds: [{
                color: 0x00c97a,
                title: "💰 New Pro Subscriber",
                fields: [
                  { name: "Email", value: email, inline: true },
                  { name: "Phone", value: phone || "not provided", inline: true },
                  { name: "Status", value: "Active", inline: true },
                ],
                footer: { text: "AlertGods · Stripe" },
                timestamp: new Date().toISOString(),
              }],
            }),
          }).catch(() => {});
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const customer = await stripe.customers.retrieve(sub.customer);
      const phone = customer.metadata?.phone || customer.phone || "";
      const email = customer.email || "";

      if (phone) {
        removeProSubscriber(phone);
        console.log(`  [Stripe] Pro cancelled: ${email}`);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.warn(`  [Stripe] Payment failed for customer: ${invoice.customer}`);
      // Optionally pause SMS for this subscriber until payment succeeds
      break;
    }
  }

  // Save updated subscriber list to disk
  try {
    const { LESSONS: _ } = await import("./notify.js"); // eslint-disable-line
  } catch { /* ignore */ }
}

// ─── Create a Stripe Checkout Session (alternative to Payment Link) ───────────
// Call this from your frontend via POST /api/create-checkout
export async function createCheckoutSession(email, name, phone) {
  if (!stripe) throw new Error("Stripe not configured");

  // Create or find customer so we can store phone number
  let customer;
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    customer = existing.data[0];
    if (phone) await stripe.customers.update(customer.id, { phone, metadata: { phone } });
  } else {
    customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: { phone },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/#/signup/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/#/signup/pro`,
    subscription_data: {
      metadata: { email, phone },
    },
  });

  return session.url;
}