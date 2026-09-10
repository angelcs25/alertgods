// src/services/useAuth.js
// ─────────────────────────────────────────────────────────────────────────────
// Simple session-based auth. No database needed on the frontend.
// When a user "logs in" with their email, we check it against the scanner API
// which knows who is a Pro subscriber (synced from Stripe webhooks).
//
// Plans: "free" | "pro" | null (not logged in)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

const SCANNER_URL = import.meta.env.VITE_SCANNER_URL || "http://localhost:3001";
const SESSION_KEY = "alertgods_session";

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
  catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function useAuth() {
  const [session, setSession] = useState(getSession);
  // session shape: { email, plan: "free"|"pro", token, expires_at }

  const isLoggedIn = !!session?.email;
  const isPro      = session?.plan === "pro";
  const plan       = session?.plan || null;

  useEffect(() => {
    // Re-validate session every 30 minutes in the background
    if (!session) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`${SCANNER_URL}/api/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.email }),
        });
        if (!res.ok) { clearSession(); setSession(null); return; }
        const data = await res.json();
        const updated = { ...session, plan: data.plan };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        setSession(updated);
      } catch { /* scanner offline — keep existing session */ }
    }, 30 * 60 * 1000);
    return () => clearInterval(iv);
  }, [session]);

  async function login(email) {
    const res = await fetch(`${SCANNER_URL}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    });
    if (!res.ok) throw new Error("Could not verify your account. Check your email and try again.");
    const data = await res.json();
    // data: { email, plan: "free"|"pro"|"none" }
    if (data.plan === "none") throw new Error("No account found for that email. Sign up first.");
    const sess = { email: data.email, plan: data.plan, verified_at: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
    setSession(sess);
    return sess;
  }

  function logout() {
    clearSession();
    setSession(null);
  }

  return { session, isLoggedIn, isPro, plan, login, logout };
}