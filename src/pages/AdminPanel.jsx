import {useState, useEffect} from "react";
import SignalComposer from "./SignalComposer";
import AlertEngine from "./AlertEngine";
import AlertSettings from "./AlertSettings";

const SCANNER_URL = import.meta.env.VITE_SCANNER_URL || "http://localhost:3001";
// Reuses the same password that already gates this /admin page (VITE_ADMIN)
// as the scanner's ADMIN_KEY, instead of baking a second secret into the
// public frontend bundle. For this to work, set Railway's ADMIN_KEY env var
// to this exact same value.
const ADMIN_KEY = import.meta.env.VITE_ADMIN;

export default function AdminPanel({ onPublish, onNavigate, allSignals = [] }) {
  const [tab, setTab] = useState("compose");
  const [alertConfig, setAlertConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem("signalos_alert_config")) || {}; }
    catch { return {}; }
  });

  // ─── Scanner pause/resume ──────────────────────────────────────────────────
  // So pausing the scanner for the day doesn't require a curl command or a
  // computer — just open this (already password-protected) admin page on
  // your phone and tap the button.
  const [scanStatus,   setScanStatus]   = useState(null); // null = not loaded yet
  const [scanUnreachable, setScanUnreachable] = useState(false);
  const [toggling,     setToggling]     = useState(false);
  const [toggleError,  setToggleError]  = useState("");

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`${SCANNER_URL}/api/status`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) { setScanStatus(data); setScanUnreachable(false); }
      } catch {
        if (!cancelled) setScanUnreachable(true);
      }
    }
    poll();
    const iv = setInterval(poll, 15000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  async function togglePause() {
    if (!scanStatus) return;
    const endpoint = scanStatus.scanningPaused ? "resume" : "pause";
    setToggling(true);
    setToggleError("");
    try {
      const res = await fetch(`${SCANNER_URL}/api/admin/${endpoint}`, {
        method: "POST",
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) {
        throw new Error(res.status === 403
          ? "Rejected — ADMIN_KEY on Railway doesn't match VITE_ADMIN"
          : `Scanner returned ${res.status}`);
      }
      const data = await res.json();
      setScanStatus(s => ({ ...s, scanningPaused: data.scanningPaused }));
    } catch (e) {
      setToggleError(e.message || "Couldn't reach the scanner — try again in a moment");
    } finally {
      setToggling(false);
    }
  }

  const mono = "'JetBrains Mono', 'Fira Code', monospace";

  const tabs = [
    { id: "compose",  label: "COMPOSE SIGNAL" },
    { id: "alerts",   label: "ALERT MONITOR" },
    { id: "settings", label: "ALERT SETTINGS" },
  ];

  return (
    <div style={{
      fontFamily: mono,
      background: "#0a0e14",
      color: "#c8d0d8",
      minHeight: "100vh",
    }}>
      {/* Top bar */}
      <div style={{
        padding: "0 24px",
        height: 52,
        borderBottom: "1px solid #111820",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#080b0f",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => onNavigate?.("/")}
            style={{ background: "none", border: "none", color: "#00c97a", fontFamily: mono, fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", cursor: "pointer" }}
          >
            ◈ALERTGODS
          </button>
          <span style={{ color: "#1e2a38" }}>|</span>
          <span style={{ color: "#2a4060", fontSize: 10, letterSpacing: "0.1em" }}>ADMIN</span>
        </div>
        <button
          onClick={() => onNavigate?.("/login")}
          style={{ background: "none", border: "1px solid #1a2530", color: "#4a6a8a", fontFamily: mono, fontSize: 10, padding: "5px 12px", borderRadius: 2, cursor: "pointer", letterSpacing: "0.08em" }}
        >
          ← SUBSCRIBER VIEW
        </button>
      </div>

      {/* Scanner pause/resume — the thing you actually want on your phone */}
      <div style={{
        padding: "10px 24px", borderBottom: "1px solid #111820", background: "#060a0e",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", display: "inline-block",
            background: scanUnreachable ? "#e05050" : scanStatus?.scanningPaused ? "#e0a030" : "#00c97a",
          }} />
          <span style={{ color: "#8a9aaa" }}>
            {scanUnreachable
              ? "Can't reach scanner"
              : !scanStatus
                ? "Checking scanner…"
                : scanStatus.scanningPaused
                  ? "Scanner PAUSED"
                  : `Scanner running (${scanStatus.dailySignalCount}/${scanStatus.maxDailySignals} today)`}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {toggleError && <span style={{ fontSize: 10, color: "#e05050" }}>{toggleError}</span>}
          <button
            onClick={togglePause}
            disabled={!scanStatus || toggling}
            style={{
              background: scanStatus?.scanningPaused ? "#00c97a" : "#200808",
              color: scanStatus?.scanningPaused ? "#030f08" : "#e05050",
              border: `1px solid ${scanStatus?.scanningPaused ? "#00c97a" : "#300a0a"}`,
              fontFamily: mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
              padding: "7px 16px", borderRadius: 2, cursor: !scanStatus || toggling ? "default" : "pointer",
              opacity: !scanStatus || toggling ? 0.5 : 1,
            }}
          >
            {toggling ? "…" : scanStatus?.scanningPaused ? "▶ RESUME SCANNING" : "⏸ PAUSE SCANNING"}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid #111820", background: "#080b0f" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? "2px solid #00c97a" : "2px solid transparent",
              color: tab === t.id ? "#c8d0d8" : "#2a3a4a",
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: "0.1em",
              padding: "14px 24px",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            {t.label}
            {t.id === "alerts" && allSignals.filter(s => s.target && s.stop).length > 0 && (
              <span style={{
                marginLeft: 8, background: "#082018", color: "#00c97a",
                border: "1px solid #0a3020", borderRadius: 10,
                fontSize: 9, padding: "1px 6px",
              }}>
                {allSignals.filter(s => s.target && s.stop).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        {tab === "compose" && (
          <SignalComposer onPublish={(signal) => {
            onPublish?.(signal);
            setTab("alerts"); // jump to monitor after publishing
          }} />
        )}

        {tab === "alerts" && (
          <div style={{ maxWidth: 760 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 6 }}>◆ REAL-TIME ALERT MONITOR</div>
              <div style={{ fontSize: 11, color: "#2a3a4a", lineHeight: 1.7 }}>
                Watches all active signals with a target + stop level. Polls price every 15 seconds.
                Fires Discord and SMS when either level is hit.
              </div>
            </div>
            <AlertEngine
              signals={allSignals}
              config={alertConfig}
            />
            {allSignals.filter(s => s.target && s.stop).length === 0 && (
              <div style={{
                marginTop: 16, padding: "16px 20px",
                background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 3,
                fontSize: 11, color: "#2a3a4a", lineHeight: 1.7,
              }}>
                No signals with target + stop levels yet.{" "}
                <button
                  onClick={() => setTab("compose")}
                  style={{ background: "none", border: "none", color: "#4a9adf", fontFamily: mono, fontSize: 11, cursor: "pointer", padding: 0 }}
                >
                  Compose a signal →
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, color: "#2a4060", letterSpacing: "0.15em", marginBottom: 6 }}>◆ ALERT DELIVERY SETTINGS</div>
              <div style={{ fontSize: 11, color: "#2a3a4a", lineHeight: 1.7 }}>
                Configure where alerts go when a signal hits its target or stop.
              </div>
            </div>
            <AlertSettings onChange={setAlertConfig} />
          </div>
        )}
      </div>
    </div>
  );
}