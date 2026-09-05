export default {
  id: "theta-time-decay-explained",
  module: "options-greeks",
  moduleLabel: "OPTIONS GREEKS",
  order: 3,
  title: "Theta — Time Decay Explained",
  duration: "7 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Theta measures how much an option loses in value as time passes. It represents the daily 'time decay' that eats away at an option’s premium."
    },

    {
      type: "heading",
      body: "What Theta Represents"
    },
    {
      type: "callout",
      variant: "key",
      body: "Theta tells you how much your option will lose per day — even if price doesn’t move."
    },

    {
      type: "list",
      items: [
        "Theta is always negative for option buyers",
        "Theta accelerates as expiration approaches",
        "At-the-money options have the highest theta",
        "Short-dated options decay much faster than long-dated"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Theta in Action",
      body:
        "You buy a call worth $4.00 with theta = -0.20.\n\n" +
        "If price doesn’t move, tomorrow your option is worth ≈ $3.80.\n" +
        "In 5 days, you lose about $1.00 purely from time decay."
    },

    {
      type: "heading",
      body: "Why Theta Matters"
    },
    {
      type: "list",
      items: [
        "Time decay works against buyers and for sellers",
        "Short-dated options lose value extremely fast",
        "You can be directionally right and still lose money"
      ]
    },

    {
      type: "quiz",
      question: "Which options have the highest theta decay?",
      options: [
        "Deep ITM",
        "Far-dated LEAPS",
        "At-the-money near expiration",
        "Deep OTM"
      ],
      answer: 2
    }
  ]
};
