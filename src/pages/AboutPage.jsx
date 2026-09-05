import { useRef, useState, useEffect } from "react";

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
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

const TEAM = [
  {
    initials: "MR",
    name: "Angel Ore",
    role: "Head Trader / Founder",
    bio: "8 years trading options and futures experience. Built AlertGods to be able to use Claude for trading and share setups that actually work.",
    color: "#00c97a",
  },
  {
    initials: "IK",
    name: "Isaac Kuon",
    role: "Quant / Systems",
    bio: "Background in quantitative research. Builds and maintains the signal models, delivery infrastructure, and performance tracking. Obsessed with risk-adjusted returns.",
    color: "#4a9adf",
  },
  {
    initials: "NY",
    name: "Nyle Yumeen",
    role: "Education Lead",
    bio: "Options educator with 7 years of trading experience. Runs the education library and weekly breakdowns. Believes understanding a trade matters as much as taking it.",
    color: "#e0a030",
  },
];

const TIMELINE = [
  { year: "2021", label: "Founded", desc: "Started as a private Discord group sharing daily options setups." },
  { year: "2022", label: "SMS Launch", desc: "Built real-time SMS delivery after Discord delays cost members entries." },
  { year: "2023", label: "Futures Added", desc: "Expanded to /ES and /NQ scalp signals during active market sessions." },
  { year: "2024", label: "Live Dashboard", desc: "Launched the subscriber terminal with real-time feed and performance tracking." },
  { year: "2025", label: "AI Integration", desc: "Integrated Claude to assist with signal generation and setup analysis." },
];

const VALUES = [
  { icon: "◎", title: "Transparency First", desc: "Every signal includes the strategy name, timeframe, entry rationale, and confidence score. No black boxes, no mystery trades." },
  { icon: "△", title: "Speed That Matters", desc: "Sub-2-second delivery from signal generation to your phone. In options trading, lag is money." },
  { icon: "◈", title: "Real Track Record", desc: "We log every signal at the time it's sent. Wins and losses. No cherry-picking, no backtested fantasy results." },
  { icon: "⬡", title: "Education Built In", desc: "We want you to understand the setups, not just copy them. Every subscriber gets access to the education library." },
];

const FAQS = [
  {
    q: "Are these signals guaranteed to be profitable?",
    a: "No. Trading involves risk and past performance does not guarantee future results. Our win rate reflects historical signal outcomes and is provided for informational purposes only. Always size your positions appropriately.",
  },
  {
    q: "How fast do I receive signals?",
    a: "SMS and Discord delivery typically occurs within 1–2 seconds of signal publication. We've built our delivery stack specifically for low-latency alert broadcasting.",
  },
  {
    q: "Do I need a specific broker?",
    a: "No. AlertGods is broker-agnostic. You receive the signal and execute it in whatever platform you use — Tastytrade, TD Ameritrade/thinkorswim, IBKR, Webull, etc.",
  },
  {
    q: "How many signals per day?",
    a: "Typically 5–15 depending on your plan and market conditions. We only send signals that meet our confidence threshold — we'd rather send fewer high-quality alerts than flood you with noise.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, anytime. No contracts, no cancellation fees. You keep access through the end of your billing period.",
  },
];

export default function AboutPage({ onNavigate = () => {} }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#050c18",
      color: "#c8d8e8",
      minHeight: "100vh",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050c18; }
        ::-webkit-scrollbar-thumb { background: #1a2a3a; border-radius: 2px; }
        .section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #00c97a;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          color: #e8f0f8;
          line-height: 1.1;
        }
        .value-card {
          background: #080f1c;
          border: 1px solid #0f1e30;
          border-radius: 4px;
          padding: 24px 22px;
          transition: border-color 0.25s, transform 0.25s;
        }
        .value-card:hover { border-color: #1a3a5a; transform: translateY(-2px); }
        .faq-item {
          border-bottom: 1px solid #0a1828;
          padding: 18px 0;
          cursor: pointer;
        }
        .faq-item:last-child { border-bottom: none; }
        .team-card {
          background: #080f1c;
          border: 1px solid #0f1e30;
          border-radius: 4px;
          padding: 28px 24px;
          flex: 1;
        }
        .nav-link {
          color: #5a7a9a; text-decoration: none; font-size: 13px; font-weight: 500;
          letter-spacing: 0.03em; transition: color 0.2s; cursor: pointer;
          background: none; border: none; font-family: inherit; padding: 0;
        }
        .nav-link:hover { color: #c8d8e8; }
        .cta-ghost {
          background: transparent; color: #7a9aba; border: 1px solid #1a3a5a;
          padding: 10px 22px; border-radius: 3px; font-size: 13px; font-weight: 500;
          font-family: inherit; cursor: pointer; transition: border-color 0.2s, color 0.2s;
        }
        .cta-ghost:hover { border-color: #2a5a7a; color: #c8d8e8; }
        .cta-primary {
          background: #00c97a; color: #030f08; border: none; padding: 10px 22px;
          border-radius: 3px; font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: background 0.2s;
        }
        .cta-primary:hover { background: #00e688; }
        .grid-bg {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(0,180,100,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,100,0.025) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none;
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(5,12,24,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid #0f1e30" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s",
      }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#00c97a", fontSize: 14, fontWeight: 600, letterSpacing: "0.1em" }}>◈ALERTGODS</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["About","Learn to Trade","Pricing"].map(l => (
            <button key={l} className="nav-link" style={{ color: l === "About" ? "#c8d8e8" : undefined }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="cta-ghost">Log In</button>
          <button className="cta-primary">Join Now</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", padding: "140px 40px 80px", overflow: "hidden" }}>
        <div className="grid-bg" />
        <div style={{ position: "absolute", width: 400, height: 400, background: "rgba(0,80,160,0.10)", borderRadius: "50%", filter: "blur(80px)", top: -80, right: -60, pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <AnimSection>
            <div className="section-label">WHO WE ARE</div>
            <h1 className="section-title" style={{ maxWidth: 620, marginBottom: 20 }}>
              Built by traders,<br />
              <span style={{ color: "#00c97a" }}>for traders.</span>
            </h1>
            <p style={{ fontSize: 16, color: "#5a7a9a", lineHeight: 1.8, maxWidth: 560 }}>
              ALERTGODS started as a private group of traders sharing real-time setups on Discord. When the results proved consistent, we built the infrastructure to deliver those signals to anyone — instantly, with full context.
            </p>
          </AnimSection>
        </div>
      </section>

      {/* ── ORIGIN STORY ── */}
      <section style={{ padding: "80px 40px", background: "#060d18", borderTop: "1px solid #0a1828", borderBottom: "1px solid #0a1828" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <AnimSection>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
              <div>
                <div className="section-label">THE ORIGIN</div>
                <h2 className="section-title" style={{ marginBottom: 20 }}>Why we built this</h2>
                <p style={{ fontSize: 15, color: "#5a7a9a", lineHeight: 1.85, marginBottom: 18 }}>
                  Most alert services send you a ticker and a direction with no context. You have no idea why the trade makes sense, when to get out, or how much to risk. After losing money following blindly, we built something different.
                </p>
                <p style={{ fontSize: 15, color: "#5a7a9a", lineHeight: 1.85 }}>
                  Every ALERTGODS alert includes the full setup: entry zone, stop, target, strategy, timeframe, and a rationale. You can replicate it, learn from it, or skip it — but you always know what you're looking at.
                </p>
              </div>

              {/* Timeline */}
              <div>
                {TIMELINE.map((t, i) => (
                  <AnimSection key={i} delay={i * 0.08}>
                    <div style={{ display: "flex", gap: 18, marginBottom: 20, alignItems: "flex-start" }}>
                      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#00c97a", fontWeight: 600, marginBottom: 6 }}>{t.year}</div>
                        {i < TIMELINE.length - 1 && <div style={{ width: 1, height: 36, background: "#0f1e30" }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 4 }}>{t.label}</div>
                        <div style={{ fontSize: 12, color: "#3a5a7a", lineHeight: 1.6 }}>{t.desc}</div>
                      </div>
                    </div>
                  </AnimSection>
                ))}
              </div>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <AnimSection>
            <div style={{ marginBottom: 48 }}>
              <div className="section-label">WHAT WE STAND FOR</div>
              <h2 className="section-title">How we operate</h2>
            </div>
          </AnimSection>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {VALUES.map((v, i) => (
              <AnimSection key={i} delay={i * 0.1}>
                <div className="value-card">
                  <div style={{ fontSize: 22, marginBottom: 14, color: "#00c97a" }}>{v.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#c8d8e8", marginBottom: 10 }}>{v.title}</div>
                  <div style={{ fontSize: 13, color: "#4a6a8a", lineHeight: 1.75 }}>{v.desc}</div>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: "80px 40px", background: "#060d18", borderTop: "1px solid #0a1828", borderBottom: "1px solid #0a1828" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <AnimSection>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <div className="section-label">THE TEAM</div>
              <h2 className="section-title">Who's behind the signals</h2>
            </div>
          </AnimSection>
          <div style={{ display: "flex", gap: 20 }}>
            {TEAM.map((member, i) => (
              <AnimSection key={i} delay={i * 0.12}>
                <div className="team-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: `${member.color}18`,
                      border: `1px solid ${member.color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13, fontWeight: 600, color: member.color,
                      flexShrink: 0,
                    }}>{member.initials}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#c8d8e8" }}>{member.name}</div>
                      <div style={{ fontSize: 11, color: "#3a5a7a", marginTop: 2 }}>{member.role}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#4a6a8a", lineHeight: 1.75 }}>{member.bio}</div>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <AnimSection>
            <div style={{ marginBottom: 48 }}>
              <div className="section-label">FAQ</div>
              <h2 className="section-title">Common questions</h2>
            </div>
          </AnimSection>
          <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 4, padding: "0 28px" }}>
            {FAQS.map((faq, i) => (
              <AnimSection key={i} delay={i * 0.06}>
                <div
                  className="faq-item"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, color: "#c8d8e8", fontWeight: 500, paddingRight: 16 }}>{faq.q}</span>
                    <span style={{ color: "#2a4a6a", fontSize: 16, flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                  </div>
                  {openFaq === i && (
                    <div style={{ fontSize: 13, color: "#4a6a8a", lineHeight: 1.8, marginTop: 12, paddingRight: 32 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "80px 40px", background: "#060d18", borderTop: "1px solid #0a1828" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <AnimSection>
            <div className="section-label" style={{ justifyContent: "center", display: "flex" }}>READY TO START</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Join over 170 active subscribers</h2>
            <p style={{ fontSize: 15, color: "#3a5a7a", marginBottom: 36, maxWidth: 440, margin: "0 auto 36px" }}>
              Start For Free. Full access, no credit card required.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="cta-primary">Start For Freel →</button>
              {/* <button className="cta-ghost">View Performance</button> */}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px", borderTop: "1px solid #0a1828", background: "#050c18" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#1a3a5a", fontSize: 12, letterSpacing: "0.1em" }}>◈ALERTGODS</span>
          <span style={{ fontSize: 11, color: "#1a2a3a" }}>Trading involves risk. Past performance is not indicative of future results.</span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Terms","Privacy","Discord","Contact"].map(l => (
              <span key={l} style={{ fontSize: 11, color: "#2a4a6a", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
