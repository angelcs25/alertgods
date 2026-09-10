// src/pages/LoginPage.jsx
import { useState } from "react";
import useAuth from "../services/useAuth";

export default function LoginPage({ onNavigate = () => {}, onLogin }) {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const { login }           = useAuth();
  const mono = "'JetBrains Mono','Fira Code',monospace";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    setLoading(true);
    setError("");
    try {
      const sess = await login(email);
      onLogin?.(sess);
      onNavigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      background: "#050c18",
      color: "#c8d8e8",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=Syne:wght@800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .li { width:100%; background:#0a1220; border:1px solid #1a2a3a; color:#c8d8e8; font-family:'DM Sans',sans-serif; font-size:15px; padding:14px 16px; border-radius:3px; outline:none; transition:border-color 0.2s; }
        .li:focus { border-color:#00c97a; } .li::placeholder { color:#2a3a4a; }
        .lb { width:100%; background:#00c97a; color:#030f08; border:none; padding:14px; border-radius:3px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:700; cursor:pointer; transition:background 0.2s; }
        .lb:hover:not(:disabled) { background:#00e688; } .lb:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>

      <div style={{ width: 380, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <button onClick={() => onNavigate("/")} style={{ background:"none", border:"none", cursor:"pointer" }}>
            <span style={{ fontFamily: mono, color: "#00c97a", fontSize: 18, fontWeight: 600, letterSpacing: "0.12em" }}>◈ ALERTGODS</span>
          </button>
          <div style={{ fontSize: 13, color: "#2a4060", marginTop: 8 }}>Member Dashboard</div>
        </div>

        <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 4, padding: "32px 28px" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 20 }}>
            SIGN IN WITH YOUR EMAIL
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#4a6a8a", marginBottom: 6 }}>
                Email address
              </label>
              <input
                className="li"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                autoFocus
              />
              <div style={{ fontSize: 11, color: "#1e2a38", marginTop: 6 }}>
                Use the email you signed up with.
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 12, color: "#e05050", background: "#200808", border: "1px solid #300a0a", borderRadius: 3, padding: "10px 14px" }}>
                {error}
              </div>
            )}

            <button type="submit" className="lb" disabled={loading}>
              {loading ? "Checking account..." : "Access Dashboard →"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 13, color: "#2a4060" }}>Don't have an account? </span>
          <button onClick={() => onNavigate("/signup/free")} style={{ background: "none", border: "none", color: "#4a8adf", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>
            Sign up free →
          </button>
        </div>
      </div>
    </div>
  );
}