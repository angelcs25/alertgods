export default {
  id: "target-setting-with-gamma",
  module: "0dte-trading",
  moduleLabel: "0–5DTE TRADING",
  order: 6,
  title: "Target-Setting With Gamma",
  duration: "7 min",
  level: "Intermediate",

  content: [
    {
      type: "text",
      body:
        "Gamma determines how quickly delta increases as price moves. This helps set realistic profit targets for 0DTE trades."
    },

    {
      type: "heading",
      body: "Using Gamma for Targets"
    },
    {
      type: "callout",
      variant: "key",
      body: "High gamma means small price moves can hit your profit targets quickly."
    },

    {
      type: "list",
      items: [
        "ATM options have fastest gamma",
        "Targets should be based on expected price movement",
        "Gamma helps estimate contract expansion",
        "Use nearby levels for realistic exits"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Gamma Target",
      body:
        "Delta = 0.50, gamma = 0.20.\n" +
        "$1 move → delta becomes 0.70.\n" +
        "Contract expands fast → take profits at key levels."
    },

    {
      type: "quiz",
      question: "Which options have the fastest gamma?",
      options: ["Deep ITM", "Deep OTM", "ATM", "Far-dated LEAPS"],
      answer: 2
    }
  ]
};
