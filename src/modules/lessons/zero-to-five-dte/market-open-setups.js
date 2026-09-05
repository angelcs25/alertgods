export default {
  id: "market-open-setups-0dte",
  module: "0dte-trading",
  moduleLabel: "0–5DTE TRADING",
  order: 7,
  title: "Market Open Setups",
  duration: "8 min",
  level: "Intermediate",

  content: [
    {
      type: "text",
      body:
        "The market open is the most explosive time of day. Volume is high, volatility is high, and 0DTE options move fast."
    },

    {
      type: "heading",
      body: "Best Open Setups"
    },
    {
      type: "callout",
      variant: "key",
      body: "The open provides the cleanest momentum — ideal for 0DTE."
    },

    {
      type: "list",
      items: [
        "Break of premarket high/low",
        "Gap fill setups",
        "Opening range breakout",
        "Trend continuation from premarket direction"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Opening Range Breakout",
      body:
        "SPY sets a tight opening range.\n" +
        "Breaks above → strong momentum.\n" +
        "0DTE call expands quickly."
    },

    {
      type: "quiz",
      question: "Which setup is common at market open?",
      options: ["Mid-day chop", "Gap fill", "Power hour reversal", "Overnight drift"],
      answer: 1
    }
  ]
};
