import { useState, useEffect, useRef, useCallback } from "react";

// ─── Fake price feed (replace with real API e.g. Polygon.io or Alpaca) ───────
// To use real prices, swap fetchPrice() with a real API call.
// Free options: Polygon.io (free tier), Alpaca Markets (free paper trading API)
// Example Polygon: `https://api.polygon.io/v2/last/trade/${ticker}?apiKey=YOUR_KEY`
async function fetchPrice(ticker) {
  // Simulates small price movements around a base price
  const bases = {
    SPY: 481, QQQ: 412, AAPL: 189, TSLA: 247, NVDA: 875,
    MSFT: 420, AMZN: 195, META: 510, AMD: 168, GOOGL: 175,
    "/ES": 4902, "/NQ": 17200, "/CL": 78.5, "/GC": 2340,
  };
  const base = bases[ticker] || 100;
  const jitter = (Math.random() - 0.5) * base * 0.004;
  return +(base + jitter).toFixed(2);
}

// ─── Send Discord alert ───────────────────────────────────────────────────────
async function sendDiscord(webhookUrl, signal, triggerType, price) {
  if (!webhookUrl) return { ok: false, error: "No webhook URL configured" };
  const color = triggerType === "TARGET" ? 0x00c97a : 0xe05050;
  const emoji = triggerType === "TARGET" ? "🟢" : "🔴";
  const body = {
    embeds: [{
      color,
      title: `${emoji} ${signal.ticker} — ${triggerType} HIT`,
      description: `**${signal.side} ${signal.type || ""}** signal has reached its ${triggerType.toLowerCase()} level.`,
      fields: [
        { name: "Ticker", value: signal.ticker, inline: true },
        { name: "Direction", value: `${signal.side} ${signal.type || ""}`.trim(), inline: true },
        { name: "Strategy", value: signal.strategy || "—", inline: true },
        { name: "Entry Price", value: `$${signal.price}`, inline: true },
        { name: `${triggerType} Level`, value: `$${triggerType === "TARGET" ? signal.target : signal.stop}`, inline: true },
        { name: "Current Price", value: `$${price}`, inline: true },
        { name: "Confidence", value: `${signal.confidence}%`, inline: true },
        { name: "Timeframe", value: signal.tf || "—", inline: true },
      ],
      footer: { text: "ALERTGODS Alert Engine" },
      timestamp: new Date().toISOString(),
    }],
  };
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── Send SMS via Twilio ──────────────────────────────────────────────────────
// NOTE: Twilio requires server-side calls (CORS blocks browser → Twilio directly).
// This function calls a lightweight proxy endpoint you host.
// See PROXY_SETUP.md (included) for a simple Vercel/Express setup.
async function sendSMS(twilioConfig, signal, triggerType, price) {
  const { proxyUrl, toNumber } = twilioConfig;
  if (!proxyUrl || !toNumber) return { ok: false, error: "SMS not configured" };
  const emoji = triggerType === "TARGET" ? "✅" : "🛑";
  const message = `${emoji} ALERTGODS: ${signal.ticker} ${signal.side} ${triggerType} HIT @ $${price}. Entry: $${signal.price} | ${triggerType === "TARGET" ? `Target: $${signal.target}` : `Stop: $${signal.stop}`} | ${signal.strategy}`;
  try {
    const res = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: toNumber, body: message }),
    });
    return { ok: res.ok };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── Main AlertEngine component ───────────────────────────────────────────────
export default function AlertEngine({ signals = [], config = {} }) {
  const [watchlist, setWatchlist] = useState([]); // signals being actively watched
  const [firedAlerts, setFiredAlerts] = useState([]); // alert log
  const [prices, setPrices] = useState({}); // latest prices
  const [status, setStatus] = useState("idle"); // idle | polling | paused
  const [toast, setToast] = useState(null);
  const firedIds = useRef(new Set()); // prevent duplicate fires
  const intervalRef = useRef(null);

  // Add new signals with target/stop to watchlist
  useEffect(() => {
    const watchable = signals.filter(s => s.target && s.stop && !firedIds.current.has(`${s.id}-TARGET`) && !firedIds.current.has(`${s.id}-STOP`));
    setWatchlist(watchable);
  }, [signals]);

  const checkPrices = useCallback(async () => {
    if (watchlist.length === 0) return;
    setStatus("polling");
    const tickers = [...new Set(watchlist.map(s => s.ticker))];
    const newPrices = {};
    for (const ticker of tickers) {
      newPrices[ticker] = await fetchPrice(ticker);
    }
    setPrices(prev => ({ ...prev, ...newPrices }));

    // Check each watched signal
    for (const signal of watchlist) {
      const price = newPrices[signal.ticker];
      if (!price) continue;
      const target = parseFloat(signal.target);
      const stop = parseFloat(signal.stop);
      const entry = parseFloat(signal.price);
      const isBuy = signal.side === "BUY";

      // TARGET hit: for BUY, price >= target; for SELL, price <= target
      const targetHit = isBuy ? price >= target : price <= target;
      // STOP hit: for BUY, price <= stop; for SELL, price >= stop
      const stopHit = isBuy ? price <= stop : price >= stop;

      if (targetHit && !firedIds.current.has(`${signal.id}-TARGET`)) {
        firedIds.current.add(`${signal.id}-TARGET`);
        await fireAlert(signal, "TARGET", price);
      } else if (stopHit && !firedIds.current.has(`${signal.id}-STOP`)) {
        firedIds.current.add(`${signal.id}-STOP`);
        await fireAlert(signal, "STOP", price);
      }
    }
    setStatus("idle");
  }, [watchlist, config]);

  async function fireAlert(signal, triggerType, price) {
    const alert = {
      id: `${signal.id}-${triggerType}-${Date.now()}`,
      signal,
      triggerType,
      price,
      ts: new Date(),
      discord: null,
      sms: null,
    };

    // Browser notification
    if (Notification.permission === "granted") {
      const emoji = triggerType === "TARGET" ? "🟢" : "🔴";
      new Notification(`${emoji} ${signal.ticker} ${triggerType} HIT`, {
        body: `${signal.side} signal reached $${price}`,
        icon: "/favicon.ico",
      });
    }

    // Discord
    if (config.discordWebhook) {
      const result = await sendDiscord(config.discordWebhook, signal, triggerType, price);
      alert.discord = result.ok ? "sent" : "failed";
    }

    // SMS
    if (config.twilioProxyUrl && config.smsTo) {
      const result = await sendSMS({ proxyUrl: config.twilioProxyUrl, toNumber: config.smsTo }, signal, triggerType, price);
      alert.sms = result.ok ? "sent" : "failed";
    }

    setFiredAlerts(prev => [alert, ...prev].slice(0, 50));
    showToast(signal, triggerType, price);
  }

  function showToast(signal, triggerType, price) {
    setToast({ signal, triggerType, price });
    setTimeout(() => setToast(null), 5000);
  }

  // Start/stop polling
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (watchlist.length > 0) {
      checkPrices(); // immediate first check
      intervalRef.current = setInterval(checkPrices, 15000); // every 15s
      setStatus("idle");
    }
    return () => clearInterval(intervalRef.current);
  }, [watchlist.length]);

  function requestNotifPermission() {
    Notification.requestPermission();
  }

  const mono = "'JetBrains Mono', 'Fira Code', monospace";

  return (
    <div style={{ fontFamily: mono, position: "relative" }}>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.triggerType === "TARGET" ? "#082018" : "#200808",
          border: `1px solid ${toast.triggerType === "TARGET" ? "#0a3020" : "#300a0a"}`,
          borderRadius: 4, padding: "14px 20px", minWidth: 280,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          animation: "slideIn 0.3s ease",
        }}>
          <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }`}</style>
          <div style={{ fontSize: 11, color: toast.triggerType === "TARGET" ? "#00c97a" : "#e05050", letterSpacing: "0.1em", marginBottom: 6 }}>
            {toast.triggerType === "TARGET" ? "▲ TARGET HIT" : "▼ STOP HIT"}
          </div>
          <div style={{ fontSize: 15, color: "#c8d0d8", fontWeight: 600 }}>
            {toast.signal.ticker} <span style={{ color: "#4a6a8a", fontSize: 12 }}>@ ${toast.price}</span>
          </div>
          <div style={{ fontSize: 11, color: "#3a5a7a", marginTop: 4 }}>
            {toast.signal.strategy} · {toast.signal.tf} · {toast.signal.confidence}% conf
          </div>
        </div>
      )}

      {/* Alert log panel */}
      <div style={{ background: "#0a0e14", border: "1px solid #111820", borderRadius: 3, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #111820", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 9, color: "#2a4060", letterSpacing: "0.15em" }}>◆ ALERT ENGINE</span>
            <span style={{
              fontSize: 9, padding: "2px 7px", borderRadius: 2, letterSpacing: "0.08em",
              background: status === "polling" ? "#0a1828" : watchlist.length > 0 ? "#082018" : "#181010",
              color: status === "polling" ? "#4a9adf" : watchlist.length > 0 ? "#00c97a" : "#3a2a2a",
              border: `1px solid ${status === "polling" ? "#1a3050" : watchlist.length > 0 ? "#0a3020" : "#2a1a1a"}`,
            }}>
              {status === "polling" ? "CHECKING..." : watchlist.length > 0 ? `WATCHING ${watchlist.length}` : "STANDBY"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Notification.permission !== "granted" && (
              <button onClick={requestNotifPermission} style={{ background: "none", border: "1px solid #1a3050", color: "#4a9adf", fontFamily: mono, fontSize: 9, padding: "3px 8px", borderRadius: 2, cursor: "pointer", letterSpacing: "0.08em" }}>
                ENABLE BROWSER ALERTS
              </button>
            )}
          </div>
        </div>

        {/* Live price ticker */}
        {Object.keys(prices).length > 0 && (
          <div style={{ padding: "8px 16px", borderBottom: "1px solid #0a1020", display: "flex", gap: 20, flexWrap: "wrap" }}>
            {Object.entries(prices).map(([ticker, price]) => (
              <span key={ticker} style={{ fontSize: 10 }}>
                <span style={{ color: "#2a4060" }}>{ticker}</span>
                <span style={{ color: "#c8d0d8", marginLeft: 6 }}>${price}</span>
              </span>
            ))}
          </div>
        )}

        {/* Alert log */}
        <div style={{ maxHeight: 280, overflowY: "auto" }}>
          {firedAlerts.length === 0 ? (
            <div style={{ padding: "24px 16px", fontSize: 11, color: "#1e2a38", textAlign: "center" }}>
              {watchlist.length > 0
                ? `Monitoring ${watchlist.length} signal(s) — alerts fire when price hits target or stop`
                : "Publish signals with target + stop levels to start monitoring"}
            </div>
          ) : (
            firedAlerts.map(alert => (
              <div key={alert.id} style={{
                padding: "10px 16px", borderBottom: "1px solid #0a1020",
                display: "flex", alignItems: "center", gap: 12,
                background: alert.triggerType === "TARGET" ? "#040e08" : "#0e0404",
              }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 2,
                  background: alert.triggerType === "TARGET" ? "#082018" : "#200808",
                  color: alert.triggerType === "TARGET" ? "#00c97a" : "#e05050",
                  border: `1px solid ${alert.triggerType === "TARGET" ? "#0a3020" : "#300a0a"}`,
                  flexShrink: 0,
                }}>{alert.triggerType}</span>
                <span style={{ fontSize: 12, color: "#c8d0d8", fontWeight: 600, minWidth: 60 }}>{alert.signal.ticker}</span>
                <span style={{ fontSize: 11, color: "#3a5a7a" }}>hit ${alert.price}</span>
                <span style={{ fontSize: 10, color: "#2a3a4a" }}>{alert.signal.strategy}</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                  {alert.discord && (
                    <span style={{ fontSize: 9, color: alert.discord === "sent" ? "#5a6adf" : "#e05050", letterSpacing: "0.06em" }}>
                      DISCORD {alert.discord === "sent" ? "✓" : "✗"}
                    </span>
                  )}
                  {alert.sms && (
                    <span style={{ fontSize: 9, color: alert.sms === "sent" ? "#00c97a" : "#e05050", letterSpacing: "0.06em" }}>
                      SMS {alert.sms === "sent" ? "✓" : "✗"}
                    </span>
                  )}
                  <span style={{ fontSize: 9, color: "#1e2a38" }}>
                    {alert.ts.toLocaleTimeString("en-US", { hour12: false })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
