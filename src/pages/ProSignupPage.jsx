import { useState, useEffect, useRef } from "react";

// ─── Config — fill these in ────────────────────────────────────────────────────
const FORMSPREE_ID         = import.meta.env.VITE_FORMSPREE_ID || "your_form_id";
const ADMIN_DISCORD_WEBHOOK = import.meta.env.VITE_ADMIN_WEBHOOK || "";
const STRIPE_PAYMENT_LINK  = import.meta.env.VITE_STRIPE_PAYMENT_LINK || "";
// ─────────────────────────────────────────────────────────────────────────────

function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function AnimSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s` }}>
      {children}
    </div>
  );
}

const PRO_FEATURES = [
  { icon: "◎", label: "Options signals",        detail: "0–5DTE, 1–8 per day on high-probability setups" },
  { icon: "⬡", label: "Futures signals",         detail: "/ES and /NQ scalp setups — Pro only" },
  { icon: "◈", label: "SMS + Discord delivery",  detail: "Alerts in under 2 seconds" },
  { icon: "△", label: "Live signal dashboard",   detail: "Real-time feed with full history" },
  { icon: "◇", label: "Strategy breakdown",      detail: "Entry, stop, target, and rationale on every signal" },
  { icon: "⊞", label: "Full education library",  detail: "All modules including Advanced Order Flow" },
];

export default function ProSignupPage({ onNavigate = () => {} }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", smsConsent: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mono = "'JetBrains Mono','Fira Code',monospace";

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); setError(""); }

  function formatPhone(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim())  { setError("Please enter your name."); return; }
    if (!form.email.includes("@")) { setError("Please enter a valid email."); return; }
    if (form.phone && !form.smsConsent) {
      setError("Please check the SMS consent box to receive text alerts, or remove your phone number.");
      return;
    }
    if (form.phone && form.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone ? `+1${form.phone.replace(/\D/g, "")}` : "",
      sms_consent: form.smsConsent,
      sms_consent_timestamp: form.smsConsent ? new Date().toISOString() : null,
      plan: "pro",
      _subject: `New Pro signup: ${form.name}`,
    };

    // Save lead + notify admin — non-blocking
    await Promise.allSettled([
      fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      }),
      ADMIN_DISCORD_WEBHOOK && fetch(ADMIN_DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            color: 0x00c97a,
            title: "💰 New Pro Signup — $36/mo",
            fields: [
              { name: "Name",        value: form.name,              inline: true },
              { name: "Email",       value: form.email,             inline: true },
              { name: "Phone",       value: form.phone || "—",      inline: true },
              { name: "SMS Consent", value: form.smsConsent ? "✅ Yes" : "❌ No", inline: true },
            ],
            description: "Redirecting to Stripe checkout...",
            footer: { text: "AlertGods · Pro" },
            timestamp: new Date().toISOString(),
          }],
        }),
      }),
    ]);

    // Redirect to Stripe with email pre-filled
    try {
      const url = new URL(STRIPE_PAYMENT_LINK);
      url.searchParams.set("prefilled_email", form.email);
      window.location.href = url.toString();
    } catch {
      // If Stripe link is not set, show error
      setError("Payment link not configured yet. Please contact support.");
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#050c18", color: "#c8d8e8", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #1a2a3a; border-radius: 2px; }
        .fi { width: 100%; background: #0a1220; border: 1px solid #1a2a3a; color: #c8d8e8; font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 13px 16px; border-radius: 3px; outline: none; transition: border-color 0.2s; }
        .fi:focus { border-color: #00c97a; } .fi::placeholder { color: #2a3a4a; }
        .submit-btn { width: 100%; background: #00c97a; color: #030f08; border: none; padding: 15px; border-radius: 3px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .submit-btn:hover:not(:disabled) { background: #00e688; } .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .checkbox-label { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; color: #4a6a8a; line-height: 1.6; user-select: none; }
        .checkbox-label input[type=checkbox] { width: 16px; height: 16px; margin-top: 2px; flex-shrink: 0; accent-color: #00c97a; cursor: pointer; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #0a1828" }}>
        <button onClick={() => onNavigate("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ fontFamily: mono, color: "#00c97a", fontSize: 14, fontWeight: 600, letterSpacing: "0.1em" }}>◈ ALERTGODS</span>
        </button>
        <button onClick={() => onNavigate("/signup/free")} style={{ background: "none", border: "1px solid #1a3a5a", color: "#4a8adf", fontFamily: "inherit", fontSize: 13, padding: "6px 16px", borderRadius: 3, cursor: "pointer" }}>
          Start Free Instead
        </button>
      </nav>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "60px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>

          {/* Left — features */}
          <AnimSection>
            <div style={{ fontFamily: mono, fontSize: 10, color: "#00c97a", letterSpacing: "0.2em", marginBottom: 12 }}>PRO PLAN</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, color: "#e8f0f8", lineHeight: 1.1, marginBottom: 8 }}>
              $36<span style={{ fontSize: 18, color: "#5a7a9a", fontWeight: 400 }}>/month</span>
            </h1>
            <p style={{ fontSize: 15, color: "#5a7a9a", lineHeight: 1.8, marginBottom: 32, marginTop: 12 }}>
              Full access — options and futures signals by SMS and Discord, live dashboard, and the complete education library.
            </p>
            <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 4, padding: "20px 22px", marginBottom: 20 }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 16 }}>EVERYTHING INCLUDED</div>
              {PRO_FEATURES.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < PRO_FEATURES.length - 1 ? "1px solid #0a1828" : "none" }}>
                  <span style={{ color: "#00c97a", fontSize: 14, flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ color: "#c8d8e8", fontSize: 13, fontWeight: 500 }}>{f.label}</div>
                    <div style={{ color: "#3a5a7a", fontSize: 12, marginTop: 2 }}>{f.detail}</div>
                  </div>
                  <span style={{ color: "#00c97a", marginLeft: "auto", fontSize: 13, flexShrink: 0 }}>✓</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#060c14", border: "1px solid #0a1828", borderRadius: 4, padding: "14px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 4 }}>Cancel anytime</div>
              <div style={{ fontSize: 12, color: "#3a5a7a", lineHeight: 1.65 }}>No contracts. Cancel in the member portal. You keep access through the end of your billing period.</div>
            </div>
          </AnimSection>

          {/* Right — form */}
          <AnimSection delay={0.15}>
            <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 4, padding: "32px 28px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 6 }}>GET STARTED</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#c8d8e8", marginBottom: 6 }}>Your details, then payment</div>
              <p style={{ fontSize: 13, color: "#3a5a7a", marginBottom: 24, lineHeight: 1.6 }}>
                Fill in your info and you'll be taken to Stripe's secure checkout. Your card never touches our servers.
              </p>

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
                    Phone number <span style={{ color: "#2a3a4a" }}>(optional — for SMS alerts)</span>
                  </label>
                  <input
                    className="fi"
                    type="tel"
                    placeholder="(305) 555-0100"
                    value={form.phone}
                    onChange={e => setField("phone", formatPhone(e.target.value))}
                  />

                  {/* ── SMS CONSENT — TCPA COMPLIANT ── */}
                  {form.phone.replace(/\D/g, "").length >= 3 && (
                    <div style={{ marginTop: 10, background: "#060c14", border: "1px solid #0a1828", borderRadius: 3, padding: "12px 14px" }}>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={form.smsConsent}
                          onChange={e => setField("smsConsent", e.target.checked)}
                        />
                        <span>
                          By checking this box, I consent to receive recurring automated trading alert text messages from AlertGods at the phone number provided. Message frequency varies based on market conditions (typically 1–8 messages per trading day). Message and data rates may apply.{" "}
                          <button
                            type="button"
                            onClick={() => onNavigate("/terms")}
                            style={{ background: "none", border: "none", color: "#4a8adf", fontFamily: "inherit", fontSize: 12, cursor: "pointer", padding: 0, textDecoration: "underline" }}
                          >
                            Terms
                          </button>
                          {" "}and{" "}
                          <button
                            type="button"
                            onClick={() => onNavigate("/privacy")}
                            style={{ background: "none", border: "none", color: "#4a8adf", fontFamily: "inherit", fontSize: 12, cursor: "pointer", padding: 0, textDecoration: "underline" }}
                          >
                            Privacy Policy
                          </button>
                          . Reply STOP to unsubscribe, HELP for help.
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{ fontSize: 12, color: "#e05050", background: "#200808", border: "1px solid #300a0a", borderRadius: 3, padding: "10px 14px" }}>
                    {error}
                  </div>
                )}

                {/* Order summary */}
                <div style={{ background: "#060c14", border: "1px solid #0a1020", borderRadius: 3, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#5a7a9a" }}>AlertGods Pro</span>
                    <span style={{ color: "#c8d8e8", fontWeight: 600 }}>$36 / month</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#2a3a4a", marginTop: 4 }}>Billed monthly · Cancel anytime</div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Saving..." : "Continue to Secure Checkout →"}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#2a3a4a", justifyContent: "center" }}>
                  <span>🔒</span>
                  <span>Secured by Stripe · We never store card details</span>
                </div>
              </form>
            </div>
          </AnimSection>

        </div>
      </div>
    </div>
  );
}