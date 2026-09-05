export default {
  id: "recovery-math-losses-compound",
  module: "risk-management",
  moduleLabel: "RISK MANAGEMENT",
  order: 6,
  title: "Recovery Math — Losses Compound",
  duration: "7 min",
  level: "Intermediate",

  content: [
    {
      type: "text",
      body:
        "Losses compound quickly. A small drawdown is easy to recover from, but large drawdowns require exponentially larger gains."
    },

    {
      type: "heading",
      body: "Understanding Recovery Math"
    },
    {
      type: "callout",
      variant: "key",
      body: "A 20% loss requires a 25% gain to recover. A 50% loss requires a 100% gain."
    },

    {
      type: "list",
      items: [
        "Small losses are easy to recover",
        "Large losses require massive gains",
        "Risk management prevents deep drawdowns",
        "Consistency beats hero trades"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Drawdown Recovery",
      body:
        "Account: $10,000.\n" +
        "Lose 50% → now $5,000.\n" +
        "You need a 100% gain just to get back to $10,000."
    },

    {
      type: "quiz",
      question: "A 50% loss requires what gain to recover?",
      options: ["50%", "75%", "100%", "150%"],
      answer: 2
    }
  ]
};
