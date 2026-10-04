import { createContext, useContext, useState, createElement } from "react";

const SCANNER_URL = import.meta.env.VITE_SCANNER_URL || "http://localhost:3001";
const SESSION_KEY = "alertgods_session";

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
  catch { return null; }
}

export function clearSession() { localStorage.removeItem(SESSION_KEY); }

// ─── Shared auth state ───────────────────────────────────────────────────────
// Previously useAuth() was just a plain hook — every component that called it
// (App.jsx, LoginPage.jsx, SubscriberDashboard.jsx) got its OWN independent
// useState(getSession), all seeded from localStorage at mount time. That's
// why login looked broken: LoginPage's own copy of useAuth() updated fine
// when login() ran, so it navigated to "/dashboard" — but App.jsx's copy of
// useAuth() (the one that actually decides whether to render the dashboard
// or bounce back to the login form) had already mounted earlier with
// isLoggedIn=false, and nothing told it the session had changed. Only a full
// page refresh remounted App.jsx and re-read the now-populated localStorage,
// which is exactly the "only works after I refresh" symptom.
//
// Fixing it means there can only be ONE real session, shared via context, so
// every component sees the same value and re-renders the instant it changes.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
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

  const value = { session, isLoggedIn, isPro, plan: session?.plan || null, login, logout };
  // createElement instead of JSX — this file is .js, not .jsx, so the JSX
  // transform isn't configured for it. Functionally identical to
  // <AuthContext.Provider value={value}>{children}</AuthContext.Provider>.
  return createElement(AuthContext.Provider, { value }, children);
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() was called outside <AuthProvider> — wrap <App /> with it in main.jsx.");
  }
  return ctx;
}
