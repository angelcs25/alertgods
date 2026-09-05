import { useState, useEffect, useRef } from "react";

const TICKERS = ["AAPL","TSLA","NVDA","SPY","QQQ","MSFT","AMZN","META","AMD","GOOGL"];
const STRATEGIES = ["RSI Divergence","MACD Cross","EMA Breakout","Volume Spike","BB Squeeze"];

function randomSignal(id) {
  const ticker = TICKERS[Math.floor(Math.random() * TICKERS.length)];
  const side = Math.random() > 0.5 ? "BUY" : "SELL";
  const price = (Math.random() * 800 + 50).toFixed(2);
  const confidence = Math.floor(Math.random() * 35) + 65;
  const strategy = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];
  const tf = ["1m","5m","15m","1h","4h"][Math.floor(Math.random() * 5)];
  return { id, ticker, side, price, confidence, strategy, tf, ts: new Date(), delivered: Math.random() > 0.08 };
}

function initSignals() {
  return Array.from({ length: 14 }, (_, i) => {
    const s = randomSignal(i + 1);
    s.ts = new Date(Date.now() - (14 - i) * 47000);
    return s;
  });
}

function fmt(date) {
  return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function fmtAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

const SPARKLINE_DATA = Array.from({ length: 24 }, (_, i) => ({
  wins: Math.floor(Math.random() * 8) + 2,
  losses: Math.floor(Math.random() * 4) + 1,
  hour: i,
}));

function MiniSparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function Dashboard({ extraSignals = [], onNavigate = () => {} }) {
  const [signals, setSignals] = useState(initSignals);
  const [filter, setFilter] = useState("ALL");
  const [, tick] = useState(0);
  const nextId = useRef(100);
  const feedRef = useRef(null);
  const [newIds, setNewIds] = useState(new Set());
  const [blinkActive, setBlinkActive] = useState(false);

  // Live signal injection
  useEffect(() => {
    const iv = setInterval(() => {
      const s = randomSignal(nextId.current++);
      setSignals(prev => [s, ...prev].slice(0, 60));
      setNewIds(prev => new Set([...prev, s.id]));
      setBlinkActive(true);
      setTimeout(() => setBlinkActive(false), 800);
      setTimeout(() => setNewIds(prev => { const n = new Set(prev); n.delete(s.id); return n; }), 1200);
    }, 6000);
    return () => clearInterval(iv);
  }, []);

  //Merge signals published from the composer
  useEffect(() => {
    if(extraSignals.length > 0) {
      setSignals(prev => [...extraSignals, ...prev].slice(0,60));
    }
  }, [extraSignals]);


  // Clock tick
  useEffect(() => {
    const iv = setInterval(() => tick(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const filtered = filter === "ALL" ? signals : signals.filter(s => s.side === filter);
  const buys = signals.filter(s => s.side === "BUY").length;
  const sells = signals.filter(s => s.side === "SELL").length;
  const delivered = signals.filter(s => s.delivered).length;
  const winRate = 72.4;
  const avgConf = Math.round(signals.reduce((a, s) => a + s.confidence, 0) / signals.length);
  const totalPnl = +14.83;

  const sparkWins = SPARKLINE_DATA.map(d => d.wins);
  const sparkLosses = SPARKLINE_DATA.map(d => d.losses);

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      background: "#080b0f",
      minHeight: "100vh",
      color: "#c8d0d8",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #2a3040; border-radius: 2px; }

        .signal-row {
          display: grid;
          grid-template-columns: 72px 56px 68px 90px 80px 1fr 52px 56px;
          gap: 0 12px;
          align-items: center;
          padding: 7px 16px;
          border-bottom: 1px solid #0f1520;
          cursor: default;
          transition: background 0.15s;
          font-size: 12px;
        }
        .signal-row:hover { background: #0d1420; }
        .signal-row.new-flash { animation: rowFlash 1.1s ease-out; }
        @keyframes rowFlash {
          0%   { background: #0d2a1a; }
          40%  { background: #0a2016; }
          100% { background: transparent; }
        }
        .tag {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 2px 7px; border-radius: 2px; font-size: 10px; font-weight: 600;
          letter-spacing: 0.06em;
        }
        .blink-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #00e676;
          display: inline-block;
          animation: pulse 2s ease-in-out infinite;
        }
        .blink-dot.active { animation: pulseFast 0.4s ease-out; }
        @keyframes pulse {
          0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(0,230,118,0.4); }
          50% { opacity:0.6; box-shadow: 0 0 0 4px rgba(0,230,118,0); }
        }
        @keyframes pulseFast {
          0% { transform: scale(1.8); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .stat-card {
          background: #0d1117;
          border: 1px solid #161d28;
          border-radius: 3px;
          padding: 14px 16px;
          flex: 1;
          min-width: 0;
        }
        .conf-bar-bg {
          height: 3px;
          background: #1a2030;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 4px;
        }
        .filter-btn {
          background: none;
          border: 1px solid #1e2a38;
          color: #5a6a7a;
          font-family: inherit;
          font-size: 11px;
          padding: 4px 12px;
          border-radius: 2px;
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: all 0.15s;
        }
        .filter-btn:hover { border-color: #2a3a4e; color: #8a9aaa; }
        .filter-btn.active-all  { border-color: #2a4060; color: #4a9adf; background: #0a1828; }
        .filter-btn.active-buy  { border-color: #1a4030; color: #00c97a; background: #081a12; }
        .filter-btn.active-sell { border-color: #3a1a1a; color: #e05050; background: #180808; }
      `}</style>

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px",
        borderBottom: "1px solid #111820",
        background: "#0a0e14",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#00c97a", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em" }}>◈ALERTGODS</span>
          <span style={{ color: "#1e2a38", fontSize: 11 }}>|</span>
          <span style={{ color: "#3a4a5a", fontSize: 11, letterSpacing: "0.05em" }}>TERMINAL v1.0</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, color: "#3a4a5a" }}>
          <span style={{ color: "#2a6aaf", letterSpacing: "0.05em" }}>PAPER MODE</span>
          <span style={{ color: "#1e2a38" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className={`blink-dot${blinkActive ? " active" : ""}`} />
            <span style={{ color: "#4a6a5a", letterSpacing: "0.05em" }}>LIVE</span>
          </div>
          <span style={{ color: "#1e2a38" }}>|</span>
          <span style={{ color: "#5a6a7a", fontVariantNumeric: "tabular-nums" }}>{new Date().toLocaleTimeString("en-US", { hour12: false })}</span>
          <span style={{ color: "#1e2a38" }}>|</span>
          <span style={{ color: "#3a4a5a" }}>UTC-5</span>
          <button
            onClick={() => onNavigate("/admin")}
            style={{
              background: "#082018",
              border: "1px solid #0a3020",
              color: "#00c97a",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              padding: "4px 10px",
              borderRadius: 2,
              cursor: "pointer",
              letterSpacing: "0.08em",
            }}
          >
            + COMPOSE
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 1, padding: "1px 0", background: "#060a0e" }}>
        {[
          {
            label: "WIN RATE", value: `${winRate}%`, sub: "+2.1% vs last week",
            color: "#00c97a", spark: sparkWins, sparkColor: "#00c97a",
          },
          {
            label: "SIGNALS TODAY", value: signals.length, sub: `${buys} buy · ${sells} sell`,
            color: "#4a9adf", spark: null, sparkColor: null,
          },
          {
            label: "AVG CONFIDENCE", value: `${avgConf}%`, sub: "last 60 signals",
            color: "#e0a030", spark: null, sparkColor: null,
          },
          {
            label: "DELIVERED", value: `${delivered}/${signals.length}`, sub: `${Math.round(delivered/signals.length*100)}% success rate`,
            color: "#9a7aef", spark: null, sparkColor: null,
          },
          {
            label: "SESSION P&L", value: `${totalPnl > 0 ? "+" : ""}${totalPnl}%`, sub: "paper trading",
            color: totalPnl >= 0 ? "#00c97a" : "#e05050", spark: sparkLosses, sparkColor: "#e05050",
          },
        ].map((card, i) => (
          <div key={i} className="stat-card" style={{ background: "#0a0e14", borderColor: "#111820", borderRadius: 0, borderTop: "none", borderBottom: "none" }}>
            <div style={{ fontSize: 9, color: "#3a4a5a", letterSpacing: "0.12em", marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: card.color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{card.value}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 10, color: "#3a4a5a" }}>{card.sub}</span>
              {card.spark && <MiniSparkline data={card.spark} color={card.sparkColor} />}
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Signal feed */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Feed header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 16px",
            background: "#0a0e14",
            borderBottom: "1px solid #111820",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 10, color: "#3a4a5a", letterSpacing: "0.1em" }}>SIGNAL FEED</span>
              <span style={{ fontSize: 10, color: "#1e2a38" }}>——</span>
              <span style={{ fontSize: 10, color: "#2a4060" }}>{filtered.length} entries</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["ALL", "BUY", "SELL"].map(f => (
                <button
                  key={f}
                  className={`filter-btn${filter === f ? ` active-${f.toLowerCase()}` : ""}`}
                  onClick={() => setFilter(f)}
                >{f}</button>
              ))}
            </div>
          </div>

          {/* Column headers */}
          <div className="signal-row" style={{
            background: "#0a0e14",
            borderBottom: "1px solid #161d28",
            fontSize: 9,
            color: "#2a3a4a",
            letterSpacing: "0.1em",
            padding: "6px 16px",
          }}>
            <span>TIME</span>
            <span>TICKER</span>
            <span>SIDE</span>
            <span>PRICE</span>
            <span>STRATEGY</span>
            <span>CONFIDENCE</span>
            <span>TF</span>
            <span>STATUS</span>
          </div>

          {/* Rows */}
          <div ref={feedRef} style={{ overflowY: "auto", flex: 1 }}>
            {filtered.map(s => {
              const isBuy = s.side === "BUY";
              const isNew = newIds.has(s.id);
              return (
                <div key={s.id} className={`signal-row${isNew ? " new-flash" : ""}`}>
                  <span style={{ color: "#3a4a5a", fontVariantNumeric: "tabular-nums", fontSize: 11 }}>
                    {fmt(s.ts)}
                  </span>
                  <span style={{ color: "#c8d0d8", fontWeight: 500 }}>{s.ticker}</span>
                  <span>
                    <span className="tag" style={{
                      background: isBuy ? "#082018" : "#200808",
                      color: isBuy ? "#00c97a" : "#e05050",
                      border: `1px solid ${isBuy ? "#0a3020" : "#300a0a"}`,
                    }}>{s.side}</span>
                  </span>
                  <span style={{ color: "#8a9aaa", fontVariantNumeric: "tabular-nums" }}>${s.price}</span>
                  <span style={{ color: "#4a5a6a", fontSize: 11 }}>{s.strategy}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div className="conf-bar-bg" style={{ flex: 1 }}>
                        <div style={{
                          height: "100%",
                          width: `${s.confidence}%`,
                          background: s.confidence >= 80 ? "#00c97a" : s.confidence >= 70 ? "#e0a030" : "#e05050",
                          borderRadius: 2,
                          transition: "width 0.4s",
                        }} />
                      </div>
                      <span style={{ fontSize: 10, color: "#5a6a7a", minWidth: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.confidence}%</span>
                    </div>
                  </div>
                  <span style={{ color: "#4a5a6a", fontSize: 11 }}>{s.tf}</span>
                  <span>
                    {s.delivered
                      ? <span style={{ color: "#2a6a4a", fontSize: 10 }}>✓ SENT</span>
                      : <span style={{ color: "#6a2a2a", fontSize: 10 }}>✗ FAIL</span>
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{
          width: 240,
          background: "#0a0e14",
          borderLeft: "1px solid #111820",
          display: "flex",
          flexDirection: "column",
          fontSize: 11,
        }}>

          {/* Ticker heat */}
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #111820" }}>
            <div style={{ fontSize: 9, color: "#3a4a5a", letterSpacing: "0.1em", marginBottom: 10 }}>TICKER ACTIVITY</div>
            {TICKERS.slice(0, 7).map(t => {
              const count = signals.filter(s => s.ticker === t).length;
              const pct = Math.round((count / signals.length) * 100);
              const tBuys = signals.filter(s => s.ticker === t && s.side === "BUY").length;
              const tSells = signals.filter(s => s.ticker === t && s.side === "SELL").length;
              return (
                <div key={t} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ color: "#8a9aaa", fontWeight: 500 }}>{t}</span>
                    <div style={{ display: "flex", gap: 6, fontSize: 10, color: "#3a4a5a" }}>
                      <span style={{ color: "#1a6a3a" }}>{tBuys}B</span>
                      <span style={{ color: "#6a1a1a" }}>{tSells}S</span>
                    </div>
                  </div>
                  <div style={{ height: 3, background: "#111820", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${Math.max(pct * 4, 4)}%`,
                      background: tBuys >= tSells ? "#1a5a3a" : "#5a1a1a",
                      borderRadius: 2,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent activity log */}
          <div style={{ padding: "10px 14px", flex: 1, overflowY: "auto" }}>
            <div style={{ fontSize: 9, color: "#3a4a5a", letterSpacing: "0.1em", marginBottom: 10 }}>ACTIVITY LOG</div>
            {signals.slice(0, 12).map(s => (
              <div key={s.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "5px 0",
                borderBottom: "1px solid #0d1117",
              }}>
                <div>
                  <span style={{
                    color: s.side === "BUY" ? "#00c97a" : "#e05050",
                    fontWeight: 600, fontSize: 10
                  }}>{s.side}</span>
                  <span style={{ color: "#5a6a7a", marginLeft: 5 }}>{s.ticker}</span>
                </div>
                <span style={{ color: "#2a3a4a", fontSize: 10 }}>{fmtAgo(s.ts)}</span>
              </div>
            ))}
          </div>

          {/* Bottom status */}
          <div style={{
            padding: "10px 14px",
            borderTop: "1px solid #111820",
            fontSize: 10,
            color: "#2a3a4a",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>SMS</span>
              <span style={{ color: "#2a6a4a" }}>● CONNECTED</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>DISCORD</span>
              <span style={{ color: "#2a6a4a" }}>● CONNECTED</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>QUEUE</span>
              <span style={{ color: "#e0a030" }}>2 PENDING</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
