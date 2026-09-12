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
    // Try the scanner first — if it's running, verify against real subscriber list
    try {
      const res = await fetch(`${SCANNER_URL}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.plan === "none") throw new Error("No account found for that email. Sign up first.");
        const sess = { email: data.email, plan: data.plan, verified_at: Date.now() };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
        setSession(sess);
        return sess;
      }
    } catch (err) {
      // If scanner is offline (local dev, not deployed yet), fall back to
      // letting anyone log in as "free" so you can see the dashboard
      if (err.message.includes("No account")) throw err;
      console.warn("Scanner offline — using fallback login");
    }

    // Fallback: accept any email as free (remove this once scanner is deployed)
    const sess = { email: email.toLowerCase().trim(), plan: "free", verified_at: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
    setSession(sess);
    return sess;
  }

  function logout() { clearSession(); setSession(null); }

  return { session, isLoggedIn, isPro, plan: session?.plan || null, login, logout };
}