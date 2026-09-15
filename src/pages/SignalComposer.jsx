import { useState } from "react";

// ─── Schwab data comes from your scanner backend, not the browser directly.
// The browser calls the scanner API which calls Schwab.
// This is the correct architecture — Schwab OAuth tokens stay on the server.
const SCANNER_URL = import.meta.env.VITE_SCANNER_URL || "http://localhost:3001";

const TICKERS     = ["SPY","QQQ","IWM","AAPL","TSLA","NVDA","MSFT","AMZN","META","AMD","AVGO","MU","TSM","/ES","/NQ","/CL","/GC"];
const STRATEGIES  = ["RSI Divergence","MACD Cross","EMA Breakout","Volume Spike","BB Squeeze","Order Flow","VWAP Reclaim","Support Bounce","Resistance Break","Gap Fill"];
const TIMEFRAMES  = ["1m","5m","15m","30m","1h","4h","1D"];
const EXPIRATIONS = ["0DTE","1DTE","2DTE","3DTE","4DTE","5DTE","Weekly","Monthly","SPOT"];
const BLANK       = { ticker:"",side:"BUY",type:"CALL",price:"",strike:"",expiry:"0DTE",stop:"",target:"",strategy:"",tf:"5m",confidence:75,notes:"" };
const mono        = "'JetBrains Mono','Fira Code',monospace";

// ─── Fetch quote from scanner (which uses Schwab internally) ──────────────────
async function fetchQuoteFromScanner(ticker) {
  const res = await fetch(`${SCANNER_URL}/api/quote?symbol=${encodeURIComponent(ticker)}`);
  if (!res.ok) throw new Error(`Scanner returned ${res.status} — is it running?`);
  return res.json();
  // Returns: { symbol, price, bid, ask, open, high, low, change, changePct, volume }
}

// ─── Fetch options chain from scanner ─────────────────────────────────────────
async function fetchChainFromScanner(ticker, maxDte = 5) {
  const res = await fetch(`${SCANNER_URL}/api/chain?symbol=${encodeURIComponent(ticker)}&maxDte=${maxDte}`);
  if (!res.ok) throw new Error(`Chain fetch failed — scanner may not be running`);
  return res.json();
  // Returns: { expiration, dte, dteLabel, calls, puts, allOptions, underlyingPrice }
}

// ─── Claude with real market data ────────────────────────────────────────────
async function callClaudeWithMarketData(marketContext) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: `You are a professional options signal analyst for AlertGods. You receive REAL live market data from the Schwab ThinkorSwim API.

Use actual price and options chain data (greeks, IV, volume) to generate precise signals.
Target 0-5DTE options — prefer lower DTE when the setup is strong and directional.
Pick the best strike: balanced delta (0.35-0.55 for directional plays), liquid (high volume), reasonable IV.

Rules:
- ACTUAL price from the data only — never estimate
- Specific strike from the chain (e.g. "480C @ 3.20")
- Stop and target at real technical levels (today's high/low, key round numbers)
- Only suggest if confidence >= 70%
- For 0-1DTE: tight stops (0.5-1.5%), theta decay is brutal

Respond ONLY with valid JSON — no markdown, no backticks:
{
  "ticker": string,
  "side": "BUY" | "SELL",
  "type": "CALL" | "PUT" | "FUT",
  "price": string,
  "strike": string,
  "expiry": "0DTE" | "1DTE" | "2DTE" | "3DTE" | "4DTE" | "5DTE" | "Weekly" | "Monthly" | "SPOT",
  "stop": string,
  "target": string,
  "strategy": string,
  "tf": "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1D",
  "confidence": number,
  "notes": string
}
strategy must be one of: RSI Divergence, MACD Cross, EMA Breakout, Volume Spike, BB Squeeze, Order Flow, VWAP Reclaim, Support Bounce, Resistance Break, Gap Fill`,
      messages: [{ role: "user", content: marketContext }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API error ${res.status}`);
  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ─── Claude from plain prompt (no live data — for futures or manual) ──────────
async function callClaudePrompt(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: `You are a trading signal assistant for AlertGods. Generate a structured options or futures signal from a plain-English description.
Respond ONLY with valid JSON:
{
  "ticker": string, "side": "BUY"|"SELL", "type": "CALL"|"PUT"|"FUT",
  "price": string, "strike": string,
  "expiry": "0DTE"|"1DTE"|"2DTE"|"3DTE"|"4DTE"|"5DTE"|"Weekly"|"Monthly"|"SPOT",
  "stop": string, "target": string, "strategy": string,
  "tf": "1m"|"5m"|"15m"|"30m"|"1h"|"4h"|"1D",
  "confidence": number, "notes": string
}
strategy must be one of: RSI Divergence, MACD Cross, EMA Breakout, Volume Spike, BB Squeeze, Order Flow, VWAP Reclaim, Support Bounce, Resistance Break, Gap Fill`,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ─── Format market data as context string for Claude ─────────────────────────
function buildMarketContext(ticker, quote, chain, userPrompt) {
  let ctx = `TICKER: ${ticker}\n`;
  ctx += `PRICE: $${quote.price}`;
  if (quote.change != null) ctx += ` (${quote.change >= 0 ? "+" : ""}${quote.change?.toFixed(2)}, ${quote.changePct >= 0 ? "+" : ""}${quote.changePct?.toFixed(2)}%)`;
  ctx += `\n`;
  if (quote.open) ctx += `TODAY: Open $${quote.open} | High $${quote.high} | Low $${quote.low}\n`;
  if (quote.volume) ctx += `VOLUME: ${(quote.volume / 1000).toFixed(0)}K\n`;
  if (quote.bid)   ctx += `BID/ASK: $${quote.bid} / $${quote.ask}\n`;

  if (chain) {
    ctx += `\n${chain.dteLabel} OPTIONS CHAIN (exp: ${chain.expiration}, DTE: ${chain.dte})\n`;
    ctx += `TOP CALLS:\n`;
    (chain.calls || []).forEach(o => {
      ctx += `  CALL $${o.strike} | Last $${o.last ?? "—"} | Vol ${o.volume ?? 0} | OI ${o.open_interest ?? 0}`;
      if (o.greeks?.delta) ctx += ` | Δ ${o.greeks.delta.toFixed(2)}`;
      if (o.greeks?.theta) ctx += ` | Θ ${o.greeks.theta.toFixed(3)}`;
      if (o.iv)            ctx += ` | IV ${o.iv.toFixed(1)}%`;
      ctx += "\n";
    });
    ctx += `TOP PUTS:\n`;
    (chain.puts || []).forEach(o => {
      ctx += `  PUT $${o.strike} | Last ${o.last ?? "—"} | Vol ${o.volume ?? 0} | OI ${o.open_interest ?? 0}`;
      if (o.greeks?.delta) ctx += ` | Δ ${o.greeks.delta.toFixed(2)}`;
      if (o.greeks?.theta) ctx += ` | Θ ${o.greeks.theta.toFixed(3)}`;
      if (o.iv)            ctx += ` | IV ${o.iv.toFixed(1)}%`;
      ctx += "\n";
    });
  }

  if (userPrompt?.trim()) ctx += `\nTrader notes: ${userPrompt}`;
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SignalComposer({ onPublish }) {
  const [form,         setForm]         = useState(BLANK);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiError,      setAiError]      = useState("");
  const [aiStep,       setAiStep]       = useState("");
  const [aiPrompt,     setAiPrompt]     = useState("");
  const [published,    setPublished]    = useState(false);
  const [sending,      setSending]      = useState(false);
  const [marketData,   setMarketData]   = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [dataError,    setDataError]    = useState("");
  const [scannerUp,    setScannerUp]    = useState(null); // null=unknown, true, false

  const isFutures = form.ticker?.startsWith("/");
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  // When ticker changes, fetch live quote from scanner (Schwab)
  async function handleTickerChange(ticker) {
    set("ticker", ticker);
    if (!ticker) { setMarketData(null); return; }
    if (ticker.startsWith("/")) {
      // Futures — try scanner, show message if offline
      setMarketData(null);
      return;
    }
    setFetchingData(true);
    setDataError("");
    try {
      const quote = await fetchQuoteFromScanner(ticker);
      set("price", String(quote.price));
      setMarketData({ quote, chain: null });
      setScannerUp(true);
    } catch (e) {
      setScannerUp(false);
      setDataError(`Scanner offline — enter price manually or deploy scanner to Railway`);
    } finally {
      setFetchingData(false);
    }
  }

  async function generateAI() {
    setAiLoading(true);
    setAiError("");

    // Equities — fetch live Schwab data from scanner then send to Claude
    if (form.ticker && !isFutures) {
      try {
        setAiStep("Fetching live Schwab quote...");
        const quote = await fetchQuoteFromScanner(form.ticker);
        set("price", String(quote.price));
        setScannerUp(true);

        setAiStep("Loading options chain (0-5DTE)...");
        let chain = null;
        try { chain = await fetchChainFromScanner(form.ticker, 5); } catch {}

        setMarketData({ quote, chain });
        setAiStep("Analyzing with Claude...");

        const ctx = buildMarketContext(form.ticker, quote, chain, aiPrompt);
        const result = await callClaudeWithMarketData(ctx);
        setForm(f => ({ ...f, ...result }));
        setAiStep("");
      } catch (e) {
        // Scanner offline — fall back to prompt-only
        setScannerUp(false);
        setAiStep("Scanner offline — generating from description only...");
        try {
          const prompt = `Ticker: ${form.ticker}. ${aiPrompt || "Generate the best current setup."}`;
          const result = await callClaudePrompt(prompt);
          setForm(f => ({ ...f, ...result }));
          setAiStep("");
        } catch (e2) {
          setAiError(`Generation failed: ${e2.message}`);
          setAiStep("");
        }
      }
    } else {
      // Futures or no ticker — use plain prompt
      if (!aiPrompt.trim() && !form.ticker) {
        setAiError("Enter a ticker or describe the setup first.");
        setAiLoading(false);
        return;
      }
      setAiStep("Generating signal...");
      try {
        const prompt = form.ticker
          ? `Ticker: ${form.ticker}. ${aiPrompt || "Generate the best current setup."}`
          : aiPrompt;
        const result = await callClaudePrompt(prompt);
        setForm(f => ({ ...f, ...result }));
        setAiStep("");
      } catch (e) {
        setAiError(`AI generation failed: ${e.message}`);
        setAiStep("");
      }
    }
    setAiLoading(false);
  }

  async function handlePublish() {
    if (!form.ticker || !form.price) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 600));
    onPublish?.({ ...form, id: Date.now(), ts: new Date(), delivered: true });
    setSending(false);
    setPublished(true);
    setTimeout(() => { setPublished(false); setForm(BLANK); setAiPrompt(""); setMarketData(null); }, 2000);
  }

  // Scanner status label
  const scannerLabel = scannerUp === true
    ? "● SCHWAB LIVE"
    : scannerUp === false
    ? "✗ SCANNER OFFLINE — deploy to Railway"
    : "◌ SCHWAB VIA SCANNER";

  const scannerColor = scannerUp === true ? "#00c97a" : scannerUp === false ? "#e05050" : "#4a9adf";
  const scannerBg    = scannerUp === true ? "#082018" : scannerUp === false ? "#200808" : "#080a20";
  const scannerBdr   = scannerUp === true ? "#0a3020" : scannerUp === false ? "#300a0a" : "#0a1840";

  return (
    <div style={{ fontFamily: mono, background: "#0a0e14", color: "#c8d0d8", padding: "24px", minHeight: "100vh" }}>
      <style>{`
        .ci{background:#0d1117;border:1px solid #1a2530;color:#c8d0d8;font-family:${mono};font-size:12px;padding:8px 12px;border-radius:2px;width:100%;outline:none}
        .ci:focus{border-color:#2a4060}.ci::placeholder{color:#2a3a4a}select.ci{cursor:pointer}
        .seg{flex:1;background:none;border:1px solid #1a2530;color:#3a4a5a;font-family:${mono};font-size:11px;padding:7px 0;cursor:pointer;letter-spacing:.05em}
        .seg:first-child{border-radius:2px 0 0 2px}.seg:last-child{border-radius:0 2px 2px 0}.seg:not(:last-child){border-right:none}
        .seg.ab{background:#082018;color:#00c97a;border-color:#0a3020}.seg.as{background:#200808;color:#e05050;border-color:#300a0a}
        .seg.ac{background:#082018;color:#00c97a;border-color:#0a3020}.seg.ap{background:#200808;color:#e05050;border-color:#300a0a}
        .fl{font-size:9px;color:#2a3a4a;letter-spacing:.12em;margin-bottom:5px;display:block}
        .pub{width:100%;background:#00c97a;color:#030f08;border:none;padding:13px;border-radius:2px;font-family:${mono};font-size:12px;font-weight:600;letter-spacing:.08em;cursor:pointer}
        .pub:hover:not(:disabled){background:#00e688}.pub:disabled{opacity:.5;cursor:not-allowed}
        .aib{background:#0a1828;border:1px solid #1a3050;color:#4a9adf;font-family:${mono};font-size:11px;padding:8px 14px;border-radius:2px;cursor:pointer;white-space:nowrap;flex-shrink:0}
        .aib:disabled{opacity:.5;cursor:not-allowed}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <span style={{ color:"#00c97a", fontSize:13, fontWeight:600, letterSpacing:"0.12em" }}>◈ ALERTGODS</span>
        <span style={{ color:"#1e2a38" }}>|</span>
        <span style={{ color:"#3a4a5a", fontSize:11 }}>SIGNAL COMPOSER</span>
        <span style={{ fontSize:9, padding:"2px 8px", borderRadius:2, background:scannerBg, color:scannerColor, border:`1px solid ${scannerBdr}` }}>
          {scannerLabel}
        </span>
      </div>

      <div style={{ maxWidth: 760 }}>

        {/* Ticker + live quote */}
        <div style={{ background:"#080f1c", border:"1px solid #0f1e30", borderRadius:3, padding:"18px 20px", marginBottom:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:16, alignItems:"start" }}>
            <div>
              <label className="fl">TICKER</label>
              <select className="ci" value={form.ticker} onChange={e => handleTickerChange(e.target.value)}>
                <option value="">— select —</option>
                <optgroup label="Equities & ETFs">{TICKERS.filter(t=>!t.startsWith("/")).map(t=><option key={t} value={t}>{t}</option>)}</optgroup>
                <optgroup label="Futures">{TICKERS.filter(t=>t.startsWith("/")).map(t=><option key={t} value={t}>{t}</option>)}</optgroup>
              </select>
            </div>
            <div style={{ paddingTop:16 }}>
              {fetchingData && <span style={{ fontSize:11, color:"#2a4060" }}>Fetching from Schwab...</span>}
              {dataError && <span style={{ fontSize:11, color:"#e05050" }}>{dataError}</span>}
              {marketData?.quote && !fetchingData && (
                <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                  <span style={{ fontSize:22, fontWeight:600 }}>${marketData.quote.price}</span>
                  {marketData.quote.change != null && (
                    <span style={{ fontSize:12, color: marketData.quote.change >= 0 ? "#00c97a" : "#e05050" }}>
                      {marketData.quote.change >= 0 ? "+" : ""}{marketData.quote.change?.toFixed(2)} ({marketData.quote.changePct >= 0 ? "+" : ""}{marketData.quote.changePct?.toFixed(2)}%)
                    </span>
                  )}
                  {marketData.quote.volume && <span style={{ fontSize:10, color:"#2a4060" }}>Vol: {(marketData.quote.volume/1000).toFixed(0)}K</span>}
                  {marketData.chain && <span style={{ fontSize:9, padding:"2px 8px", borderRadius:2, background:"#080a20", color:"#4a9adf", border:"1px solid #0a1840" }}>● chain · {marketData.chain.dteLabel} · {marketData.chain.expiration}</span>}
                </div>
              )}
              {!marketData && !fetchingData && !dataError && (
                <span style={{ fontSize:11, color:"#1e2a38" }}>Select a ticker to load live Schwab data</span>
              )}
            </div>
          </div>
        </div>

        {/* AI generation */}
        <div style={{ background:"#080f1c", border:"1px solid #0f1e30", borderRadius:3, padding:"18px 20px", marginBottom:16 }}>
          <div style={{ fontSize:9, color:"#2a6aaf", letterSpacing:"0.15em", marginBottom:12 }}>
            ◆ AI SIGNAL GENERATION {form.ticker && !isFutures && scannerUp ? `— using live Schwab data for ${form.ticker}` : form.ticker && isFutures ? "— futures (prompt mode)" : "— describe the setup below"}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input className="ci"
              placeholder={form.ticker ? "Describe setup (or leave blank to let AI decide)" : "Select a ticker above, or describe any setup here..."}
              value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!aiLoading&&generateAI()} />
            <button className="aib" onClick={generateAI} disabled={aiLoading}>
              {aiLoading ? (aiStep || "WORKING...") : "GENERATE →"}
            </button>
          </div>
          {aiStep && aiLoading && (
            <div style={{ fontSize:10, color:"#2a6aaf", marginTop:8, display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>◌</span>{aiStep}
            </div>
          )}
          {aiError && <div style={{ fontSize:10, color:"#e05050", marginTop:8 }}>{aiError}</div>}
          {!aiError && !aiLoading && (
            <div style={{ fontSize:10, color:"#1e2a38", marginTop:6 }}>
              {scannerUp === false
                ? "Scanner offline — Claude will generate from description only. Deploy scanner to Railway for live Schwab data."
                : "Claude reads live Schwab price and 0-5DTE options chain before generating."}
            </div>
          )}
        </div>

        {/* Form fields */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
          <div><label className="fl">STRATEGY</label>
            <select className="ci" value={form.strategy} onChange={e=>set("strategy",e.target.value)}>
              <option value="">— select —</option>
              {STRATEGIES.map(s=><option key={s} value={s}>{s}</option>)}
            </select></div>
          <div><label className="fl">TIMEFRAME</label>
            <select className="ci" value={form.tf} onChange={e=>set("tf",e.target.value)}>
              {TIMEFRAMES.map(t=><option key={t} value={t}>{t}</option>)}
            </select></div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label className="fl">DIRECTION</label>
          <div style={{ display:"flex" }}>
            {["BUY","SELL"].map(s=><button key={s} className={`seg${form.side===s?(s==="BUY"?" ab":" as"):""}`} onClick={()=>set("side",s)}>{s}</button>)}
          </div>
        </div>

        {!isFutures && <div style={{ marginBottom:16 }}>
          <label className="fl">OPTION TYPE</label>
          <div style={{ display:"flex" }}>
            {["CALL","PUT"].map(t=><button key={t} className={`seg${form.type===t?(t==="CALL"?" ac":" ap"):""}`} onClick={()=>set("type",t)}>{t}</button>)}
          </div>
        </div>}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 }}>
          <div><label className="fl">CURRENT PRICE {fetchingData && "↻"}</label>
            <input className="ci" placeholder="auto-filled from Schwab" value={form.price} onChange={e=>set("price",e.target.value)}/></div>
          <div><label className="fl">{isFutures ? "ENTRY LEVEL" : "STRIKE / PREMIUM"}</label>
            <input className="ci" placeholder={isFutures ? "e.g. 5482.50" : "e.g. 480C @ 3.20"} value={form.strike} onChange={e=>set("strike",e.target.value)}/></div>
          {!isFutures && <div><label className="fl">EXPIRATION (DTE)</label>
            <select className="ci" value={form.expiry} onChange={e=>set("expiry",e.target.value)}>
              {EXPIRATIONS.map(e=><option key={e} value={e}>{e}</option>)}
            </select></div>}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
          <div><label className="fl">STOP LEVEL</label><input className="ci" placeholder="e.g. 478.50" value={form.stop} onChange={e=>set("stop",e.target.value)}/></div>
          <div><label className="fl">TARGET</label><input className="ci" placeholder="e.g. 485.00" value={form.target} onChange={e=>set("target",e.target.value)}/></div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label className="fl" style={{ display:"flex", justifyContent:"space-between" }}>
            <span>CONFIDENCE</span>
            <span style={{ color: form.confidence>=80?"#00c97a":form.confidence>=70?"#e0a030":"#e05050" }}>{form.confidence}%</span>
          </label>
          <input type="range" min={50} max={99} value={form.confidence} onChange={e=>set("confidence",Number(e.target.value))} style={{ width:"100%", accentColor:"#00c97a", cursor:"pointer" }}/>
        </div>

        <div style={{ marginBottom:24 }}>
          <label className="fl">SIGNAL NOTES</label>
          <textarea className="ci" rows={3} style={{ resize:"vertical", lineHeight:1.6 }} placeholder="Rationale for subscribers..." value={form.notes} onChange={e=>set("notes",e.target.value)}/>
        </div>

        {/* Options chain preview */}
        {marketData?.chain && (
          <div style={{ background:"#060c14", border:"1px solid #0a1828", borderRadius:3, padding:"14px 16px", marginBottom:20 }}>
            <div style={{ fontSize:9, color:"#2a4060", letterSpacing:"0.12em", marginBottom:10 }}>
              {marketData.chain.dteLabel} OPTIONS CHAIN · {marketData.chain.expiration} · Schwab ThinkorSwim · top by volume
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
                <thead><tr style={{ color:"#1e2a38" }}>
                  {["TYPE","STRIKE","LAST","VOL","OI","IV","DELTA","THETA"].map(h=><th key={h} style={{ textAlign:"left", paddingBottom:6, paddingRight:10, fontWeight:400 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {(marketData.chain.allOptions || []).slice(0,10).map((o,i)=>(
                    <tr key={i} style={{ borderTop:"1px solid #0a1020" }}>
                      <td style={{ padding:"5px 10px 5px 0", color:o.option_type==="call"?"#00c97a":"#e05050" }}>{o.option_type?.toUpperCase()}</td>
                      <td style={{ color:"#c8d0d8" }}>${o.strike}</td>
                      <td style={{ color:"#8a9aaa" }}>${o.last??"—"}</td>
                      <td style={{ color:"#4a6a8a" }}>{(o.volume||0).toLocaleString()}</td>
                      <td style={{ color:"#3a5a7a" }}>{(o.open_interest||0).toLocaleString()}</td>
                      <td style={{ color:"#e0a030" }}>{o.iv ? o.iv.toFixed(1)+"%" : o.greeks?.smv_vol ? (o.greeks.smv_vol*100).toFixed(1)+"%" : "—"}</td>
                      <td style={{ color:"#4a9adf" }}>{o.greeks?.delta?.toFixed(2)??"—"}</td>
                      <td style={{ color:"#6a4a8a" }}>{o.greeks?.theta?.toFixed(3)??"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signal preview */}
        {form.ticker && form.price && (
          <div style={{ background:"#080f1c", border:"1px solid #1a2a3a", borderRadius:3, padding:"16px 18px", marginBottom:20 }}>
            <div style={{ fontSize:9, color:"#2a4060", letterSpacing:"0.12em", marginBottom:10 }}>SIGNAL PREVIEW</div>
            <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ fontSize:16, fontWeight:600 }}>{form.ticker}</span>
              <span style={{ padding:"2px 8px", borderRadius:2, fontSize:10, fontWeight:700, background:form.side==="BUY"?"#082018":"#200808", color:form.side==="BUY"?"#00c97a":"#e05050", border:`1px solid ${form.side==="BUY"?"#0a3020":"#300a0a"}` }}>{form.side}</span>
              {!isFutures && <span style={{ padding:"2px 8px", borderRadius:2, fontSize:10, fontWeight:700, background:form.type==="CALL"?"#082018":"#200808", color:form.type==="CALL"?"#00c97a":"#e05050", border:`1px solid ${form.type==="CALL"?"#0a3020":"#300a0a"}` }}>{form.type}</span>}
              {form.expiry && !isFutures && <span style={{ fontSize:10, color:"#4a9adf", background:"#080a20", border:"1px solid #0a1840", padding:"2px 7px", borderRadius:2 }}>{form.expiry}</span>}
              {form.strike && <span style={{ color:"#8a9aaa", fontSize:12 }}>{form.strike}</span>}
              {form.strategy && <span style={{ fontSize:10, color:"#2a4a6a" }}>{form.strategy}</span>}
              <span style={{ fontSize:11, color:form.confidence>=80?"#00c97a":form.confidence>=70?"#e0a030":"#e05050", marginLeft:"auto" }}>{form.confidence}% conf</span>
            </div>
            {(form.stop||form.target) && <div style={{ display:"flex", gap:20, marginTop:8, fontSize:11 }}>
              {form.stop && <span><span style={{ color:"#2a3a4a" }}>Stop</span> <span style={{ color:"#e05050" }}>${form.stop}</span></span>}
              {form.target && <span><span style={{ color:"#2a3a4a" }}>Target</span> <span style={{ color:"#00c97a" }}>${form.target}</span></span>}
            </div>}
            {form.notes && <div style={{ marginTop:10, fontSize:11, color:"#3a5a7a", lineHeight:1.6, borderTop:"1px solid #0f1e30", paddingTop:10 }}>{form.notes}</div>}
          </div>
        )}

        <button className="pub" onClick={handlePublish} disabled={!form.ticker||!form.price||sending||published}>
          {published ? "✓ SIGNAL PUBLISHED" : sending ? "BROADCASTING..." : "PUBLISH SIGNAL →"}
        </button>

        {/* Scanner offline help */}
        {scannerUp === false && (
          <div style={{ marginTop:20, background:"#080810", border:"1px solid #300a0a", borderRadius:3, padding:"14px 16px", fontSize:11, color:"#2a3a4a", lineHeight:1.8 }}>
            <div style={{ color:"#e0a030", fontSize:9, letterSpacing:"0.12em", marginBottom:8 }}>⚠ SCANNER OFFLINE — Schwab data unavailable</div>
            <div>To get live Schwab data, the scanner must be running:</div>
            <div style={{ marginTop:6 }}>Local: <span style={{ color:"#c8d0d8", fontFamily:"monospace" }}>cd scanner && node scanner.js</span></div>
            <div>Production: deploy <span style={{ color:"#c8d0d8" }}>scanner/</span> to Railway (see RAILWAY_DEPLOY.md)</div>
            <div style={{ marginTop:6, color:"#3a5a7a" }}>Claude can still generate signals from your description while the scanner is offline.</div>
          </div>
        )}
      </div>
    </div>
  );
}