import { useState, useEffect } from "react";

const STORAGE_KEY = "signalos_alert_config";

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

export default function AlertSettings({ onChange }) {
  const [cfg, setCfg] = useState(load);
  const [saved, setSaved] = useState(false);
  const [testingDiscord, setTestingDiscord] = useState(false);
  const [discordResult, setDiscordResult] = useState(null);

  useEffect(() => { onChange?.(cfg); }, [cfg]);

  function set(k, v) { setCfg(p => ({ ...p, [k]: v })); }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    onChange?.(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function testDiscord() {
    if (!cfg.discordWebhook) return;
    setTestingDiscord(true);
    setDiscordResult(null);
    try {
      const res = await fetch(cfg.discordWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            color: 0x00c97a,
            title: "✅ AlertGods — Test Alert",
            description: "Your Discord webhook is connected and working.",
            footer: { text: "AlertGods Alert Engine" },
            timestamp: new Date().toISOString(),
          }]
        }),
      });
      setDiscordResult(res.ok ? "success" : "failed");
    } catch {
      setDiscordResult("failed");
    } finally {
      setTestingDiscord(false);
    }
  }

  const mono = "'JetBrains Mono', 'Fira Code', monospace";
  const inputStyle = {
    background: "#0d1117", border: "1px solid #1a2530", color: "#c8d0d8",
    fontFamily: mono, fontSize: 11, padding: "8px 12px", borderRadius: 2,
    width: "100%", outline: "none",
  };
  const labelStyle = { fontSize: 9, color: "#2a3a4a", letterSpacing: "0.12em", display: "block", marginBottom: 5 };
  const sectionStyle = { background: "#080f1c", border: "1px solid #0f1e30", borderRadius: 3, padding: "18px 20px", marginBottom: 16 };

  return (
    <div style={{ fontFamily: mono, color: "#c8d0d8", maxWidth: 600 }}>

      {/* Discord */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 16 }}>💬</span>
          <span style={{ fontSize: 12, color: "#c8d0d8", fontWeight: 600 }}>Discord Webhook</span>
          {cfg.discordWebhook && <span style={{ fontSize: 9, color: "#00c97a", marginLeft: "auto" }}>CONFIGURED</span>}
        </div>
        <label style={labelStyle}>WEBHOOK URL</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="https://discord.com/api/webhooks/..."
          value={cfg.discordWebhook || ""}
          onChange={e => set("discordWebhook", e.target.value)}
        />
        <div style={{ fontSize: 10, color: "#1e2a38", marginTop: 6, marginBottom: 14, lineHeight: 1.6 }}>
          In Discord: Channel Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL
        </div>
        <button
          onClick={testDiscord}
          disabled={!cfg.discordWebhook || testingDiscord}
          style={{
            background: "none", border: "1px solid #1a3050", color: "#4a9adf",
            fontFamily: mono, fontSize: 10, padding: "6px 14px", borderRadius: 2,
            cursor: "pointer", letterSpacing: "0.08em", opacity: cfg.discordWebhook ? 1 : 0.4,
          }}
        >
          {testingDiscord ? "SENDING..." : "SEND TEST MESSAGE"}
        </button>
        {discordResult && (
          <span style={{ fontSize: 10, marginLeft: 12, color: discordResult === "success" ? "#00c97a" : "#e05050" }}>
            {discordResult === "success" ? "✓ Test delivered" : "✗ Failed — check URL"}
          </span>
        )}
      </div>

      {/* SMS / Twilio */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 16 }}>📱</span>
          <span style={{ fontSize: 12, color: "#c8d0d8", fontWeight: 600 }}>SMS via Twilio</span>
          {cfg.twilioProxyUrl && cfg.smsTo && <span style={{ fontSize: 9, color: "#00c97a", marginLeft: "auto" }}>CONFIGURED</span>}
        </div>

        <div style={{ background: "#040810", border: "1px solid #0a1828", borderRadius: 2, padding: "10px 14px", marginBottom: 14, fontSize: 10, color: "#3a5a7a", lineHeight: 1.7 }}>
          ⚠️ Twilio blocks direct browser requests. You need a small proxy server.<br />
          See <span style={{ color: "#4a9adf" }}>PROXY_SETUP.md</span> for a one-click Vercel deploy.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>PROXY SERVER URL</label>
            <input
              style={inputStyle}
              placeholder="https://your-proxy.vercel.app/sms"
              value={cfg.twilioProxyUrl || ""}
              onChange={e => set("twilioProxyUrl", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>SEND ALERTS TO (phone number)</label>
            <input
              style={inputStyle}
              placeholder="+13055551234"
              value={cfg.smsTo || ""}
              onChange={e => set("smsTo", e.target.value)}
            />
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#1e2a38", lineHeight: 1.6 }}>
          Your Twilio Account SID, Auth Token, and From number stay in the proxy server — never in the browser.
        </div>
      </div>

      {/* Browser notifications */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>🔔</span>
          <span style={{ fontSize: 12, color: "#c8d0d8", fontWeight: 600 }}>Browser Notifications</span>
          <span style={{ fontSize: 9, color: Notification.permission === "granted" ? "#00c97a" : "#e0a030", marginLeft: "auto" }}>
            {Notification.permission === "granted" ? "ENABLED" : Notification.permission === "denied" ? "BLOCKED" : "NOT SET"}
          </span>
        </div>
        {Notification.permission !== "granted" && (
          <button
            onClick={() => Notification.requestPermission()}
            disabled={Notification.permission === "denied"}
            style={{
              background: "#082018", border: "1px solid #0a3020", color: "#00c97a",
              fontFamily: mono, fontSize: 10, padding: "7px 14px", borderRadius: 2,
              cursor: "pointer", letterSpacing: "0.08em",
              opacity: Notification.permission === "denied" ? 0.4 : 1,
            }}
          >
            {Notification.permission === "denied" ? "BLOCKED IN BROWSER SETTINGS" : "ENABLE BROWSER NOTIFICATIONS"}
          </button>
        )}
        {Notification.permission === "granted" && (
          <div style={{ fontSize: 10, color: "#2a4a3a" }}>Pop-up alerts will appear when any signal hits its target or stop.</div>
        )}
      </div>

      {/* Alert thresholds */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 12, color: "#c8d0d8", fontWeight: 600, marginBottom: 14 }}>Alert Thresholds</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>MIN CONFIDENCE TO ALERT (%)</label>
            <input
              style={inputStyle}
              type="number" min="50" max="99"
              value={cfg.minConfidence || 65}
              onChange={e => set("minConfidence", Number(e.target.value))}
            />
          </div>
          <div>
            <label style={labelStyle}>ALERT ON</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={cfg.alertOn || "BOTH"}
              onChange={e => set("alertOn", e.target.value)}
            >
              <option value="BOTH">Target AND Stop hits</option>
              <option value="TARGET">Target hits only</option>
              <option value="STOP">Stop hits only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={save}
        style={{
          width: "100%", background: saved ? "#082018" : "#00c97a",
          color: saved ? "#00c97a" : "#030f08", border: saved ? "1px solid #0a3020" : "none",
          padding: 12, borderRadius: 2, fontFamily: mono, fontSize: 12,
          fontWeight: 600, letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.2s",
        }}
      >
        {saved ? "✓ SETTINGS SAVED" : "SAVE SETTINGS"}
      </button>
    </div>
  );
}
