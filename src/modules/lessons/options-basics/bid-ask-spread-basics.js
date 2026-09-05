export default {
  id: "bid-ask-spread-basics",
  module: "options-basics",
  moduleLabel: "OPTIONS BASICS",
  order: 7,
  title: "Bid–Ask Spread Basics",
  duration: "5 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body: "The bid–ask spread is the difference between what buyers are willing to pay (bid) and what sellers are asking (ask). Tight spreads save you money; wide spreads cost you money."
    },

    {
      type: "heading",
      body: "Bid Price"
    },
    {
      type: "text",
      body: "The bid is the highest price a buyer is willing to pay for the option."
    },

    {
      type: "heading",
      body: "Ask Price"
    },
    {
      type: "text",
      body: "The ask is the lowest price a seller is willing to accept."
    },

    {
      type: "table",
      headers: ["Term", "Meaning"],
      rows: [
        ["Bid", "Buyers' maximum price"],
        ["Ask", "Sellers' minimum price"],
        ["Spread", "Difference between bid and ask"]
      ]
    },

    {
      type: "callout",
      variant: "tip",
      body: "Always use limit orders. Market orders can fill at the worst possible price when spreads are wide."
    },

    {
      type: "example",
      label: "EXAMPLE",
      body:
        "Bid: $2.00\nAsk: $2.20\nSpread: $0.20\n\nIf you buy at the ask ($2.20), you're instantly down $0.20 because you could only sell at the bid ($2.00)."
    },

    {
      type: "quiz",
      question: "Bid is $1.50 and ask is $1.80. What is the spread?",
      options: [
        "$0.30",
        "$1.50",
        "$1.80",
        "$0.15"
      ],
      answer: 0
    }
  ]
};
