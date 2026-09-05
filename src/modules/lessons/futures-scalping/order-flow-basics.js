export default {
  id: "order-flow-basics",
  module: "futures-basics",
  moduleLabel: "FUTURES BASICS",
  order: 7,
  title: "Order Flow Basics",
  duration: "8 min",
  level: "Intermediate",

  content: [
    {
      type: "text",
      body:
        "Order flow shows real-time buying and selling pressure. It reveals intent behind price movement."
    },

    {
      type: "heading",
      body: "Core Concepts"
    },
    {
      type: "callout",
      variant: "key",
      body: "Order flow = who is in control: buyers or sellers."
    },

    {
      type: "list",
      items: [
        "Delta shows buyer vs seller aggression",
        "Footprint charts show volume at each price",
        "Liquidity reveals hidden support/resistance",
        "Absorption shows institutions defending levels"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Buyer Aggression",
      body:
        "Delta spikes positive.\n" +
        "Large prints hit the ask.\n" +
        "Momentum shifts bullish."
    },

    {
      type: "quiz",
      question: "What does delta measure?",
      options: ["Time", "Volatility", "Buyer vs seller aggression", "Trend strength"],
      answer: 2
    }
  ]
};
