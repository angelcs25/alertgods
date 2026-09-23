// ─────────────────────────────────────────────────────────────────────────────
// CONTACT PAGE — src/pages/ContactPage.jsx
// Route: /contact
//
// Static info page (email + Discord) rather than a form — there's no backend
// endpoint to receive a contact form yet. If you want one, it's a small add:
// a POST /api/contact route in scanner.js that emails or Discords the message.
// ─────────────────────────────────────────────────────────────────────────────

const CONTACT_EMAIL = "support@alertgods.com"; // ← update once your inbox is live
const DISCORD_INVITE = "https://discord.gg/s7vHMnGfX";

export default function ContactPage({ onNavigate = () => {} }) {
  const mono = "'JetBrains Mono','Fira Code',monospace";

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#050c18", color: "#c8d8e8", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; } a { color: #4a8adf; }`}</style>

      <nav style={{ padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #0a1828" }}>
        <button onClick={() => onNavigate("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ fontFamily: mono, color: "#00c97a", fontSize: 14, fontWeight: 600, letterSpacing: "0.1em" }}>◈ SIGNALOS</span>
        </button>
        <a href="#/" style={{ fontSize: 13, color: "#4a8adf", textDecoration: "none" }}>← Back home</a>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 40px 120px", textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: "#4a8adf", letterSpacing: "0.2em", marginBottom: 12 }}>GET IN TOUCH</div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,36px)", fontWeight: 800, color: "#e8f0f8", marginBottom: 16 }}>
          Questions? We're here.
        </h1>
        <p style={{ fontSize: 15, color: "#5a7a9a", lineHeight: 1.8, marginBottom: 40 }}>
          Billing, signals, technical issues, or anything else — reach out and we'll get back to you, usually within one business day.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{ display: "inline-block", background: "#00c97a", color: "#030f08", padding: "14px 32px", borderRadius: 3, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
          >
            {CONTACT_EMAIL}
          </a>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", background: "#5865F2", color: "#fff", padding: "13px 28px", borderRadius: 3, fontWeight: 600, fontSize: 14, textDecoration: "none" }}
          >
            Ask in Discord →
          </a>
        </div>

        <p style={{ fontSize: 12, color: "#2a3a4a", marginTop: 48, lineHeight: 1.7 }}>
          Billing questions can also be managed directly from the receipt email Stripe sends you after each charge.
        </p>
      </div>
    </div>
  );
}
