export default {
  id: "nq-tick-value",
  module: "futures-basics",
  moduleLabel: "FUTURES BASICS",
  order: 3,
  title: "/NQ Tick Value ($5.00)",
  duration: "5 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "/NQ (Nasdaq futures) moves in ticks worth $5.00 each. /NQ is faster and more volatile than /ES."
    },

    {
      type: "heading",
      body: "Understanding Tick Value"
    },
    {
      type: "callout",
      variant: "key",
      body: "1 tick = 0.25 points = $5.00."
    },

    {
      type: "list",
      items: [
        "4 ticks = 1 point = $20",
        "10 points = $200 per contract",
        "Higher volatility than /ES",
        "Tick value determines risk per trade"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — /NQ Move",
      body:
        "/NQ moves 20 points.\n" +
        "20 × $20 = $400 gain or loss per contract."
    },

    {
      type: "quiz",
      question: "How much is 1 tick worth on /NQ?",
      options: ["$2.50", "$5.00", "$10.00", "$12.50"],
      answer: 1
    }
  ]
};
