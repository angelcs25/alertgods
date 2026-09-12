import { useState, useEffect, useRef } from "react";
import { MODULE_FIRST_LESSON } from "../modules/lessonRegistry";

// ─── Data ─────────────────────────────────────────────────────────────────────

const MODULES = [
  {
    id: "options-basics",
    icon: "◎",
    label: "OPTIONS BASICS",
    title: "How Options Work",
    level: "Beginner",
    lessons: 7,
    time: "45 min",
    color: "#00c97a",
    desc: "Understand calls, puts, contracts, and the rights they give you. Learn why options are powerful tools for leveraged, defined-risk trading.",
    topics: ["What is a call vs put", "Strike price & expiration", "In / Out of the money", "Option premium breakdown", "Buying vs selling options", "Exercise & assignment", "Bid-ask spread basics"],
  },
  {
    id: "reading-greeks",
    icon: "△",
    label: "READING GREEKS",
    title: "Understanding the Greeks",
    level: "Intermediate",
    lessons: 6,
    time: "40 min",
    color: "#4a9adf",
    desc: "Delta, gamma, theta, and vega tell you exactly how your option will behave. Mastering Greeks turns signal-following into real understanding.",
    topics: ["Delta — directional exposure", "Gamma — rate of delta change", "Theta — time decay explained", "Vega — sensitivity to IV", "Choosing the right delta", "Why theta destroys 0DTE buys"],
  },
  {
    id: "0dte-strategies",
    icon: "◈",
    label: "0DTE STRATEGIES",
    title: "0-5 DTE Trading",
    level: "Intermediate",
    lessons: 10,
    time: "60 min",
    color: "#e0a030",
    desc: "Short-dated options are high-risk, high-reward. Learn when to trade them, how to size positions, and why most people blow up trading 0DTE.",
    topics: ["What 0-5DTE means", "Why theta kills mid-day", "Best times to enter 0DTE", "Strike selection for 0DTE", "Stop loss discipline", "Target-setting with gamma", "Market open setups", "Power hour plays", "When to avoid 0DTE", "Position sizing rules"],
  },
  {
    id: "futures-scalping",
    icon: "⬡",
    label: "FUTURES SCALPING",
    title: "Futures: /ES & /NQ",
    level: "Intermediate",
    lessons: 7,
    time: "50 min",
    color: "#c97adf",
    desc: "Futures trade nearly 24 hours and offer deep liquidity. Learn the mechanics of /ES and /NQ, tick values, margin, and how to read order flow.",
    topics: ["Futures vs stocks vs options", "/ES tick value ($12.50)", "/NQ tick value ($5.00)", "Margin & leverage explained", "Session hours & volume", "Key levels: VWAP, VPOC", "Order flow basics", "Scalp vs swing approach"],
  },
  {
    id: "risk-management",
    icon: "◇",
    label: "RISK MANAGEMENT",
    title: "Protecting Your Capital",
    level: "Beginner",
    lessons: 6,
    time: "35 min",
    color: "#e05050",
    desc: "Most traders blow up not because their setups are wrong — because their risk management is. This module covers the rules that keep you in the game.",
    topics: ["Max risk per trade (1-2%)", "Portfolio heat rules", "Hard stop vs mental stop", "Sizing by confidence", "When to cut early", "Recovery math (losses compound)"],
  },
  // {
  //   id: "order-flow",
  //   icon: "◉",
  //   label: "ORDER FLOW",
  //   title: "Reading Order Flow",
  //   level: "Advanced",
  //   lessons: 8,
  //   time: "55 min",
  //   color: "#4a9adf",
  //   desc: "Order flow is what the signals in this service are based on. Learn how to read the tape, spot absorption, and identify institutional activity.",
  //   topics: ["What is order flow", "DOM (Depth of Market)", "Tape reading basics", "Absorption vs exhaustion", "Imbalance in the book", "Volume delta", "Iceberg orders", "Applying flow to entries"],
  // },
  // {
  //   id: "chart-patterns",
  //   icon: "⊞",
  //   label: "CHART PATTERNS",
  //   title: "Price Action & Patterns",
  //   level: "Beginner",
  //   lessons: 9,
  //   time: "50 min",
  //   color: "#00c97a",
  //   desc: "Understand the chart patterns behind our signals — breakouts, bounces, squeezes, and reversals. Learn to spot them before we call them.",
  //   topics: ["Support & resistance", "EMA stack (8/21/50)", "VWAP reclaim", "Bull/bear flags", "Compression breakout", "Double top / bottom", "Gap fills & gap plays", "Rejection wicks", "Inside bars"],
  // },
  {
    id: "position-sizing",
    icon: "⊟",
    label: "POSITION SIZING",
    title: "How to Size Your Trades",
    level: "Beginner",
    lessons: 5,
    time: "30 min",
    color: "#e0a030",
    desc: "The fastest way to blow up is over-sizing. This module gives you a repeatable system for calculating how many contracts to trade on every signal.",
    topics: ["Account size buckets", "Fixed fractional sizing", "Volatility-adjusted sizing", "Options: max 2-5% of account", "Futures: 1 contract per $10K", "Scaling in and out"],
  },
];

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

const FAQS = [
  {
    q: "Do I need a background in finance to understand these courses?",
    a: "No. The Beginner modules start from zero — what an option is, what a contract represents, how money is made and lost. No prior knowledge assumed."
  },
  {
    q: "How do these courses connect to the signals?",
    a: "Every signal we send uses a specific strategy, timeframe, and strike selection logic. The courses explain exactly why those choices are made, so you can evaluate each signal yourself rather than blindly following it."
  },
  {
    q: "Is the education library included in my subscription?",
    a: "Beginner and Intermediate modules are included with all plans. Advanced modules (Order Flow, advanced futures) are included in Pro and Elite."
  },
  {
    q: "Are there live sessions or is it self-paced?",
    a: "All courses are self-paced — read and watch on your schedule. Elite subscribers get a 1-on-1 weekly review session with the head trader."
  },
  {
    q: "How often is the content updated?",
    a: "We update the library when market conditions change significantly — for example, when 0DTE options became available on most major names in 2023, we rewrote the short-dated options module entirely."
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
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
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LevelBadge({ level }) {
  const colors = {
    Beginner:     { bg: "#082018", color: "#00c97a", border: "#0a3020" },
    Intermediate: { bg: "#201808", color: "#e0a030", border: "#302010" },
    Advanced:     { bg: "#080a20", color: "#4a9adf", border: "#0a1040" },
  };
  const s = colors[level] || colors.Beginner;
  return (
    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 2, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {level.toUpperCase()}
    </span>
  );
}

function ModuleCard({ mod, onClick, isOpen, onNavigate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(mod.id)}
      style={{
        background: isOpen ? "#080f1c" : hovered ? "#080f1c" : "#060c14",
        border: `1px solid ${isOpen ? mod.color + "40" : hovered ? "#1a2a3a" : "#0f1e30"}`,
        borderLeft: `3px solid ${isOpen ? mod.color : hovered ? mod.color + "80" : "#1a2a3a"}`,
        borderRadius: 3,
        padding: "20px 22px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20, color: mod.color }}>{mod.icon}</span>
          <div>
            <div style={{ fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 3, fontFamily: "'JetBrains Mono', monospace" }}>{mod.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#c8d8e8" }}>{mod.title}</div>
          </div>
        </div>
        <span style={{ fontSize: 14, color: "#2a4060", transition: "transform 0.2s", transform: isOpen ? "rotate(45deg)" : "rotate(0)" }}>+</span>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: isOpen ? 14 : 0 }}>
        <LevelBadge level={mod.level} />
        <span style={{ fontSize: 10, color: "#2a4060", fontFamily: "'JetBrains Mono', monospace" }}>{mod.lessons} lessons</span>
        <span style={{ fontSize: 10, color: "#2a4060", fontFamily: "'JetBrains Mono', monospace" }}>~{mod.time}</span>
      </div>

      {/* Expanded */}
      {isOpen && (
        <div>
          <p style={{ fontSize: 13, color: "#5a7a9a", lineHeight: 1.75, marginBottom: 16 }}>{mod.desc}</p>
          <div style={{ fontSize: 10, color: "#2a4060", letterSpacing: "0.1em", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>TOPICS COVERED</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
            {mod.topics.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4a6a8a" }}>
                <span style={{ color: mod.color, fontSize: 8 }}>▸</span>
                {t}
              </div>
            ))}
          </div>
          {(() => {
            const firstLesson = MODULE_FIRST_LESSON[mod.id];
            if (firstLesson) {
              return (
                <button
                  onClick={e => { e.stopPropagation(); onNavigate(`/learn/${firstLesson}`); }}
                  style={{ marginTop: 18, background: mod.color, color: "#030f08", border: "none", padding: "9px 20px", borderRadius: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", cursor: "pointer" }}
                >
                  START MODULE →
                </button>
              );
            }
            return (
              <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, color: "#2a4060", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a2a3a", display: "inline-block" }} />
                COMING SOON
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LearnPage({ onNavigate = () => {} }) {
  const [activeLevel, setActiveLevel] = useState("All");
  const [openModule, setOpenModule] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleModule(id) {
    setOpenModule(prev => prev === id ? null : id);
  }

  const filtered = activeLevel === "All" ? MODULES : MODULES.filter(m => m.level === activeLevel);

  const beginnerCount     = MODULES.filter(m => m.level === "Beginner").length;
  const intermediateCount = MODULES.filter(m => m.level === "Intermediate").length;
  const advancedCount     = MODULES.filter(m => m.level === "Advanced").length;
  const totalLessons      = MODULES.reduce((a, m) => a + m.lessons, 0);

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

        .nav-link {
          color: #5a7a9a;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.03em;
          transition: color 0.2s;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
          padding: 0;
        }
        .nav-link:hover { color: #c8d8e8; }

        .cta-primary {
          background: #00c97a;
          color: #030f08;
          border: none;
          padding: 10px 22px;
          border-radius: 3px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s;
        }
        .cta-primary:hover { background: #00e688; }

        .cta-ghost {
          background: transparent;
          color: #7a9aba;
          border: 1px solid #1a3a5a;
          padding: 10px 22px;
          border-radius: 3px;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .cta-ghost:hover { border-color: #2a5a7a; color: #c8d8e8; }

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
          font-size: clamp(26px, 4vw, 40px);
          font-weight: 800;
          color: #e8f0f8;
          line-height: 1.1;
        }

        .filter-btn {
          background: none;
          border: 1px solid #1a2530;
          color: #3a5a7a;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 6px 14px;
          border-radius: 2px;
          cursor: pointer;
          letter-spacing: 0.08em;
          transition: all 0.15s;
        }
        .filter-btn:hover { border-color: #2a4060; color: #7a9aaa; }
        .filter-btn.active { background: #082018; color: #00c97a; border-color: #0a3020; }

        .faq-item {
          border-bottom: 1px solid #0a1828;
          padding: 18px 0;
          cursor: pointer;
        }
        .faq-item:last-child { border-bottom: none; }

        .grid-bg {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(0,180,100,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,180,100,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(5,12,24,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid #0f1e30" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s",
      }}>
        <button onClick={() => onNavigate("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#00c97a", fontSize: 14, fontWeight: 600, letterSpacing: "0.1em" }}>◈ ALERTGODS</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {[["About", "/about"], ["Learn to Trade", "/learn"], ["Pricing", "/pricing"], ["Dashboard", "/login"]].map(([l, path]) => (
            <button key={l} className="nav-link" onClick={() => onNavigate(path)}
              style={{ color: l === "Learn to Trade" ? "#c8d8e8" : undefined }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="cta-ghost" onClick={() => onNavigate("/login")}>Dashboard</button>
          <button className="cta-primary" onClick={() => onNavigate("/")}>Join Now</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", padding: "140px 40px 80px", overflow: "hidden" }}>
        <div className="grid-bg" />
        <div style={{ position: "absolute", width: 500, height: 500, background: "rgba(0,180,100,0.06)", borderRadius: "50%", filter: "blur(80px)", top: -100, right: -100, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <AnimSection>
            <div className="section-label">EDUCATION LIBRARY</div>
            <h1 className="section-title" style={{ maxWidth: 640, marginBottom: 20 }}>
              Don't just follow signals.<br />
              <span style={{ color: "#00c97a" }}>Understand them.</span>
            </h1>
            <p style={{ fontSize: 16, color: "#5a7a9a", lineHeight: 1.8, maxWidth: 520, marginBottom: 36 }}>
              Every signal we send is built on a specific setup, strategy, and reasoning. This library teaches you exactly how to read them — and eventually spot them yourself.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="cta-primary" onClick={() => document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })}>Browse Modules →</button>
              <button className="cta-ghost" onClick={() => onNavigate("/login")}>View Signals</button>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ borderTop: "1px solid #0a1828", borderBottom: "1px solid #0a1828", background: "#060d18" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex" }}>
          {[
            { value: String(MODULES.length), label: "Modules", sub: "Across all levels" },
            { value: String(totalLessons), label: "Total Lessons", sub: "Self-paced" },
            { value: String(beginnerCount), label: "Beginner", sub: "No experience needed" },
            { value: String(intermediateCount), label: "Intermediate", sub: "Build on the basics" },
            { value: String(advancedCount), label: "Advanced", sub: "For active traders" },
          ].map((s, i) => (
            <AnimSection key={i} delay={i * 0.08}>
              <div style={{ flex: 1, padding: "28px 32px", borderRight: i < 4 ? "1px solid #0a1828" : "none" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 600, color: "#00c97a", marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#c8d8e8", fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#2a4060" }}>{s.sub}</div>
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* ── MODULES ── */}
      <section id="modules" style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AnimSection>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div className="section-label">ALL MODULES</div>
                <h2 className="section-title">What you'll learn</h2>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {LEVELS.map(l => (
                  <button key={l} className={`filter-btn${activeLevel === l ? " active" : ""}`} onClick={() => setActiveLevel(l)}>{l}</button>
                ))}
              </div>
            </div>
          </AnimSection>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map((mod, i) => (
              <AnimSection key={mod.id} delay={i * 0.06}>
                <ModuleCard mod={mod} onClick={toggleModule} isOpen={openModule === mod.id} onNavigate={onNavigate} />
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT'S STRUCTURED ── */}
      <section style={{ padding: "80px 40px", background: "#060d18", borderTop: "1px solid #0a1828", borderBottom: "1px solid #0a1828" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AnimSection>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
              <div>
                <div className="section-label">HOW IT WORKS</div>
                <h2 className="section-title" style={{ marginBottom: 20 }}>Built around how we actually trade</h2>
                <p style={{ fontSize: 15, color: "#5a7a9a", lineHeight: 1.85, marginBottom: 20 }}>
                  The courses in this library aren't generic YouTube-style option tutorials. They're written around the specific setups, timeframes, and risk rules we use when generating signals.
                </p>
                <p style={{ fontSize: 15, color: "#5a7a9a", lineHeight: 1.85 }}>
                  When you see a signal for a 0DTE SPY call on an EMA breakout, you'll understand exactly what that means, why the strike was chosen, and how to evaluate whether to take it.
                </p>
              </div>

              {/* Path visual */}
              <div>
                {[
                  { step: "01", label: "Start with Basics", desc: "Options fundamentals, how contracts work, and Greeks — the building blocks.", color: "#00c97a" },
                  { step: "02", label: "Learn the Setups", desc: "Chart patterns, order flow, and the strategies behind each signal type.", color: "#4a9adf" },
                  { step: "03", label: "Apply Risk Rules", desc: "Position sizing, stops, and the discipline that keeps you in the game.", color: "#e0a030" },
                  { step: "04", label: "Trade with Context", desc: "Use live signals alongside your education — understand every entry.", color: "#c97adf" },
                ].map((step, i) => (
                  <AnimSection key={i} delay={i * 0.1}>
                    <div style={{ display: "flex", gap: 18, marginBottom: 24, alignItems: "flex-start" }}>
                      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: step.color, fontWeight: 600, background: step.color + "15", border: `1px solid ${step.color}40`, borderRadius: 2, padding: "3px 8px", marginBottom: 6 }}>{step.step}</div>
                        {i < 3 && <div style={{ width: 1, height: 30, background: "#0f1e30" }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 4 }}>{step.label}</div>
                        <div style={{ fontSize: 12, color: "#3a5a7a", lineHeight: 1.6 }}>{step.desc}</div>
                      </div>
                    </div>
                  </AnimSection>
                ))}
              </div>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ── QUICK REFERENCE CARDS ── */}
      <section style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AnimSection>
            <div style={{ marginBottom: 48 }}>
              <div className="section-label">QUICK REFERENCE</div>
              <h2 className="section-title">Key concepts at a glance</h2>
            </div>
          </AnimSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Delta", value: "0.50Δ", desc: "ATM option moves $0.50 for every $1 in stock", color: "#4a9adf" },
              { label: "Theta", value: "−$0.05/day", desc: "Time decay costs you ~5 cents per contract daily", color: "#e05050" },
              { label: "0DTE Gamma", value: "⚡ extreme", desc: "Small moves = massive premium swings near expiry", color: "#e0a030" },
              { label: "/ES Tick", value: "$12.50", desc: "Each 0.25 tick move on /ES = $12.50 profit or loss", color: "#c97adf" },
              { label: "Max Risk Rule", value: "1–2%", desc: "Never risk more than 1-2% of your account per trade", color: "#00c97a" },
              { label: "IV Crush", value: "After earnings", desc: "IV spikes before events, collapses after — kills option buyers", color: "#e05050" },
              { label: "/NQ Tick", value: "$5.00", desc: "Each 0.25 tick move on /NQ = $5.00 profit or loss", color: "#4a9adf" },
              { label: "VWAP", value: "Intraday avg", desc: "Volume-weighted average price — key level for intraday bias", color: "#00c97a" },
            ].map((card, i) => (
              <AnimSection key={i} delay={i * 0.07}>
                <div style={{ background: "#060c14", border: "1px solid #0f1e30", borderLeft: `3px solid ${card.color}`, borderRadius: 3, padding: "16px 18px", height: "100%" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#2a4060", letterSpacing: "0.12em", marginBottom: 6 }}>{card.label.toUpperCase()}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 600, color: card.color, marginBottom: 8 }}>{card.value}</div>
                  <div style={{ fontSize: 11, color: "#3a5a7a", lineHeight: 1.65 }}>{card.desc}</div>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "80px 40px", background: "#060d18", borderTop: "1px solid #0a1828" }}>
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
                <div className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, color: "#c8d8e8", fontWeight: 500, paddingRight: 16 }}>{faq.q}</span>
                    <span style={{ color: "#2a4a6a", fontSize: 16, flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                  </div>
                  {openFaq === i && (
                    <div style={{ fontSize: 13, color: "#4a6a8a", lineHeight: 1.8, marginTop: 12, paddingRight: 32 }}>{faq.a}</div>
                  )}
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <AnimSection>
            <div className="section-label" style={{ justifyContent: "center", display: "flex" }}>START LEARNING</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Education is included with every plan</h2>
            <p style={{ fontSize: 15, color: "#3a5a7a", marginBottom: 36, maxWidth: 440, margin: "0 auto 36px" }}>
              Beginner and Intermediate modules are free with any subscription. Advanced modules unlock with Pro and Elite.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="cta-primary" onClick={() => onNavigate("/")}>Start For Free →</button>
              <button className="cta-ghost" onClick={() => onNavigate("/login")}>View Signals</button>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "40px", borderTop: "1px solid #0a1828", background: "#050c18" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#1a3a5a", fontSize: 12, letterSpacing: "0.1em" }}>◈ ALERTGODS</span>
          <span style={{ fontSize: 11, color: "#1a2a3a" }}>Trading involves risk. Past performance is not indicative of future results.</span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Terms", "Privacy", "Discord", "Contact"].map(l => (
              <span key={l} style={{ fontSize: 11, color: "#2a4a6a", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}