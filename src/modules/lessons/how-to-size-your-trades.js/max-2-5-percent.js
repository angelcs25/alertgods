export default {
  id: "options-max-2-5-percent",
  module: "position-sizing",
  moduleLabel: "POSITION SIZING",
  order: 4,
  title: "Options: Max 2–5% of Account",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Options can lose 100% of their premium, so position size must stay small. Most traders risk 2–5% of their account per option trade."
    },

    {
      type: "heading",
      body: "Why Small Size Matters"
    },
    {
      type: "callout",
      variant: "key",
      body: "Options can go to zero — keep size small to protect your account."
    },

    {
      type: "list",
      items: [
        "2–5% risk per trade",
        "Avoid oversized option positions",
        "Theta and IV crush increase risk",
        "Small size prevents blowups"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Option Sizing",
      body:
        "Account: $10,000.\n" +
        "Max option position: $200–$500.\n" +
        "Keeps risk controlled even during volatility."
    },

    {
      type: "quiz",
      question: "What is a common max size for options?",
      options: ["20%", "10%", "2–5%", "50%"],
      answer: 2
    }
  ]
};
