export default {
  id: "futures-vs-stocks-vs-options",
  module: "futures-basics",
  moduleLabel: "FUTURES BASICS",
  order: 1,
  title: "Futures vs Stocks vs Options",
  duration: "7 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Futures, stocks, and options behave differently. Futures offer leverage and 24-hour trading, stocks offer ownership, and options offer directional exposure with defined risk."
    },

    {
      type: "heading",
      body: "Key Differences"
    },
    {
      type: "callout",
      variant: "key",
      body: "Futures = leverage + speed. Stocks = ownership. Options = probability + decay."
    },

    {
      type: "list",
      items: [
        "Futures move fast and require discipline",
        "Stocks move slower and have no expiration",
        "Options decay over time and require timing",
        "Futures have fixed tick values and margin requirements"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Behavior Comparison",
      body:
        "SPY moves $1 → you gain $1 per share.\n" +
        "/ES moves 1 point → you gain $50.\n" +
        "Options move based on delta, gamma, and IV."
    },

    {
      type: "quiz",
      question: "Which instrument has time decay?",
      options: ["Stocks", "Futures", "Options", "Crypto"],
      answer: 2
    }
  ]
};
