// ─────────────────────────────────────────────────────────────────────────────
// PRIVACY POLICY — src/pages/PrivacyPage.jsx
// Route: /privacy
//
// IMPORTANT: This is a starting template, not legal advice. Have an actual
// attorney review this before relying on it. It's written to honestly reflect
// what the codebase actually does today (Formspree, Discord webhooks, Stripe,
// Twilio) — if you add/remove a third-party tool, update this page to match.
// ─────────────────────────────────────────────────────────────────────────────

const LAST_UPDATED = "September 22, 2026";
const CONTACT_EMAIL = "support@alertgods.com"; // ← update once your inbox is live
const COMPANY_NAME = "AlertGods";

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#e8f0f8", marginBottom: 10 }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: "#7a9aba", lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

export default function PrivacyPage({ onNavigate = () => {} }) {
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

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 40px 100px" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: "#4a8adf", letterSpacing: "0.2em", marginBottom: 10 }}>LEGAL</div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,4vw,36px)", fontWeight: 800, color: "#e8f0f8", marginBottom: 8 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: "#3a5a7a", marginBottom: 40 }}>Last updated: {LAST_UPDATED}</p>

        <Section title="1. What we collect">
          When you sign up for the Free or Pro plan, we collect your name, email address, and (Pro only) phone number and Discord
          username. We don't collect payment card details ourselves — those go directly to Stripe, our payment processor, and never
          touch our servers.
        </Section>

        <Section title="2. How we use it">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Email and phone — to deliver signal alerts and account/billing notices</li>
            <li>Discord username — to help identify you in our Discord server, if provided</li>
            <li>Name and email — to notify our team internally of new signups so we can support you</li>
          </ul>
        </Section>

        <Section title="3. Who we share it with">
          We don't sell your data. It's shared only with the services that make {COMPANY_NAME} work:
          <ul style={{ margin: "10px 0 0", paddingLeft: 20 }}>
            <li><strong>Stripe</strong> — processes Pro subscription payments and stores your billing details under Stripe's own privacy policy</li>
            <li><strong>Twilio</strong> — delivers SMS alerts to Pro subscribers who opt in</li>
            <li><strong>Discord</strong> — hosts our community server; your Discord activity is governed by Discord's own privacy policy</li>
            <li><strong>Formspree</strong> — receives a copy of signup form submissions so our team gets notified</li>
          </ul>
        </Section>

        <Section title="4. How long we keep it">
          We keep your subscriber record for as long as your account is active, plus a reasonable period afterward for support and
          legal recordkeeping. You can ask us to delete your data at any time (see Section 6).
        </Section>

        <Section title="5. Security">
          We take reasonable steps to protect the data we hold, but no online service can guarantee perfect security. Don't share
          sensitive information (passwords, card numbers) with us directly — we never ask for it outside of Stripe's own checkout.
        </Section>

        <Section title="6. Your choices">
          You can opt out of SMS at any time by replying STOP to any text. You can leave our Discord server at any time. To update,
          export, or delete the personal data we hold about you, email {CONTACT_EMAIL} and we'll handle it directly — there's no
          self-serve account portal yet.
        </Section>

        <Section title="7. Children's privacy">
          This service is not directed at, and we do not knowingly collect data from, anyone under 18.
        </Section>

        <Section title="8. Changes to this policy">
          If this policy changes, we'll update the "Last updated" date above. Material changes affecting how we use your data will
          be announced in our Discord server.
        </Section>

        <Section title="9. Contact">
          Questions about your data? Email {CONTACT_EMAIL} or visit our <a href="#/contact">Contact page</a>.
        </Section>
      </div>
    </div>
  );
}
