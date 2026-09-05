export default {
  id: "portfolio-heat-rules",
  module: "risk-management",
  moduleLabel: "RISK MANAGEMENT",
  order: 2,
  title: "Portfolio Heat Rules",
  duration: "7 min",
  level: "Intermediate",

  content: [
    {
      type: "text",
      body:
        "Portfolio heat measures how much total risk you have across all open positions. Even if each trade risks 1–2%, stacking too many trades increases total exposure."
    },

    {
      type: "heading",
      body: "Managing Total Exposure"
    },
    {
      type: "callout",
      variant: "key",
      body: "Portfolio heat should stay under 5–6% total risk to avoid cascading losses."
    },

    {
      type: "list",
      items: [
        "Limit total open risk to 5–6%",
        "Avoid stacking correlated trades",
        "Reduce size during high volatility",
        "Track total exposure before entering new trades"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Portfolio Heat",
      body:
        "You risk 2% on each trade.\n" +
        "Three trades open → 6% total heat.\n" +
        "Adding a fourth trade would exceed safe limits."
    },

    {
      type: "quiz",
      question: "What is a safe total portfolio heat level?",
      options: ["1%", "20%", "5–6%", "15%"],
      answer: 2
    }
  ]
};
