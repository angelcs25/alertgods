export default {
  id: "max-risk-per-trade",
  module: "risk-management",
  moduleLabel: "RISK MANAGEMENT",
  order: 1,
  title: "Max Risk Per Trade (1–2%)",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Risk management begins with defining how much you can lose on a single trade. Professional traders typically risk 1–2% of their account per trade."
    },

    {
      type: "heading",
      body: "Why Risk Limits Matter"
    },
    {
      type: "callout",
      variant: "key",
      body: "Small risk per trade prevents large drawdowns and keeps you in the game long-term."
    },

    {
      type: "list",
      items: [
        "1–2% risk keeps losses manageable",
        "Prevents emotional decision-making",
        "Allows multiple trades without blowing up",
        "Creates consistency and discipline"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Risk Calculation",
      body:
        "Account: $10,000.\n" +
        "2% risk = $200 max loss per trade.\n" +
        "If your stop is $50 per contract → you can trade 4 contracts."
    },

    {
      type: "quiz",
      question: "What is a common max risk per trade?",
      options: ["10%", "5%", "1–2%", "20%"],
      answer: 2
    }
  ]
};
