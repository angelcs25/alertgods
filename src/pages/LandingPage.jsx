import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["About", "Learn to Trade", "Pricing"];

const STATS = [
  { value: "74.2%", label: "Win Rate", sub: "Last 90 days" },
  { value: "3.8x", label: "Avg Risk/Reward", sub: "Per signal" },
  { value: "1,240+", label: "Signals Sent", sub: "This year" },
  { value: "94%", label: "Delivery Rate", sub: "SMS & Discord" },
];

const RECENT_TRADES = [
  { ticker: "SPY 480C", type: "CALL", entry: "4.20", exit: "9.85", gain: "+134%", date: "Jan 14", tf: "0DTE" },
  { ticker: "NVDA 620P", type: "PUT",  entry: "3.10", exit: "7.40", gain: "+138%", date: "Jan 13", tf: "1DTE" },
  { ticker: "QQQ 415C", type: "CALL", entry: "2.80", exit: "6.10", gain: "+117%", date: "Jan 10", tf: "2DTE" },
  { ticker: "/ES 4900", type: "FUT",  entry: "4901.25", exit: "4918.50", gain: "+17.25 pts", date: "Jan 9", tf: "Scalp" },
  { ticker: "AAPL 190C", type: "CALL", entry: "1.95", exit: "4.30", gain: "+120%", date: "Jan 8", tf: "1DTE" },
  { ticker: "/NQ 17200", type: "FUT", entry: "17202", exit: "17265", gain: "+63 pts", date: "Jan 7", tf: "Scalp" },
];

const FEATURES = [
  {
    icon: "◎",
    title: "Real-Time Options Signals",
    desc: "Get notified the moment a high-confidence options setup forms — strike, expiry, entry zone, and target included.",
  },
  {
    icon: "⬡",
    title: "Futures Scalp Alerts",
    desc: "ES and NQ futures entries with precise tick levels, stop, and target. Designed for active market hours.",
  },
  {
    icon: "△",
    title: "Multi-Channel Delivery",
    desc: "Signals land on your phone via SMS and your Discord server simultaneously — never miss an entry.",
  },
  {
    icon: "◈",
    title: "Strategy Transparency",
    desc: "Every signal includes the strategy name, timeframe, and confidence score. No black boxes.",
  },
];

const PLANS = [
  {
    name: "BASIC",
    price: "FREE",
    period: "/mo",
    color: "#2a4a6a",
    accent: "#4a8adf",
    features: ["Options signals only", "Discord delivery", "1-5 signals/week"],
    cta: "Start For Free",
  },
  {
    name: "PRO",
    price: "$36",
    period: "/mo",
    color: "#0a3a5a",
    accent: "#00c97a",
    featured: true,
    features: ["Options + Futures signals", "SMS + Discord", "1-5 signals/day", "Live dashboard access", "Strategy breakdown"],
    cta: "Get Started",
  },
  // {
  //   name: "ELITE",
  //   price: "$90",
  //   period: "/mo",
  //   color: "#1a2a4a",
  //   accent: "#e0a030",
  //   features: ["Everything in Pro", "1-on-1 weekly review", "Early signal access", "Private Discord channel", "Education library"],
  //   cta: "Apply Now",
  // },
];

function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
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

// Mini dashboard preview component
function DashboardPreview() {
  const rows = [
    { ticker: "SPY", side: "BUY", price: "481.20", conf: 88, strategy: "EMA Breakout", tf: "5m" },
    { ticker: "NVDA", side: "SELL", price: "624.50", conf: 76, strategy: "RSI Divergence", tf: "15m" },
    { ticker: "QQQ", side: "BUY", price: "416.80", conf: 91, strategy: "MACD Cross", tf: "1h" },
    { ticker: "AAPL", side: "BUY", price: "191.30", conf: 73, strategy: "BB Squeeze", tf: "5m" },
    { ticker: "/ES", side: "SELL", price: "4902.25", conf: 84, strategy: "Volume Spike", tf: "1m" },
  ];
  return (
    <div style={{
      background: "#080b0f",
      border: "1px solid #1a2a3a",
      borderRadius: 6,
      overflow: "hidden",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px #0a1828",
    }}>
      {/* Fake topbar */}
      <div style={{ background: "#0a0e14", padding: "8px 14px", borderBottom: "1px solid #111820", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#00c97a", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em" }}>◈ALERTGODS</span>
          <span style={{ color: "#2a3a4a", fontSize: 10 }}>TERMINAL v1.0</span>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#3a4a5a" }}>
          <span style={{ color: "#4a6a5a" }}>● LIVE</span>
          <span>{new Date().toLocaleTimeString("en-US", { hour12: false })}</span>
        </div>
      </div>
      {/* Fake stat strip */}
      <div style={{ display: "flex", borderBottom: "1px solid #0d1117" }}>
        {[["WIN RATE","74.2%","#00c97a"],["SIGNALS","42","#4a9adf"],["AVG CONF","81%","#e0a030"],["SESSION P&L","+8.4%","#00c97a"]].map(([l,v,c]) => (
          <div key={l} style={{ flex:1, padding:"10px 12px", borderRight:"1px solid #0d1117" }}>
            <div style={{ fontSize:8, color:"#2a3a4a", letterSpacing:"0.12em", marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:16, color:c, fontWeight:500 }}>{v}</div>
          </div>
        ))}
      </div>
      {/* Col headers */}
      <div style={{ display:"grid", gridTemplateColumns:"60px 52px 70px 1fr 44px", gap:"0 10px", padding:"5px 14px", fontSize:8, color:"#2a3a4a", letterSpacing:"0.1em", background:"#0a0e14", borderBottom:"1px solid #111820" }}>
        <span>TICKER</span><span>SIDE</span><span>PRICE</span><span>STRATEGY · CONFIDENCE</span><span>TF</span>
      </div>
      {/* Rows */}
      {rows.map((r, i) => (
        <div key={i} style={{ display:"grid", gridTemplateColumns:"60px 52px 70px 1fr 44px", gap:"0 10px", padding:"7px 14px", borderBottom:"1px solid #0a0f16", alignItems:"center" }}>
          <span style={{ color:"#c8d0d8", fontWeight:500 }}>{r.ticker}</span>
          <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 6px", borderRadius:2, fontSize:9, fontWeight:700, letterSpacing:"0.06em", background: r.side==="BUY"?"#082018":"#200808", color: r.side==="BUY"?"#00c97a":"#e05050", border:`1px solid ${r.side==="BUY"?"#0a3020":"#300a0a"}` }}>{r.side}</span>
          <span style={{ color:"#6a7a8a", fontVariantNumeric:"tabular-nums" }}>${r.price}</span>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ flex:1, height:2, background:"#111820", borderRadius:1, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${r.conf}%`, background: r.conf>=80?"#00c97a":r.conf>=70?"#e0a030":"#e05050", borderRadius:1 }} />
              </div>
              <span style={{ fontSize:9, color:"#4a5a6a", minWidth:26, textAlign:"right" }}>{r.conf}%</span>
            </div>
            <div style={{ fontSize:9, color:"#2a3a4a", marginTop:1 }}>{r.strategy}</div>
          </div>
          <span style={{ color:"#3a4a5a" }}>{r.tf}</span>
        </div>
      ))}
      {/* Bottom blur gradient */}
      <div style={{ height:32, background:"linear-gradient(to bottom, transparent, #080b0f)" }} />
    </div>
  );
}

export default function LandingPage({ onNavigate = () => {} }) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState(null);

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
          padding: 12px 28px;
          border-radius: 3px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .cta-primary:hover { background: #00e688; transform: translateY(-1px); }

        .cta-ghost {
          background: transparent;
          color: #7a9aba;
          border: 1px solid #1a3a5a;
          padding: 12px 28px;
          border-radius: 3px;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .cta-ghost:hover { border-color: #2a5a7a; color: #c8d8e8; }

        .feature-card {
          background: #080f1c;
          border: 1px solid #0f1e30;
          border-radius: 4px;
          padding: 28px 24px;
          transition: border-color 0.25s, transform 0.25s;
        }
        .feature-card:hover { border-color: #1a3a5a; transform: translateY(-3px); }

        .trade-row {
          display: grid;
          grid-template-columns: 110px 52px 80px 80px 90px 60px 60px;
          gap: 0 12px;
          align-items: center;
          padding: 10px 20px;
          border-bottom: 1px solid #0a1525;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          transition: background 0.15s;
        }
        .trade-row:hover { background: #080f1c; }

        .plan-card {
          background: #080f1c;
          border: 1px solid #0f1e30;
          border-radius: 4px;
          padding: 32px 28px;
          flex: 1;
          min-width: 0;
          position: relative;
          transition: transform 0.25s;
        }
        .plan-card:hover { transform: translateY(-4px); }
        .plan-card.featured { border-color: #1a4a3a; background: #060f14; }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,180,100,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,180,100,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

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
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          color: #e8f0f8;
          line-height: 1.1;
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(5,12,24,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid #0f1e30" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#00c97a", fontSize: 14, fontWeight: 600, letterSpacing: "0.1em" }}>◈ALERTGODS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {NAV_LINKS.map(l => (
            <button key={l} className="nav-link" onClick={() => {const routes = { 
              "About": "/about", 
              // "Performance": "/performance",
              "Learn to Trade": "/learn",
              "Pricing": "/",
            };
      onNavigate(routes[l] || "/");
    }}
  >{l}</button>))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="cta-ghost" style={{ padding: "8px 18px", fontSize: 12 }} onClick={() => onNavigate("/login")}>Dashboard</button>
          <button className="cta-primary" style={{ padding: "8px 18px", fontSize: 12 }} onClick={() => onNavigate("/signup/free")}>Join Now</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 40px 60px", overflow: "hidden" }}>
        <div className="grid-bg" />
        <div className="glow-orb" style={{ width: 500, height: 500, background: "rgba(0,100,200,0.12)", top: -100, right: -100 }} />
        <div className="glow-orb" style={{ width: 300, height: 300, background: "rgba(0,200,120,0.07)", bottom: 100, left: -50 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>

            {/* Left: copy */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#080f1c", border: "1px solid #0f2a1a", borderRadius: 2, padding: "5px 12px", marginBottom: 24 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00c97a", display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#4a8a6a", letterSpacing: "0.12em" }}>LIVE SIGNALS ACTIVE</span>
              </div>

              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(36px, 5vw, 64px)",
                fontWeight: 800,
                color: "#e8f0f8",
                lineHeight: 1.05,
                marginBottom: 20,
              }}>
                Options &<br />
                Futures Signals<br />
                <span style={{ color: "#00c97a" }}>Delivered Instantly.</span>
              </h1>

              <p style={{ fontSize: 16, color: "#5a7a9a", lineHeight: 1.75, marginBottom: 32, maxWidth: 440 }}>
                High-conviction options and futures trade alerts sent directly to your phone and Discord — with entry zones, targets, and full strategy context. No noise. No lag.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
                <button className="cta-primary" onClick={() => onNavigate("/signup/free")}>Start For Free →</button>
                {/* <button className="cta-ghost">View Performance</button> */}
                <button className="cta-primary" onClick={() => onNavigate("/signup/free")}>Join Now</button>
              </div>

              <div style={{ display: "flex", gap: 28 }}>
                {[["74.2%","Win rate"],["3.8x","Avg R/R"],["1,240+","Signals sent"]].map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 600, color: "#c8d8e8" }}>{v}</div>
                    <div style={{ fontSize: 11, color: "#3a5a7a", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: dashboard preview */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: -20, background: "radial-gradient(ellipse at center, rgba(0,80,160,0.15) 0%, transparent 70%)", borderRadius: 20, pointerEvents: "none" }} />
              <DashboardPreview />
              <div style={{ position: "absolute", bottom: -12, left: "50%", transform: "translateX(-50%)", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#2a4a6a", letterSpacing: "0.15em", whiteSpace: "nowrap" }}>
                ↑ LIVE SUBSCRIBER DASHBOARD
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ borderTop: "1px solid #0a1828", borderBottom: "1px solid #0a1828", background: "#060d18" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {STATS.map((s, i) => (
            <AnimSection key={i} delay={i * 0.1}>
              <div style={{ padding: "32px 24px", borderRight: i < 3 ? "1px solid #0a1828" : "none", textAlign: "center" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 600, color: "#00c97a", marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#c8d8e8", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#3a5a7a" }}>{s.sub}</div>
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* ── WHAT IS ALERTGODS ── */}
      <section style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <AnimSection>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div className="section-label">ABOUT THE SERVICE</div>
              <h2 className="section-title" style={{ marginBottom: 20 }}>
                Trade smarter.<br />React faster.
              </h2>
              <p style={{ fontSize: 15, color: "#5a7a9a", lineHeight: 1.8, marginBottom: 20 }}>
                AlertGods is a real-time trade                   service built for active options and futures traders. We analyze price action, volume, momentum, and key technical levels across major tickers — then push high-probability setups straight to where you already are.
              </p>
              <p style={{ fontSize: 15, color: "#5a7a9a", lineHeight: 1.8, marginBottom: 32 }}>
                Every signal includes the instrument, direction, entry zone, stop level, target, strategy rationale, and a confidence score. You get the full picture in seconds — not after the move already happened.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Options (0DTE to weekly) on SPY, QQQ, NVDA, AAPL & more","Futures scalps on /ES and /NQ during active sessions","SMS + Discord delivery — under 2 seconds from signal to your phone"].map(t => (
                  <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#00c97a", fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#7a9aba" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {FEATURES.map((f, i) => (
                <AnimSection key={i} delay={i * 0.1}>
                  <div className="feature-card">
                    <div style={{ fontSize: 20, marginBottom: 12, color: "#00c97a" }}>{f.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#c8d8e8", marginBottom: 8 }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: "#4a6a8a", lineHeight: 1.7 }}>{f.desc}</div>
                  </div>
                </AnimSection>
              ))}
            </div>
          </div>
        </AnimSection>
      </section>

      
      {/* <section style={{ padding: "80px 40px", background: "#060d18", borderTop: "1px solid #0a1828", borderBottom: "1px solid #0a1828" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AnimSection>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="section-label">VERIFIED TRACK RECORD</div>
              <h2 className="section-title">Recent Trade Performance</h2>
              <p style={{ fontSize: 14, color: "#3a5a7a", marginTop: 12 }}>All trades logged at signal time. Entry and exit based on signal levels.</p>
            </div>
          </AnimSection>

          <AnimSection delay={0.15}>
            <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 4, overflow: "hidden" }}> */}
              {/* Table header */}
              {/* <div className="trade-row" style={{ background: "#060d18", fontSize: 9, color: "#2a4a6a", letterSpacing: "0.12em", padding: "8px 20px", borderBottom: "1px solid #0f1e30" }}>
                <span>INSTRUMENT</span>
                <span>TYPE</span>
                <span>ENTRY</span>
                <span>EXIT</span>
                <span>RESULT</span>
                <span>DATE</span>
                <span>TIMEFRAME</span>
              </div>
              {RECENT_TRADES.map((t, i) => (
                <div key={i} className="trade-row">
                  <span style={{ color: "#c8d8e8", fontWeight: 500 }}>{t.ticker}</span>
                  <span>
                    <span style={{
                      display: "inline-flex", padding: "2px 7px", borderRadius: 2, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                      background: t.type === "CALL" ? "#082018" : t.type === "PUT" ? "#200808" : "#0a1828",
                      color: t.type === "CALL" ? "#00c97a" : t.type === "PUT" ? "#e05050" : "#4a9adf",
                      border: `1px solid ${t.type === "CALL" ? "#0a3020" : t.type === "PUT" ? "#300a0a" : "#0a2040"}`,
                    }}>{t.type}</span>
                  </span>
                  <span style={{ color: "#6a7a8a" }}>{t.entry}</span>
                  <span style={{ color: "#6a7a8a" }}>{t.exit}</span>
                  <span style={{ color: "#00c97a", fontWeight: 600 }}>{t.gain}</span>
                  <span style={{ color: "#3a5a7a" }}>{t.date}</span>
                  <span style={{ color: "#3a5a7a" }}>{t.tf}</span>
                </div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section> */}

      {/* ── PRICING ── */}
      <section style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <AnimSection>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div className="section-label">SIMPLE PRICING</div>
            <h2 className="section-title">Choose Your Edge</h2>
            <p style={{ fontSize: 14, color: "#3a5a7a", marginTop: 12 }}>Cancel anytime. No hidden fees.</p>
          </div>
        </AnimSection>
        <div style={{ display: "flex", gap: 20, alignItems: "stretch" }}>
          {PLANS.map((p, i) => (
            <AnimSection key={i} delay={i * 0.1}>
              <div className={`plan-card${p.featured ? " featured" : ""}`} style={{ position: "relative" }}>
                {p.featured && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#00c97a", color: "#030f08", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", padding: "3px 12px", borderRadius: 2 }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: p.accent, letterSpacing: "0.15em", marginBottom: 16 }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, color: "#e8f0f8" }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: "#3a5a7a" }}>{p.period}</span>
                </div>
                <div style={{ height: 1, background: "#0f1e30", marginBottom: 24 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: p.accent, fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 13, color: "#6a8aaa" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onNavigate(p.featured ? "/signup/pro" : "/signup/free")}
                  style={{
                  width: "100%", padding: "12px 0", border: p.featured ? "none" : `1px solid #1a3a5a`,
                  background: p.featured ? "#00c97a" : "transparent",
                  color: p.featured ? "#030f08" : "#7a9aba",
                  borderRadius: 3, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                  transition: "all 0.2s", letterSpacing: "0.04em",
                }}>
                  {p.cta}
                </button>
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* ── LEARN TO TRADE TEASER ── */}
      <section style={{ padding: "80px 40px", background: "#060d18", borderTop: "1px solid #0a1828" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AnimSection>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
              <div>
                <div className="section-label">EDUCATION</div>
                <h2 className="section-title" style={{ marginBottom: 20 }}>Learn to Trade Options & Futures</h2>
                <p style={{ fontSize: 15, color: "#5a7a9a", lineHeight: 1.8, marginBottom: 28 }}>
                  Don't just follow signals — understand them. Our education library walks you through the mechanics of options pricing, futures contracts, risk management, and how to read the setups we trade.
                </p>
                <button className="cta-ghost" onClick={() => onNavigate("/learn")}>Explore the Library →</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {["Options Basics","Reading Greeks","0DTE Strategies","Futures Scalping","Risk Management","Reading Order Flow","Chart Patterns","Position Sizing"].map((t, i) => (
                  <div key={i} style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 3, padding: "12px 16px", fontSize: 12, color: "#5a7a9a", cursor: "pointer", transition: "all 0.2s", borderLeft: "2px solid #1a3a5a" }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "40px", borderTop: "1px solid #0a1828", background: "#050c18" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#1a3a5a", fontSize: 12, letterSpacing: "0.1em" }}>◈ ALERTGODS</span>
          <span style={{ fontSize: 11, color: "#1a2a3a" }}>Trading involves risk. Past performance is not indicative of future results. Not Financial Advice</span>
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