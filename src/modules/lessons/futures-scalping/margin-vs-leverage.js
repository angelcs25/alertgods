export default {
  id: "margin-and-leverage-explained",
  module: "futures-basics",
  moduleLabel: "FUTURES BASICS",
  order: 4,
  title: "Margin & Leverage Explained",
  duration: "7 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Futures use margin, not full cash value. This creates leverage, allowing small accounts to control large positions."
    },

    {
      type: "heading",
      body: "How Margin Works"
    },
    {
      type: "callout",
      variant: "key",
      body: "Margin is a performance bond — not a cost."
    },

    {
      type: "list",
      items: [
        "You only deposit a fraction of the contract value",
        "Leverage amplifies gains and losses",
        "Margin varies by broker and volatility",
        "Risk management is essential"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Leverage",
      body:
        "You trade /ES with $1,000 margin.\n" +
        "A 10-point move = $500.\n" +
        "You controlled $250,000 of market value with $1,000."
    },

    {
      type: "quiz",
      question: "What does margin represent?",
      options: ["A fee", "A tax", "A performance bond", "A subscription"],
      answer: 2
    }
  ]
};
