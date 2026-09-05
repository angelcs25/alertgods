import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PRO PLAN SIGNUP PAGE — $36/mo
// Route: /signup/pro
//
// PAYMENT OPTIONS (pick one):
//
// Option A — Stripe Checkout (recommended, easiest)
//   1. Create account at stripe.com
//   2. Create a Product → Recurring price → $36/month
//   3. Get the Price ID (looks like: price_1ABC...)
//   4. Create a Checkout Session via your backend
//   5. Redirect user to Stripe's hosted checkout page
//   See: STRIPE_SETUP.md (included)
//
// Option B — Stripe Payment Link (zero backend needed)
//   1. In Stripe Dashboard → Payment Links → Create
//   2. Add your $36/mo product
//   3. Paste the link below — user clicks and goes straight to Stripe
//   const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/your_link_here";
//
// Option C — Gumroad / Whop (no-code, 5 min setup)
//   Good for getting started fast. Swap the button href below.
// ─────────────────────────────────────────────────────────────────────────────

// Replace with your actual Stripe Payment Link (Option B — simplest)
// or keep empty to show the form flow (Option A)
const STRIPE_PAYMENT_LINK = ""; // e.g. "https://buy.stripe.com/xxxxx"

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

const PRO_FEATURES = [
  { icon: "◎", label: "Options signals", detail: "1–5 per day on high-probability setups" },
  { icon: "⬡", label: "Futures signals", detail: "/ES and /NQ scalp setups during key sessions" },
  { icon: "◈", label: "SMS + Discord delivery", detail: "Alerts arrive in under 2 seconds" },
  { icon: "△", label: "Live signal dashboard", detail: "Real-time feed with full signal history" },
  { icon: "◇", label: "Strategy breakdown", detail: "Entry, stop, target, and rationale on every signal" },
  { icon: "⊞", label: "Full education library", detail: "All modules including Advanced" },
];

export default function ProSignupPage({ onNavigate = () => {} }) {
  const [step, setStep] = useState("form"); // "form" | "payment" | "success"
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mono = "'JetBrains Mono','Fira Code',monospace";

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setError("");
  }

  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10;
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please fill in your name and email.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.phone && !validatePhone(form.phone)) {
      setError("Please enter a valid phone number (10+ digits).");
      return;
    }
    setLoading(true);

    // Save to your backend before redirecting to payment
    // This lets you capture the lead even if they abandon checkout
    // await fetch("/api/leads", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ ...form, plan: "pro" }),
    // });

    await new Promise(r => setTimeout(r, 600));
    setLoading(false);

    // If using Stripe Payment Link (Option B) — redirect directly
    if (STRIPE_PAYMENT_LINK) {
      const url = new URL(STRIPE_PAYMENT_LINK);
      url.searchParams.set("prefilled_email", form.email);
      window.location.href = url.toString();
      return;
    }

    // Otherwise show payment step
    setStep("payment");
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
        .fi:focus { border-color: #00c97a; }
        .fi::placeholder { color: #2a3a4a; }
        .submit-btn {
          width: 100%;
          background: #00c97a;
          color: #030f08;
          border: none;
          padding: 15px;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          letter-spacing: 0.02em;
        }
        .submit-btn:hover:not(:disabled) { background: #00e688; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ghost-btn {
          width: 100%;
          background: none;
          color: #4a6a8a;
          border: 1px solid #1a2a3a;
          padding: 13px;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ghost-btn:hover { border-color: #2a4060; color: #7a9aaa; }
        .grid-bg {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(0,180,100,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,180,100,0.03) 1px, transparent 1px);
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
          <span style={{ fontSize: 13, color: "#3a5a7a" }}>Want free first?</span>
          <button onClick={() => onNavigate("/signup/free")} style={{ background: "none", border: "1px solid #1a3a5a", color: "#4a8adf", fontFamily: "inherit", fontSize: 13, padding: "6px 16px", borderRadius: 3, cursor: "pointer" }}>
            Start Free
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "60px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>

          {/* Left — plan details */}
          <AnimSection>
            <div>
              <div style={{ fontFamily: mono, fontSize: 10, color: "#00c97a", letterSpacing: "0.2em", marginBottom: 12 }}>PRO PLAN</div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#e8f0f8", lineHeight: 1.15, marginBottom: 8 }}>
                $36<span style={{ fontSize: 18, color: "#5a7a9a", fontWeight: 400 }}>/month</span>
              </h1>
              <p style={{ fontSize: 15, color: "#5a7a9a", lineHeight: 1.8, marginBottom: 32, marginTop: 12 }}>
                Full access — options and futures signals delivered by SMS and Discord, live dashboard, and the complete education library.
              </p>

              {/* Features */}
              <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 4, padding: "20px 22px", marginBottom: 24 }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 16 }}>EVERYTHING INCLUDED</div>
                {PRO_FEATURES.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < PRO_FEATURES.length - 1 ? "1px solid #0a1828" : "none" }}>
                    <span style={{ color: "#00c97a", fontSize: 14, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                    <div>
                      <div style={{ color: "#c8d8e8", fontSize: 13, fontWeight: 500 }}>{f.label}</div>
                      <div style={{ color: "#3a5a7a", fontSize: 12, marginTop: 2 }}>{f.detail}</div>
                    </div>
                    <span style={{ color: "#00c97a", marginLeft: "auto", fontSize: 13, flexShrink: 0 }}>✓</span>
                  </div>
                ))}
              </div>

              {/* Guarantee */}
              <div style={{ background: "#060c14", border: "1px solid #0a1828", borderRadius: 4, padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>⬡</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 4 }}>Cancel anytime</div>
                  <div style={{ fontSize: 12, color: "#3a5a7a", lineHeight: 1.65 }}>
                    No contracts, no cancellation fees. If you cancel, you keep access through the end of your billing period. We don't do refunds on used months, but you're never locked in.
                  </div>
                </div>
              </div>

              {/* Social proof */}
              <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
                {[
                  { value: "170+", label: "Active subscribers" },
                  { value: "< 2s", label: "Alert delivery" },
                  { value: "0DTE", label: "Primary focus" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 600, color: "#00c97a" }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#2a4060", marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </AnimSection>

          {/* Right — form or payment */}
          <AnimSection delay={0.15}>

            {step === "form" && (
              <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 4, padding: "32px 28px" }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 6 }}>STEP 1 OF 2</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#c8d8e8", marginBottom: 24 }}>Your details</div>

                <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                      Phone number <span style={{ color: "#2a3a4a" }}>(for SMS alerts)</span>
                    </label>
                    <input className="fi" type="tel" placeholder="+1 (305) 555-0100" value={form.phone} onChange={e => setField("phone", e.target.value)} />
                    <div style={{ fontSize: 11, color: "#2a3a4a", marginTop: 6 }}>Used only for signal delivery. Standard SMS rates apply.</div>
                  </div>

                  {error && (
                    <div style={{ fontSize: 12, color: "#e05050", background: "#200808", border: "1px solid #300a0a", borderRadius: 3, padding: "10px 14px" }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Saving..." : "Continue to Payment →"}
                  </button>

                  <p style={{ fontSize: 11, color: "#1e2a38", textAlign: "center", lineHeight: 1.6 }}>
                    Next step: secure payment via Stripe.<br />Your card info never touches our servers.
                  </p>
                </form>
              </div>
            )}

            {step === "payment" && (
              <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 4, padding: "32px 28px" }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 6 }}>STEP 2 OF 2</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#c8d8e8", marginBottom: 8 }}>Payment</div>

                {/* Order summary */}
                <div style={{ background: "#060c14", border: "1px solid #0a1020", borderRadius: 3, padding: "14px 16px", marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#5a7a9a" }}>Signalos Pro</span>
                    <span style={{ color: "#c8d8e8", fontWeight: 600 }}>$36 / month</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 8, color: "#3a5a7a" }}>
                    <span>{form.email}</span>
                    <span>Billed monthly</span>
                  </div>
                </div>

                {/* Stripe redirect option */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: "#5a7a9a", lineHeight: 1.7, marginBottom: 20 }}>
                    You'll be taken to Stripe's secure checkout page to complete your payment. Stripe handles all card data — we never see your card number.
                  </p>

                  {/* 
                    TO WIRE THIS UP:
                    
                    Option A — Stripe Payment Link (simplest, no backend needed):
                    Set STRIPE_PAYMENT_LINK at the top of this file.
                    The form submit above will redirect automatically.
                    
                    Option B — Stripe Checkout Session (backend needed):
                    Call your backend to create a session, then redirect:
                    
                    const res = await fetch("/api/create-checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: form.email,
                        name: form.name,
                        phone: form.phone,
                        priceId: "price_1ABC..." // your Stripe price ID
                      })
                    });
                    const { url } = await res.json();
                    window.location.href = url;
                  */}
                  <button
                    className="submit-btn"
                    onClick={() => {
                      // Replace this with your actual Stripe redirect logic above
                      alert("Wire up your Stripe Payment Link here. See comments in ProSignupPage.jsx.");
                    }}
                  >
                    Pay $36/mo with Stripe →
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#2a3a4a", justifyContent: "center" }}>
                  <span>🔒</span>
                  <span>Secured by Stripe · Cancel anytime</span>
                </div>

                <button onClick={() => setStep("form")} style={{ marginTop: 16, background: "none", border: "none", color: "#2a4060", fontFamily: "inherit", fontSize: 12, cursor: "pointer", width: "100%", textAlign: "center" }}>
                  ← Back
                </button>
              </div>
            )}

            {step === "success" && (
              <div style={{ background: "#080f1c", border: "1px solid #0a3020", borderRadius: 4, padding: "40px 28px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#e8f0f8", marginBottom: 12 }}>
                  Welcome to Pro, {form.name.split(" ")[0]}
                </div>
                <p style={{ fontSize: 14, color: "#5a7a9a", lineHeight: 1.8, marginBottom: 28 }}>
                  Your subscription is active. Join the Discord to get access to the Pro channels, and your SMS alerts will be set up within 24 hours.
                </p>
                <a
                  href={DISCORD_INVITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", background: "#5865F2", color: "#fff", padding: "13px 28px", borderRadius: 3, fontWeight: 600, fontSize: 14, textDecoration: "none", marginBottom: 16 }}
                >
                  Join Discord Server →
                </a>
                <div style={{ marginTop: 16 }}>
                  <button
                    onClick={() => onNavigate("/learn")}
                    style={{ background: "none", border: "1px solid #1a3a5a", color: "#4a8adf", fontFamily: "inherit", fontSize: 13, padding: "10px 20px", borderRadius: 3, cursor: "pointer" }}
                  >
                    Start the education library →
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