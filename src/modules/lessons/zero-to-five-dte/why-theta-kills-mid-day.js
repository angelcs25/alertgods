export default {
  id: "why-theta-kills-midday",
  module: "0dte-trading",
  moduleLabel: "0–5DTE TRADING",
  order: 2,
  title: "Why Theta Kills Mid-Day",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Theta accelerates as expiration approaches, and it is strongest during mid-day when volatility drops and price often consolidates."
    },

    {
      type: "heading",
      body: "Mid-Day Time Decay"
    },
    {
      type: "callout",
      variant: "key",
      body: "Mid-day chop + low volatility = maximum theta burn."
    },

    {
      type: "list",
      items: [
        "Volatility drops after the morning rush",
        "Price often consolidates mid-day",
        "Theta accelerates every hour",
        "Premium evaporates without movement"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Mid-Day Decay",
      body:
        "You buy a 0DTE call at 11:30 AM for $1.20.\n" +
        "By 1:00 PM, price hasn’t moved.\n" +
        "Your contract is now worth $0.40 — even though you weren’t wrong."
    },

    {
      type: "quiz",
      question: "When is theta strongest?",
      options: ["Market open", "Mid-day", "Power hour", "Overnight"],
      answer: 1
    }
  ]
};
