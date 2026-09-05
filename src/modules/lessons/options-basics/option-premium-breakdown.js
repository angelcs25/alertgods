export default {
  id: "option-premium-breakdown",
  module: "options-basics",
  moduleLabel: "OPTIONS BASICS",
  order: 5,
  title: "Option Premium Breakdown",
  duration: "7 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body: "The price you pay for an option is called the premium. This premium is made of two parts: intrinsic value and extrinsic value."
    },

    {
      type: "heading",
      body: "Intrinsic Value"
    },
    {
      type: "callout",
      variant: "key",
      body: "Intrinsic value is the amount the option is already worth right now."
    },
    {
      type: "list",
      items: [
        "ITM options have intrinsic value",
        "OTM options have zero intrinsic value",
        "Intrinsic value = difference between stock price and strike"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE",
      body:
        "AAPL is at $190.\n" +
        "AAPL 180 CALL → intrinsic value = $10.\n" +
        "AAPL 200 CALL → intrinsic value = $0 (OTM)."
    },

    {
      type: "heading",
      body: "Extrinsic Value"
    },
    {
      type: "text",
      body: "Extrinsic value is everything else: time, volatility, demand, and probability of finishing ITM."
    },
    {
      type: "list",
      items: [
        "More time = more extrinsic value",
        "Higher volatility = more extrinsic value",
        "ATM options have the most extrinsic value"
      ]
    },

    {
      type: "table",
      headers: ["Component", "Meaning", "Influenced By"],
      rows: [
        ["Intrinsic", "Value right now", "Stock price vs strike"],
        ["Extrinsic", "Potential future value", "Time, volatility, demand"]
      ]
    },

    {
      type: "quiz",
      question: "AAPL is at $190. AAPL 200 CALL costs $3.00. How much intrinsic value does it have?",
      options: [
        "$3.00",
        "$10.00",
        "$0.00",
        "$190.00"
      ],
      answer: 2
    }
  ]
};
