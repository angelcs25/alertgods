export default {
  id: "volatility-adjusted-sizing",
  module: "position-sizing",
  moduleLabel: "POSITION SIZING",
  order: 3,
  title: "Volatility-Adjusted Sizing",
  duration: "8 min",
  level: "Intermediate",

  content: [
    {
      type: "text",
      body:
        "Volatility-adjusted sizing means reducing or increasing position size based on market volatility. High volatility requires smaller size to control risk."
    },

    {
      type: "heading",
      body: "Why Adjust for Volatility?"
    },
    {
      type: "callout",
      variant: "key",
      body: "Higher volatility = smaller size. Lower volatility = normal size."
    },

    {
      type: "list",
      items: [
        "ATR helps measure volatility",
        "High VIX → reduce size",
        "Large candles → reduce size",
        "Stable trends → normal size"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Adjusting Size",
      body:
        "Normal risk: $200.\n" +
        "High volatility day → cut size in half.\n" +
        "Risk becomes $100 until volatility normalizes."
    },

    {
      type: "quiz",
      question: "What should you do during high volatility?",
      options: ["Increase size", "Keep size the same", "Reduce size", "Trade without stops"],
      answer: 2
    }
  ]
};
