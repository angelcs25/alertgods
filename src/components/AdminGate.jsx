import { useState } from "react";

// Change this password — or move to .env as VITE_ADMIN_PASSWORD
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const SESSION_KEY = "signalos_admin_auth";

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.hash = "/";
  window.location.reload();
}

export default function AdminGate({ children }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "true");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function attempt() {
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthed(true);
    } else {
      setError("Incorrect password");
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 500);
    }
  }

  if (authed) return children;

  const mono = "'JetBrains Mono','Fira Code',monospace";

  return (
    <div style={{ minHeight: "100vh", background: "#050c18", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono }}>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .gi { background:#0d1117; border:1px solid #1a2530; color:#c8d0d8; font-family:${mono}; font-size:13px; padding:11px 14px; border-radius:2px; width:100%; outline:none; letter-spacing:.1em; }
        .gi:focus { border-color:#2a4060; }
      `}</style>
      <div style={{ width: 340, animation: shake ? "shake 0.5s ease" : "none" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 18, color: "#00c97a", fontWeight: 600, letterSpacing: "0.15em", marginBottom: 6 }}>◈ALERTGODS</div>
          <div style={{ fontSize: 10, color: "#2a4060", letterSpacing: "0.2em" }}>ADMIN ACCESS</div>
        </div>
        <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 4, padding: "28px 24px" }}>
          <div style={{ fontSize: 9, color: "#2a3a4a", letterSpacing: "0.15em", marginBottom: 16 }}>ENTER PASSWORD</div>
          <input className="gi" type="password" placeholder="••••••••••••" value={input}
            onChange={e => { setInput(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && attempt()} autoFocus />
          {error && <div style={{ fontSize: 10, color: "#e05050", marginTop: 8 }}>✗ {error}</div>}
          <button onClick={attempt} style={{ width: "100%", marginTop: 16, background: "#00c97a", color: "#030f08", border: "none", padding: 11, borderRadius: 2, fontFamily: mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", cursor: "pointer" }}>
            ENTER →
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => { window.location.hash = "/"; }} style={{ background: "none", border: "none", color: "#2a4060", fontFamily: mono, fontSize: 10, cursor: "pointer" }}>
            ← Back to site
          </button>
        </div>
      </div>
    </div>
  );
}