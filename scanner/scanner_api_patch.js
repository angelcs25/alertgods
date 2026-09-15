// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE TWO ROUTES to scanner.js alongside the existing app.get routes
// The SignalComposer calls these to get live Schwab data from the admin panel
// ─────────────────────────────────────────────────────────────────────────────

// Single quote — called when admin selects a ticker in SignalComposer
app.get("/api/quote", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });
  try {
    const quotes = await fetchQuotes([symbol]);
    const quote = quotes[symbol];
    if (!quote) return res.status(404).json({ error: `No quote for ${symbol}` });
    res.json(quote);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Options chain — called when admin clicks Generate in SignalComposer
app.get("/api/chain", async (req, res) => {
  const { symbol, maxDte = 5 } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });
  if (symbol.startsWith("/")) return res.json(null); // futures have no options chain
  try {
    const chain = await fetchOptionsChain(symbol, parseInt(maxDte));
    res.json(chain);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});