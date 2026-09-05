export default {
  id: "position-sizing-rules-0dte",
  module: "0dte-trading",
  moduleLabel: "0–5DTE TRADING",
  order: 10,
  title: "Position Sizing Rules",
  duration: "7 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Position sizing protects your account from the volatility of 0DTE. Small size prevents large emotional and financial damage."
    },

    {
      type: "heading",
      body: "Sizing Guidelines"
    },
    {
      type: "callout",
      variant: "key",
      body: "0DTE should always be traded with small, controlled size."
    },

    {
      type: "list",
      items: [
        "Risk a fixed dollar amount per trade",
        "Avoid scaling in during chop",
        "Use smaller size during news days",
        "Never risk more than you can lose"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Proper Sizing",
      body:
        "Account: $10,000.\n" +
        "Risk per 0DTE trade: $100–$150.\n" +
        "Keeps losses manageable even on bad days."
    },

    {
      type: "quiz",
      question: "What is the safest sizing approach?",
      options: [
        "Go all-in",
        "Risk a fixed small amount",
        "Double down on losses",
        "Trade maximum size"
      ],
      answer: 1
    }
  ]
};
