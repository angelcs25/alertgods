import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// FREE PLAN SIGNUP PAGE
// Route: /signup/free
// Collects: name, email, Discord username
// After submit: shows Discord invite + confirmation
// ─────────────────────────────────────────────────────────────────────────────

// Your Discord invite link — replace with yours
const DISCORD_INVITE = "https://discord.gg/your-invite-here";

function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function AnimSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

export default function FreeSignupPage({ onNavigate = () => {} }) {
  const [form, setForm] = useState({ name: "", email: "", discord: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mono = "'JetBrains Mono','Fira Code',monospace";

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please fill in your name and email.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);

    // ── Save to your backend / email list ────────────────────────────────────
    // Option 1: Send to a simple API route you build later
    // Option 2: Use a free service like Formspree (paste your endpoint below)
    // Option 3: Use ConvertKit / Mailchimp API
    //
    // For now this just simulates a submit. Replace with your real integration:
    //
    // await fetch("https://formspree.io/f/YOUR_FORM_ID", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ name: form.name, email: form.email, discord: form.discord, plan: "free" }),
    // });

    await new Promise(r => setTimeout(r, 900)); // simulate network
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div style={{
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      background: "#050c18",
      color: "#c8d8e8",
      minHeight: "100vh",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1a2a3a; border-radius: 2px; }
        .fi {
          width: 100%;
          background: #0a1220;
          border: 1px solid #1a2a3a;
          color: #c8d8e8;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 13px 16px;
          border-radius: 3px;
          outline: none;
          transition: border-color 0.2s;
        }
        .fi:focus { border-color: #2a5a8a; }
        .fi::placeholder { color: #2a3a4a; }
        .submit-btn {
          width: 100%;
          background: #4a8adf;
          color: #fff;
          border: none;
          padding: 14px;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          letter-spacing: 0.02em;
        }
        .submit-btn:hover:not(:disabled) { background: #5a9aef; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .feature-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #6a8aaa;
          padding: 8px 0;
          border-bottom: 1px solid #0a1828;
        }
        .feature-row:last-child { border-bottom: none; }
        .grid-bg {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(74,138,223,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(74,138,223,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #0a1828" }}>
        <button onClick={() => onNavigate("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ fontFamily: mono, color: "#00c97a", fontSize: 14, fontWeight: 600, letterSpacing: "0.1em" }}>◈ SIGNALOS</span>
        </button>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#3a5a7a" }}>Already have an account?</span>
          <button onClick={() => onNavigate("/login")} style={{ background: "none", border: "1px solid #1a3a5a", color: "#4a8adf", fontFamily: "inherit", fontSize: 13, padding: "6px 16px", borderRadius: 3, cursor: "pointer" }}>
            Log In
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>

          {/* Left — plan details */}
          <AnimSection>
            <div>
              <div style={{ fontFamily: mono, fontSize: 10, color: "#4a8adf", letterSpacing: "0.2em", marginBottom: 12 }}>BASIC PLAN — FREE</div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#e8f0f8", lineHeight: 1.15, marginBottom: 16 }}>
                Start getting signals<br />at no cost.
              </h1>
              <p style={{ fontSize: 15, color: "#5a7a9a", lineHeight: 1.8, marginBottom: 32 }}>
                Join the Discord, get real options signals, and see how we trade — before spending a dollar. No credit card, no trial period. Just free.
              </p>

              {/* What's included */}
              <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 4, padding: "20px 22px", marginBottom: 24 }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 16 }}>WHAT'S INCLUDED</div>
                {[
                  { icon: "◎", label: "Options signals", detail: "1–5 per week, delivered to Discord" },
                  { icon: "◈", label: "Discord community", detail: "Live trade discussion and market chat" },
                  { icon: "△", label: "Education library", detail: "Beginner + Intermediate modules" },
                  { icon: "◇", label: "Signal breakdowns", detail: "Strategy name, entry, stop, and target" },
                ].map((f, i) => (
                  <div key={i} className="feature-row">
                    <span style={{ color: "#4a8adf", fontSize: 14, flexShrink: 0 }}>{f.icon}</span>
                    <div>
                      <div style={{ color: "#c8d8e8", fontSize: 13, fontWeight: 500 }}>{f.label}</div>
                      <div style={{ color: "#3a5a7a", fontSize: 12, marginTop: 2 }}>{f.detail}</div>
                    </div>
                    <span style={{ color: "#4a8adf", marginLeft: "auto", fontSize: 12 }}>✓</span>
                  </div>
                ))}
              </div>

              {/* What's not */}
              <div style={{ background: "#080a14", border: "1px solid #0a1020", borderRadius: 4, padding: "16px 20px" }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#1e2a38", letterSpacing: "0.15em", marginBottom: 12 }}>NOT INCLUDED IN FREE</div>
                {[
                  "Futures signals (/ES, /NQ)",
                  "SMS delivery",
                  "Live dashboard access",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#2a3a4a", padding: "6px 0" }}>
                    <span style={{ color: "#1e2a38", fontSize: 11 }}>—</span>
                    {f}
                  </div>
                ))}
                <button
                  onClick={() => onNavigate("/signup/pro")}
                  style={{ marginTop: 14, background: "none", border: "none", color: "#4a8adf", fontFamily: "inherit", fontSize: 13, cursor: "pointer", padding: 0, textDecoration: "underline" }}
                >
                  Upgrade to Pro ($36/mo) for everything →
                </button>
              </div>
            </div>
          </AnimSection>

          {/* Right — form */}
          <AnimSection delay={0.15}>
            {!submitted ? (
              <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 4, padding: "32px 28px" }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 20 }}>CREATE YOUR FREE ACCOUNT</div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#4a6a8a", marginBottom: 6 }}>Full name</label>
                    <input className="fi" type="text" placeholder="Alex Rivera" value={form.name} onChange={e => setField("name", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#4a6a8a", marginBottom: 6 }}>Email address</label>
                    <input className="fi" type="email" placeholder="you@email.com" value={form.email} onChange={e => setField("email", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#4a6a8a", marginBottom: 6 }}>
                      Discord username <span style={{ color: "#2a3a4a" }}>(optional — for server invite)</span>
                    </label>
                    <input className="fi" type="text" placeholder="username" value={form.discord} onChange={e => setField("discord", e.target.value)} />
                  </div>

                  {error && (
                    <div style={{ fontSize: 12, color: "#e05050", background: "#200808", border: "1px solid #300a0a", borderRadius: 3, padding: "10px 14px" }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Creating account..." : "Create Free Account →"}
                  </button>

                  <p style={{ fontSize: 11, color: "#1e2a38", textAlign: "center", lineHeight: 1.6 }}>
                    By signing up you agree to our Terms and Privacy Policy.<br />No credit card required. Cancel anytime.
                  </p>
                </form>
              </div>
            ) : (
              /* Success state */
              <div style={{ background: "#080f1c", border: "1px solid #0a3020", borderRadius: 4, padding: "40px 28px", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#e8f0f8", marginBottom: 12 }}>
                  You're in, {form.name.split(" ")[0]}
                </div>
                <p style={{ fontSize: 14, color: "#5a7a9a", lineHeight: 1.8, marginBottom: 28 }}>
                  Check your email for a confirmation. Next step — join the Discord server where signals are delivered.
                </p>
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", background: "#5865F2", color: "#fff", padding: "13px 28px", borderRadius: 3, fontWeight: 600, fontSize: 14, textDecoration: "none", marginBottom: 16 }}
                >
                  Join Discord Server →
                </a>
                <div style={{ marginTop: 20 }}>
                  <button
                    onClick={() => onNavigate("/signup/pro")}
                    style={{ background: "none", border: "1px solid #1a3a5a", color: "#4a8adf", fontFamily: "inherit", fontSize: 13, padding: "10px 20px", borderRadius: 3, cursor: "pointer" }}
                  >
                    Want SMS + Futures signals? Upgrade to Pro →
                  </button>
                </div>
              </div>
            )}
          </AnimSection>

        </div>
      </div>
    </div>
  );
}