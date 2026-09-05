export default {
  id: "best-times-to-enter-0dte",
  module: "0dte-trading",
  moduleLabel: "0–5DTE TRADING",
  order: 3,
  title: "Best Times to Enter 0DTE",
  duration: "7 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Timing is everything with 0DTE. The best entries occur when volatility is high and direction is clear."
    },

    {
      type: "heading",
      body: "Optimal Entry Windows"
    },
    {
      type: "callout",
      variant: "key",
      body: "0DTE works best when momentum is strong — not during chop."
    },

    {
      type: "list",
      items: [
        "First 30–60 minutes of market open",
        "Breakouts from consolidation",
        "Retests of key levels",
        "Power hour (last hour of trading)"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Good Entry",
      body:
        "SPY breaks above premarket high with strong volume.\n" +
        "Momentum is clear → 0DTE call has edge."
    },

    {
      type: "quiz",
      question: "Which time window is usually best for 0DTE?",
      options: ["Mid-day", "Market open", "Lunch hour", "Overnight"],
      answer: 1
    }
  ]
};
