export default {
  id: "strike-selection-0dte",
  module: "0dte-trading",
  moduleLabel: "0–5DTE TRADING",
  order: 4,
  title: "Strike Selection for 0DTE",
  duration: "8 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Choosing the right strike is critical. 0DTE options require strikes that balance probability and leverage."
    },

    {
      type: "heading",
      body: "How to Choose Strikes"
    },
    {
      type: "callout",
      variant: "key",
      body: "ATM or slightly ITM strikes offer the best balance of probability and movement."
    },

    {
      type: "list",
      items: [
        "ATM = fastest gamma, best movement",
        "ITM = higher probability, more expensive",
        "OTM = cheap but low probability",
        "Deep OTM = lottery tickets"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Strike Choice",
      body:
        "SPY at 500.\n" +
        "ATM call = 500.\n" +
        "Slight ITM = 499.\n" +
        "OTM = 502.\n" +
        "Choose ATM/ITM for directional trades."
    },

    {
      type: "quiz",
      question: "Which strike is best for consistent 0DTE trading?",
      options: ["Deep OTM", "Far OTM", "ATM or slight ITM", "Random strikes"],
      answer: 2
    }
  ]
};
