export default {
  id: "choosing-the-right-delta",
  module: "options-basics",
  moduleLabel: "OPTIONS BASICS",
  order: 5,
  title: "Choosing the Right Delta",
  duration: "8 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Delta determines how directional your option is. Higher delta means higher probability and smoother movement. Lower delta means cheaper contracts but lower probability."
    },

    {
      type: "heading",
      body: "Delta Ranges & Their Meaning"
    },
    {
      type: "callout",
      variant: "key",
      body: "Delta is your risk dial — it controls probability, leverage, and behavior."
    },

    {
      type: "list",
      items: [
        "0.10–0.20 → cheap lottery tickets",
        "0.30–0.40 → balanced risk/reward",
        "0.50 → at-the-money, fastest gamma",
        "0.60–0.70 → deep ITM, behaves like stock"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Choosing Delta",
      body:
        "If you want high probability, choose 0.60+ delta.\n" +
        "If you want leverage, choose 0.50 delta.\n" +
        "If you want cheap exposure, choose 0.20 delta."
    },

    {
      type: "heading",
      body: "How to Choose the Right Delta"
    },
    {
      type: "list",
      items: [
        "Higher delta = higher probability, higher cost",
        "Lower delta = lower probability, higher leverage",
        "ATM delta (0.50) moves fastest due to gamma",
        "Deep ITM delta (0.70+) is stable and predictable"
      ]
    },

    {
      type: "quiz",
      question: "Which delta gives the highest probability of profit?",
      options: [
        "0.15",
        "0.35",
        "0.50",
        "0.70"
      ],
      answer: 3
    }
  ]
};
