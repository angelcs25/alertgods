export default {
  id: "futures-1-contract-per-10k",
  module: "position-sizing",
  moduleLabel: "POSITION SIZING",
  order: 5,
  title: "Futures: 1 Contract per $10K",
  duration: "7 min",
  level: "Intermediate",

  content: [
    {
      type: "text",
      body:
        "Futures are highly leveraged. A common rule is to trade 1 standard futures contract per $10,000 of account size."
    },

    {
      type: "heading",
      body: "Why This Rule Works"
    },
    {
      type: "callout",
      variant: "key",
      body: "1 contract per $10K keeps drawdowns manageable and prevents oversized losses."
    },

    {
      type: "list",
      items: [
        "Controls leverage exposure",
        "Prevents margin stress",
        "Keeps risk per trade reasonable",
        "Allows room for volatility"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Futures Sizing",
      body:
        "Account: $20,000.\n" +
        "Max size: 2 contracts.\n" +
        "If account drops to $15,000 → reduce to 1 contract."
    },

    {
      type: "quiz",
      question: "How many contracts for a $10K account?",
      options: ["3", "2", "1", "5"],
      answer: 2
    }
  ]
};
