export default {
  id: "es-tick-value",
  module: "futures-basics",
  moduleLabel: "FUTURES BASICS",
  order: 2,
  title: "/ES Tick Value ($12.50)",
  duration: "5 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "/ES (S&P 500 futures) moves in ticks. Each tick is worth $12.50, and each point is worth $50."
    },

    {
      type: "heading",
      body: "Understanding Tick Value"
    },
    {
      type: "callout",
      variant: "key",
      body: "1 tick = 0.25 points = $12.50."
    },

    {
      type: "list",
      items: [
        "4 ticks = 1 point = $50",
        "10 points = $500 per contract",
        "Small moves create large P/L swings",
        "Tick value determines risk per trade"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — /ES Move",
      body:
        "/ES moves 5 points.\n" +
        "5 × $50 = $250 gain or loss per contract."
    },

    {
      type: "quiz",
      question: "How much is 1 tick worth on /ES?",
      options: ["$5", "$10", "$12.50", "$25"],
      answer: 2
    }
  ]
};
