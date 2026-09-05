export default {
  id: "stop-loss-discipline-0dte",
  module: "0dte-trading",
  moduleLabel: "0–5DTE TRADING",
  order: 5,
  title: "Stop Loss Discipline",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "0DTE options move fast. Without strict stop losses, small mistakes become large losses."
    },

    {
      type: "heading",
      body: "Why Stops Matter"
    },
    {
      type: "callout",
      variant: "key",
      body: "0DTE requires mechanical stop losses — not emotional ones."
    },

    {
      type: "list",
      items: [
        "Contracts can go to zero quickly",
        "Gamma accelerates losses",
        "Theta punishes hesitation",
        "Stops protect your account"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Stop Loss Discipline",
      body:
        "You enter a 0DTE call at $1.00.\n" +
        "Stop loss at $0.60.\n" +
        "Price pulls back → exit.\n" +
        "Avoids full premium loss."
    },

    {
      type: "quiz",
      question: "What is the biggest danger of skipping stop losses?",
      options: ["Missing a win", "Paying commissions", "Full premium loss", "Getting bored"],
      answer: 2
    }
  ]
};
