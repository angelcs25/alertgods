import { useState, useEffect } from "react";

const SCANNER_URL = import.meta.env.VITE_SCANNER_URL || "http://localhost:3001";
const SESSION_KEY = "alertgods_session";

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
  catch { return null; }
}

export function clearSession() { localStorage.removeItem(SESSION_KEY); }

export default function useAuth() {
  const [session, setSession] = useState(getSession);

  const isLoggedIn = !!session?.email;
  const isPro      = session?.plan === "pro";

  async function login(email) {
    // No fallback anymore — if the scanner can't be reached or doesn't
    // recognize the email, login fails with a real error instead of quietly
    // granting free access. (Previously this fell back to logging anyone in
    // as "free" if the request failed, which was a dev-only convenience that
    // never got removed once the scanner was actually deployed.)
    let res;
    try {
      res = await fetch(`${SCANNER_URL}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
    } catch {
      throw new Error("Couldn't reach the signal service — please try again in a moment.");
    }

    if (!res.ok) {
      throw new Error("Couldn't reach the signal service — please try again in a moment.");
    }

    const data = await res.json();
    if (data.plan === "none") {
      throw new Error("No account found for that email. Sign up first.");
    }

    const sess = { email: data.email, plan: data.plan, verified_at: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
    setSession(sess);
    return sess;
  }

  function logout() { clearSession(); setSession(null); }

  return { session, isLoggedIn, isPro, plan: session?.plan || null, login, logout };
}