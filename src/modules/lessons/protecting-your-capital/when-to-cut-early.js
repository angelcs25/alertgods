export default {
  id: "when-to-cut-early",
  module: "risk-management",
  moduleLabel: "RISK MANAGEMENT",
  order: 5,
  title: "When to Cut Early",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Sometimes you must exit before your stop is hit. Cutting early protects your account when the trade loses its edge."
    },

    {
      type: "heading",
      body: "Early Exit Signals"
    },
    {
      type: "callout",
      variant: "key",
      body: "If the reason for entering disappears, the trade should disappear too."
    },

    {
      type: "list",
      items: [
        "Momentum fades",
        "Order flow flips against you",
        "Key level rejection",
        "Unexpected news or volatility"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Cutting Early",
      body:
        "You enter long on a breakout.\n" +
        "Breakout fails → sellers take control.\n" +
        "Cut early to avoid full stop loss."
    },

    {
      type: "quiz",
      question: "When should you cut early?",
      options: ["When momentum dies", "When you're bored", "When you want revenge", "When you feel lucky"],
      answer: 0
    }
  ]
};
