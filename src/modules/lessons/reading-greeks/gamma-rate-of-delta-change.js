export default {
  id: "gamma-rate-of-delta-change",
  module: "options-greeks",
  moduleLabel: "OPTIONS GREEKS",
  order: 2,
  title: "Gamma — Rate of Delta Change",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Gamma measures how quickly delta changes as the underlying price moves. High gamma means your delta reacts aggressively to even small price changes."
    },

    {
      type: "heading",
      body: "What Gamma Represents"
    },
    {
      type: "callout",
      variant: "key",
      body: "Gamma tells you how much your delta will change for each $1 move in the underlying."
    },

    {
      type: "list",
      items: [
        "High gamma = delta moves fast",
        "Gamma is highest for at-the-money options",
        "Gamma spikes near expiration (0DTE)",
        "High gamma = explosive P/L swings"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Gamma in Action",
      body:
        "You buy a call with delta = 0.30 and gamma = 0.15.\n\n" +
        "Underlying moves up $1 → delta becomes 0.45.\n" +
        "Another $1 move → delta becomes 0.60.\n\n" +
        "Your option starts behaving more and more like stock."
    },

    {
      type: "heading",
      body: "Why Gamma Matters"
    },
    {
      type: "list",
      items: [
        "High gamma increases both risk and reward",
        "Small price moves can create large P/L swings",
        "0DTE options have extreme gamma behavior"
      ]
    },

    {
      type: "quiz",
      question: "Gamma is highest for which type of option?",
      options: [
        "Deep ITM",
        "Deep OTM",
        "At-the-money",
        "Far-dated LEAPS"
      ],
      answer: 2
    }
  ]
};
