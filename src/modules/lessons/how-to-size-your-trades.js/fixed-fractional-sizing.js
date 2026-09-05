export default {
  id: "fixed-fractional-sizing",
  module: "position-sizing",
  moduleLabel: "POSITION SIZING",
  order: 2,
  title: "Fixed Fractional Sizing",
  duration: "7 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Fixed fractional sizing means risking a fixed percentage of your account on every trade. This keeps risk consistent as your account grows or shrinks."
    },

    {
      type: "heading",
      body: "How It Works"
    },
    {
      type: "callout",
      variant: "key",
      body: "Risk the same percentage every trade — not the same dollar amount."
    },

    {
      type: "list",
      items: [
        "Common risk: 1–2% per trade",
        "Risk scales automatically with account size",
        "Prevents oversized losses",
        "Creates long-term consistency"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Fractional Sizing",
      body:
        "Account: $12,000.\n" +
        "Risk: 2% → $240 per trade.\n" +
        "If account grows to $15,000 → risk becomes $300."
    },

    {
      type: "quiz",
      question: "Fixed fractional sizing risks what?",
      options: ["A random amount", "A fixed dollar", "A fixed percentage", "No risk"],
      answer: 2
    }
  ]
};
