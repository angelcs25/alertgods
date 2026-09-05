export default {
  id: "sizing-by-confidence",
  module: "risk-management",
  moduleLabel: "RISK MANAGEMENT",
  order: 4,
  title: "Sizing by Confidence",
  duration: "7 min",
  level: "Intermediate",

  content: [
    {
      type: "text",
      body:
        "Position size should match your confidence level. High-quality setups deserve normal size. Lower-quality setups deserve reduced size."
    },

    {
      type: "heading",
      body: "Confidence-Based Sizing"
    },
    {
      type: "callout",
      variant: "key",
      body: "Increase size only when the setup is clear, tested, and high probability."
    },

    {
      type: "list",
      items: [
        "A+ setups = full size",
        "B setups = half size",
        "C setups = skip or micro size",
        "Never increase size out of emotion"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Confidence Sizing",
      body:
        "A+ setup: Trend + breakout + volume → full size.\n" +
        "B setup: Choppy but directional → half size.\n" +
        "C setup: Uncertain → skip."
    },

    {
      type: "quiz",
      question: "When should you use full size?",
      options: ["Random setups", "Emotional trades", "A+ setups", "Losing streaks"],
      answer: 2
    }
  ]
};
