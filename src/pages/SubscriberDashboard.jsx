// src/pages/SubscriberDashboard.jsx
import { useState, useEffect, useRef } from "react";
import useAuth from "../services/useAuth";

const SCANNER_URL = import.meta.env.VITE_SCANNER_URL || "http://localhost:3001";

function fmtAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

const PHASE_LABEL = {
  OPEN:       { text: "MARKET OPEN",   color: "#00c97a", bg: "#082018", border: "#0a3020" },
  MID:        { text: "MID-DAY",       color: "#6a8aaa", bg: "#0a1020", border: "#1a2030" },
  POWER_HOUR: { text: "POWER HOUR",    color: "#e0a030", bg: "#201808", border: "#302010" },
  PRE_MARKET: { text: "PRE-MARKET",    color: "#4a9adf", bg: "#080a20", border: "#0a1040" },
  CLOSED:     { text: "MARKET CLOSED", color: "#3a4a5a", bg: "#0a0e14", border: "#111820" },
};

export default function SubscriberDashboard({ onNavigate = () => {} }) {
  const { session, isPro, plan, logout } = useAuth();
  const [signals,  setSignals]  = useState([]);
  const [status,   setStatus]   = useState(null);
  const [filter,   setFilter]   = useState("ALL");
  const [, tick]                = useState(0);
  const prevLen                 = useRef(0);
  const [newIds,   setNewIds]   = useState(new Set());
  const mono = "'JetBrains Mono','Fira Code',monospace";

  // Poll signals every 10 seconds
  useEffect(() => {
    async function fetchData() {
      try {
        const planParam = isPro ? "pro" : "free";
        const [sigRes, statRes] = await Promise.all([
          fetch(`${SCANNER_URL}/api/signals?plan=${planParam}&limit=60`),
          fetch(`${SCANNER_URL}/api/status`),
        ]);
        if (sigRes.ok) {
          const data = await sigRes.json();
          // Flash new signals
          if (data.length > prevLen.current) {
            const newOnes = new Set(data.slice(0, data.length - prevLen.current).map(s => s.id));
            setNewIds(newOnes);
            setTimeout(() => setNewIds(new Set()), 2000);
          }
          prevLen.current = data.length;
          setSignals(data);
        }
        if (statRes.ok) setStatus(await statRes.json());
      } catch { /* scanner offline */ }
    }
    fetchData();
    const iv = setInterval(fetchData, 10000);
    const tickIv = setInterval(() => tick(t => t + 1), 1000);
    return () => { clearInterval(iv); clearInterval(tickIv); };
  }, [isPro]);

  const phase = status?.marketPhase || "CLOSED";
  const phaseStyle = PHASE_LABEL[phase] || PHASE_LABEL.CLOSED;

  const filtered = filter === "ALL"
    ? signals
    : filter === "OPTIONS"
    ? signals.filter(s => !s.isFutures && !s.ticker?.startsWith("/"))
    : signals.filter(s => s.isFutures || s.ticker?.startsWith("/"));

  const totalToday  = signals.length;
  const buyCount    = signals.filter(s => s.side === "BUY").length;
  const sellCount   = signals.filter(s => s.side === "SELL").length;
  const avgConf     = signals.length ? Math.round(signals.reduce((a, s) => a + (s.confidence || 0), 0) / signals.length) : 0;

  return (
    <div style={{ fontFamily: mono, background: "#080b0f", minHeight: "100vh", color: "#c8d0d8", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:#2a3040; border-radius:2px; }
        .sig-row { display:grid; grid-template-columns:70px 54px 72px 1fr 110px 80px 60px; gap:0 10px; padding:12px 16px; border-bottom:1px solid #0f1520; font-size:12px; align-items:center; transition:background 0.1s; cursor:default; }
        .sig-row:hover { background:#0d1420; }
        .sig-row.new-flash { animation:flash 2s ease-out; }
        @keyframes flash { 0%{background:#0d2a1a} 100%{background:transparent} }
        .flt-btn { background:none; border:1px solid #1a2530; color:#3a4a5a; font-family:${mono}; font-size:10px; padding:5px 12px; border-radius:2px; cursor:pointer; letter-spacing:.06em; transition:all .15s; }
        .flt-btn.active { background:#082018; color:#00c97a; border-color:#0a3020; }
        .badge { display:inline-block; padding:2px 7px; border-radius:2px; font-size:10px; font-weight:700; letter-spacing:.06em; }
        .pro-lock { display:flex; align-items:center; justify-content:center; gap:8px; padding:3px 10px; background:#0a1020; border:1px solid #1a2a3a; border-radius:2px; color:#3a5a7a; font-size:10px; }
        @media(max-width:768px) {
          .sig-row { grid-template-columns:60px 50px 1fr 80px; font-size:11px; padding:10px 12px; }
          .sig-row .hide-mobile { display:none; }
          .stat-grid { grid-template-columns:1fr 1fr !important; }
        }
      `}</style>

      {/* ── Top nav ── */}
      <div style={{ padding: "0 16px", height: 52, borderBottom: "1px solid #111820", background: "#0a0e14", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => onNavigate("/")} style={{ background: "none", border: "none", color: "#00c97a", fontFamily: mono, fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", cursor: "pointer" }}>
            ◈ ALERTGODS
          </button>
          <span style={{ color: "#1e2a38" }}>|</span>
          {/* Plan badge */}
          <span style={{
            fontFamily: mono, fontSize: 9, padding: "2px 8px", borderRadius: 2, letterSpacing: "0.1em",
            background: isPro ? "#082018" : "#080a20",
            color: isPro ? "#00c97a" : "#4a9adf",
            border: `1px solid ${isPro ? "#0a3020" : "#0a1840"}`,
          }}>
            {isPro ? "PRO" : "FREE"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Market phase */}
          <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 2, letterSpacing: "0.1em", background: phaseStyle.bg, color: phaseStyle.color, border: `1px solid ${phaseStyle.border}` }}>
            {phaseStyle.text}
          </span>
          {/* Scanner status */}
          {status && (
            <span style={{ fontSize: 9, color: "#2a4060" }}>
              {status.isScanning ? "◌ SCANNING..." : status.schwabAuthorized ? "● LIVE" : "✗ NOT CONNECTED"}
            </span>
          )}
          <span style={{ fontSize: 10, color: "#2a3a4a" }}>{session?.email}</span>
          <button onClick={() => { logout(); onNavigate("/login"); }} style={{ background: "none", border: "1px solid #1a2030", color: "#3a4a5a", fontFamily: mono, fontSize: 9, padding: "3px 10px", borderRadius: 2, cursor: "pointer" }}>
            LOG OUT
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "#060a0e", borderBottom: "1px solid #0a1020", flexShrink: 0 }}>
        {[
          { label: "SIGNALS TODAY",  value: totalToday,  sub: `${buyCount} buy · ${sellCount} sell`, color: "#4a9adf" },
          { label: "AVG CONFIDENCE", value: signals.length ? `${avgConf}%` : "—", sub: "this session", color: "#00c97a" },
          { label: "NEXT SCAN",      value: status?.nextScanAt ? fmtAgo(status.nextScanAt).replace(" ago","") : "—", sub: `${(status?.scanInterval||900000)/60000}min interval`, color: "#e0a030" },
          { label: "SCANS TODAY",    value: status?.stats?.totalScans ?? "—", sub: `${status?.stats?.signalsGenerated ?? 0} signals found`, color: "#c97adf" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#080b0f", padding: "12px 16px", borderRight: i < 3 ? "1px solid #0a1020" : "none" }}>
            <div style={{ fontSize: 9, color: "#2a3a4a", letterSpacing: "0.12em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#2a3a4a", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Pro upgrade banner (free users) ── */}
      {!isPro && (
        <div style={{ background: "#060c18", borderBottom: "1px solid #0a1828", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: "#3a5a7a" }}>
            <span style={{ color: "#e0a030" }}>⬡</span>
            {" "}You're on the Free plan — futures signals (/ES, /NQ) and SMS alerts are Pro only.
          </div>
          <button
            onClick={() => onNavigate("/signup/pro")}
            style={{ background: "#00c97a", color: "#030f08", border: "none", padding: "7px 16px", borderRadius: 2, fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            UPGRADE TO PRO →
          </button>
        </div>
      )}

      {/* ── Feed header + filters ── */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #0f1520", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0e14", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, color: "#2a4060", letterSpacing: "0.15em" }}>◆ SIGNAL FEED</span>
          <span style={{ fontSize: 9, color: "#00c97a", background: "#082018", border: "1px solid #0a3020", padding: "1px 6px", borderRadius: 10 }}>LIVE</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL", "OPTIONS", isPro ? "FUTURES" : null].filter(Boolean).map(f => (
            <button key={f} className={`flt-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
          {!isPro && (
            <div className="pro-lock">🔒 FUTURES</div>
          )}
        </div>
      </div>

      {/* ── Column headers ── */}
      <div style={{ display: "grid", gridTemplateColumns: "70px 54px 72px 1fr 110px 80px 60px", gap: "0 10px", padding: "6px 16px", fontSize: 9, color: "#1e2a38", letterSpacing: "0.1em", background: "#060a0e", borderBottom: "1px solid #0a1020", flexShrink: 0 }}>
        <span>TICKER</span>
        <span>DIR</span>
        <span>TYPE</span>
        <span className="hide-mobile">STRATEGY</span>
        <span>ENTRY / LEVELS</span>
        <span>CONF</span>
        <span>TIME</span>
      </div>

      {/* ── Signal rows ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "48px 16px", textAlign: "center", fontSize: 11, color: "#1e2a38" }}>
            {signals.length === 0
              ? status?.isMarketOpen === false
                ? "Market is closed — scanner resumes at 9:30 AM ET"
                : "Watching the market — signals appear here as they're generated"
              : "No signals match this filter"}
          </div>
        ) : (
          filtered.map(s => {
            const isBuy = s.side === "BUY";
            const isFut = s.isFutures || s.ticker?.startsWith("/");
            return (
              <div key={s.id} className={`sig-row${newIds.has(s.id) ? " new-flash" : ""}`}>
                {/* Ticker */}
                <span style={{ fontWeight: 600, color: "#c8d0d8", display: "flex", alignItems: "center", gap: 4 }}>
                  {s.ticker}
                  {isFut && <span style={{ fontSize: 8, color: "#4a9adf" }}>FUT</span>}
                </span>

                {/* Direction */}
                <span className="badge" style={{
                  background: isBuy ? "#082018" : "#200808",
                  color: isBuy ? "#00c97a" : "#e05050",
                  border: `1px solid ${isBuy ? "#0a3020" : "#300a0a"}`,
                }}>{s.side}</span>

                {/* Type / expiry */}
                <div>
                  <span style={{ fontSize: 11, color: isFut ? "#4a9adf" : s.type === "CALL" ? "#00c97a" : "#e05050" }}>
                    {s.type}
                  </span>
                  {s.expiry && <span style={{ fontSize: 9, color: "#2a4060", display: "block", marginTop: 1 }}>{s.expiry}</span>}
                </div>

                {/* Strategy + notes */}
                <div className="hide-mobile">
                  <div style={{ color: "#8a9aaa", fontSize: 11 }}>{s.strategy || "—"}</div>
                  {s.notes && <div style={{ color: "#2a4060", fontSize: 10, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>{s.notes}</div>}
                </div>

                {/* Levels */}
                <div style={{ fontSize: 11 }}>
                  <div style={{ color: "#c8d0d8" }}>${s.price}</div>
                  {s.strike && <div style={{ color: "#5a7a9a", fontSize: 10 }}>{s.strike}</div>}
                  {s.target && <div style={{ color: "#00c97a", fontSize: 9 }}>T: ${s.target}</div>}
                  {s.stop   && <div style={{ color: "#e05050",  fontSize: 9 }}>S: ${s.stop}</div>}
                </div>

                {/* Confidence bar */}
                <div>
                  <div style={{ height: 3, borderRadius: 2, background: `linear-gradient(to right, ${s.confidence >= 80 ? "#00c97a" : s.confidence >= 70 ? "#e0a030" : "#e05050"} ${s.confidence}%, #1a2530 ${s.confidence}%)`, marginBottom: 3 }} />
                  <span style={{ fontSize: 10, color: s.confidence >= 80 ? "#00c97a" : s.confidence >= 70 ? "#e0a030" : "#e05050" }}>
                    {s.confidence}%
                  </span>
                </div>

                {/* Time */}
                <span style={{ color: "#2a3a4a", fontSize: 10 }}>{fmtAgo(s.ts)}</span>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "8px 16px", borderTop: "1px solid #0a1020", background: "#060a0e", display: "flex", justifyContent: "space-between", fontSize: 9, color: "#1a2a38", flexShrink: 0 }}>
        <span>ALERTGODS · {isPro ? "PRO" : "FREE"} PLAN</span>
        <span>Past performance does not guarantee future results · Trade at your own risk</span>
      </div>
    </div>
  );
}