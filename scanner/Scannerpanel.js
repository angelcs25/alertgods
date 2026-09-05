// import { useState, useEffect, useRef } from "react";

// const SCANNER_URL = "http://localhost:3001";

// function fmtAgo(ts) {
//   const s = Math.floor((Date.now() - new Date(ts)) / 1000);
//   if (s < 60) return `${s}s ago`;
//   if (s < 3600) return `${Math.floor(s / 60)}m ago`;
//   return `${Math.floor(s / 3600)}h ago`;
// }

// const PHASE_COLORS = {
//   OPEN:        { bg: "#082018", color: "#00c97a", border: "#0a3020" },
//   POWER_HOUR:  { bg: "#201808", color: "#e0a030", border: "#302010" },
//   PRE_MARKET:  { bg: "#080a20", color: "#4a9adf", border: "#0a1040" },
//   MID:         { bg: "#101018", color: "#6a7a9a", border: "#1a2030" },
//   CLOSED:      { bg: "#181010", color: "#4a3a3a", border: "#2a1a1a" },
// };

// export default function ScannerPanel({ onApprove }) {
//   const [status, setStatus] = useState(null);
//   const [signals, setSignals] = useState([]);
//   const [logs, setLogs] = useState([]);
//   const [connected, setConnected] = useState(false);
//   const [triggering, setTriggering] = useState(false);
//   const [, tick] = useState(0);
//   const [activeTab, setActiveTab] = useState("signals");
//   const pollRef = useRef(null);
//   const mono = "'JetBrains Mono','Fira Code',monospace";

//   async function fetchAll() {
//     try {
//       const [statusRes, signalsRes, logsRes] = await Promise.all([
//         fetch(`${SCANNER_URL}/api/status`),
//         fetch(`${SCANNER_URL}/api/signals?limit=50`),
//         fetch(`${SCANNER_URL}/api/logs`),
//       ]);
//       if (!statusRes.ok) throw new Error("Scanner not responding");
//       setStatus(await statusRes.json());
//       setSignals(await signalsRes.json());
//       setLogs(await logsRes.json());
//       setConnected(true);
//     } catch {
//       setConnected(false);
//     }
//   }

//   async function triggerScan() {
//     setTriggering(true);
//     try {
//       await fetch(`${SCANNER_URL}/api/scan`, { method: "POST" });
//       setTimeout(fetchAll, 2000); // re-fetch after 2s
//     } catch {}
//     setTimeout(() => setTriggering(false), 3000);
//   }

//   async function dismissSignal(id) {
//     await fetch(`${SCANNER_URL}/api/signals/${id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: "dismissed" }),
//     });
//     setSignals(prev => prev.filter(s => String(s.id) !== String(id)));
//   }

//   async function approveSignal(signal) {
//     await fetch(`${SCANNER_URL}/api/signals/${signal.id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ status: "approved" }),
//     });
//     onApprove?.(signal);
//     setSignals(prev => prev.map(s => String(s.id) === String(signal.id) ? { ...s, status: "approved" } : s));
//   }

//   useEffect(() => {
//     fetchAll();
//     pollRef.current = setInterval(fetchAll, 10000); // poll every 10s
//     const tickTimer = setInterval(() => tick(t => t + 1), 1000);
//     return () => { clearInterval(pollRef.current); clearInterval(tickTimer); };
//   }, []);

//   const phase = status?.marketPhase || "CLOSED";
//   const phaseStyle = PHASE_COLORS[phase] || PHASE_COLORS.CLOSED;
//   const pendingSignals = signals.filter(s => !s.status || s.status === "pending");
//   const intervalMin = status ? Math.round((status.scanInterval || 900000) / 60000) : 15;

//   return (
//     <div style={{ fontFamily: mono, color: "#c8d0d8" }}>
//       <style>{`
//         .sp-tab{background:none;border:none;border-bottom:2px solid transparent;color:#2a3a4a;font-family:${mono};font-size:10px;letter-spacing:.1em;padding:10px 18px;cursor:pointer;transition:color .15s}
//         .sp-tab.active{color:#c8d0d8;border-bottom-color:#00c97a}
//         .sig-card{background:#080f1c;border:1px solid #0f1e30;border-radius:3px;padding:16px 18px;margin-bottom:10px;transition:border-color .2s}
//         .sig-card:hover{border-color:#1a2a3a}
//         .act-btn{border:1px solid #1a2530;color:#3a4a5a;font-family:${mono};font-size:10px;padding:5px 12px;border-radius:2px;cursor:pointer;letter-spacing:.06em;background:none;transition:all .15s}
//         .act-btn:hover{border-color:#2a4060;color:#7a9aaa}
//         .approve-btn{background:#00c97a;border:none;color:#030f08;font-family:${mono};font-size:10px;padding:5px 14px;border-radius:2px;cursor:pointer;font-weight:600;letter-spacing:.06em}
//         .approve-btn:hover{background:#00e688}
//       `}</style>

//       {/* Connection status + controls */}
//       <div style={{ background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 3, padding: "14px 18px", marginBottom: 16 }}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>

//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             {/* Connection indicator */}
//             <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//               <span style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "#00c97a" : "#e05050", display: "inline-block", boxShadow: connected ? "0 0 6px #00c97a" : "none" }} />
//               <span style={{ fontSize: 10, color: connected ? "#00c97a" : "#e05050" }}>
//                 {connected ? "SCANNER CONNECTED" : "SCANNER OFFLINE"}
//               </span>
//             </div>

//             {/* Market phase badge */}
//             {status && (
//               <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 2, letterSpacing: "0.08em", ...phaseStyle }}>
//                 {phase.replace("_", " ")}
//               </span>
//             )}

//             {/* Scanning indicator */}
//             {status?.isScanning && (
//               <span style={{ fontSize: 9, color: "#4a9adf", letterSpacing: "0.08em" }}>
//                 ◌ SCANNING...
//               </span>
//             )}
//           </div>

//           <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//             {/* Next scan countdown */}
//             {status?.nextScanAt && !status.isScanning && (
//               <span style={{ fontSize: 10, color: "#2a4060" }}>
//                 Next scan: {fmtAgo(status.nextScanAt).replace(" ago", "")} ({intervalMin}min interval)
//               </span>
//             )}
//             <button
//               onClick={triggerScan}
//               disabled={!connected || triggering || status?.isScanning}
//               style={{ background: "none", border: "1px solid #1a3050", color: "#4a9adf", fontFamily: mono, fontSize: 10, padding: "5px 12px", borderRadius: 2, cursor: "pointer", letterSpacing: "0.08em", opacity: (!connected || triggering) ? 0.4 : 1 }}
//             >
//               {triggering ? "SCANNING..." : "SCAN NOW"}
//             </button>
//           </div>
//         </div>

//         {/* Stats row */}
//         {status?.stats && (
//           <div style={{ display: "flex", gap: 24, marginTop: 12, fontSize: 10, color: "#2a3a4a", flexWrap: "wrap" }}>
//             <span>Scans today: <span style={{ color: "#c8d0d8" }}>{status.stats.totalScans}</span></span>
//             <span>Signals found: <span style={{ color: "#00c97a" }}>{status.stats.signalsGenerated}</span></span>
//             <span>Skipped: <span style={{ color: "#3a4a5a" }}>{status.stats.signalsSkipped}</span></span>
//             {status.stats.lastScan && <span>Last scan: <span style={{ color: "#3a5a7a" }}>{new Date(status.stats.lastScan).toLocaleTimeString("en-US", { hour12: false })}</span></span>}
//           </div>
//         )}

//         {/* Not connected help */}
//         {!connected && (
//           <div style={{ marginTop: 12, fontSize: 11, color: "#2a3a4a", lineHeight: 1.8 }}>
//             Scanner not running. Start it with:
//             <div style={{ background: "#050810", padding: "8px 12px", borderRadius: 2, marginTop: 6, color: "#00c97a", fontSize: 11 }}>
//               cd signalos-scanner &amp;&amp; npm install &amp;&amp; node scanner.js
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Tabs */}
//       <div style={{ borderBottom: "1px solid #0f1e30", marginBottom: 16, display: "flex" }}>
//         <button className={`sp-tab${activeTab === "signals" ? " active" : ""}`} onClick={() => setActiveTab("signals")}>
//           SIGNALS {pendingSignals.length > 0 && `(${pendingSignals.length})`}
//         </button>
//         <button className={`sp-tab${activeTab === "logs" ? " active" : ""}`} onClick={() => setActiveTab("logs")}>SCAN LOG</button>
//       </div>

//       {/* Signals tab */}
//       {activeTab === "signals" && (
//         <div>
//           {pendingSignals.length === 0 ? (
//             <div style={{ padding: "28px 0", textAlign: "center", fontSize: 11, color: "#1e2a38" }}>
//               {connected
//                 ? phase === "CLOSED"
//                   ? "Market is closed — scanner will resume at 9:30 AM ET"
//                   : "No signals yet this session — scanner is watching..."
//                 : "Start the scanner to see AI-generated signals here"}
//             </div>
//           ) : (
//             pendingSignals.map(signal => (
//               <div key={signal.id} className="sig-card">
//                 {/* Header */}
//                 <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
//                   <span style={{ fontSize: 15, fontWeight: 600 }}>{signal.ticker}</span>
//                   <span style={{ padding: "2px 8px", borderRadius: 2, fontSize: 10, fontWeight: 700, background: signal.side === "BUY" ? "#082018" : "#200808", color: signal.side === "BUY" ? "#00c97a" : "#e05050", border: `1px solid ${signal.side === "BUY" ? "#0a3020" : "#300a0a"}` }}>{signal.side}</span>
//                   <span style={{ padding: "2px 8px", borderRadius: 2, fontSize: 10, fontWeight: 700, background: signal.type === "CALL" ? "#082018" : "#200808", color: signal.type === "CALL" ? "#00c97a" : "#e05050", border: `1px solid ${signal.type === "CALL" ? "#0a3020" : "#300a0a"}` }}>{signal.type}</span>
//                   <span style={{ padding: "2px 7px", borderRadius: 2, fontSize: 9, ...phaseStyle }}>{signal.expiry}</span>
//                   {signal.strike && <span style={{ color: "#8a9aaa", fontSize: 12 }}>{signal.strike}</span>}
//                   <span style={{ fontSize: 10, color: "#3a5a7a" }}>{signal.strategy}</span>
//                   <span style={{ fontSize: 11, color: signal.confidence >= 80 ? "#00c97a" : signal.confidence >= 70 ? "#e0a030" : "#e05050", marginLeft: "auto" }}>{signal.confidence}% conf</span>
//                 </div>

//                 {/* Levels */}
//                 <div style={{ display: "flex", gap: 20, fontSize: 11, marginBottom: 10 }}>
//                   <span><span style={{ color: "#2a3a4a" }}>Entry</span> <span style={{ color: "#c8d0d8" }}>${signal.price}</span></span>
//                   <span><span style={{ color: "#2a3a4a" }}>Target</span> <span style={{ color: "#00c97a" }}>${signal.target}</span></span>
//                   <span><span style={{ color: "#2a3a4a" }}>Stop</span> <span style={{ color: "#e05050" }}>${signal.stop}</span></span>
//                   <span><span style={{ color: "#2a3a4a" }}>TF</span> <span style={{ color: "#3a5a7a" }}>{signal.tf}</span></span>
//                 </div>

//                 {/* Notes */}
//                 {signal.notes && (
//                   <div style={{ fontSize: 11, color: "#3a5a7a", lineHeight: 1.6, marginBottom: 12, borderLeft: "2px solid #0f1e30", paddingLeft: 10 }}>
//                     {signal.notes}
//                   </div>
//                 )}

//                 {/* Footer */}
//                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                   <span style={{ fontSize: 9, color: "#2a4060" }}>
//                     ◆ AI · {signal.phase?.replace("_", " ")} · {fmtAgo(signal.ts)}
//                     {signal.delivered && " · Discord ✓"}
//                   </span>
//                   <div style={{ display: "flex", gap: 8 }}>
//                     <button className="act-btn" onClick={() => dismissSignal(signal.id)}>DISMISS</button>
//                     <button className="approve-btn" onClick={() => approveSignal(signal)}>APPROVE + PUBLISH →</button>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}

//       {/* Logs tab */}
//       {activeTab === "logs" && (
//         <div>
//           {logs.length === 0 ? (
//             <div style={{ padding: "28px 0", textAlign: "center", fontSize: 11, color: "#1e2a38" }}>No scan logs yet</div>
//           ) : (
//             logs.map((log, i) => (
//               <div key={i} style={{ background: "#060c14", border: "1px solid #0a1828", borderRadius: 3, padding: "12px 14px", marginBottom: 8 }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 10 }}>
//                   <span style={{ color: "#4a6a8a" }}>{new Date(log.ts).toLocaleTimeString("en-US", { hour12: false })}</span>
//                   <span style={{ color: "#2a4060", fontSize: 9 }}>{log.phase?.replace("_", " ")}</span>
//                 </div>
//                 <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
//                   {log.results?.map((r, j) => (
//                     <span key={j} style={{
//                       fontSize: 9, padding: "2px 7px", borderRadius: 2,
//                       background: r.result === "no setup" || r.result.startsWith("error") ? "#0a0e14" : "#082018",
//                       color: r.result === "no setup" ? "#2a3a4a" : r.result.startsWith("error") ? "#e05050" : "#00c97a",
//                       border: `1px solid ${r.result === "no setup" ? "#111820" : r.result.startsWith("error") ? "#300a0a" : "#0a3020"}`,
//                     }}>
//                       {r.ticker}: {r.result}
//                     </span>
//                   ))}
//                 </div>
//                 {log.error && <div style={{ fontSize: 10, color: "#e05050", marginTop: 6 }}>Error: {log.error}</div>}
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );
// }