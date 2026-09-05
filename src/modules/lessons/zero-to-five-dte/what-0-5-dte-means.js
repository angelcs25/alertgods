export default {
  id: "what-0-5dte-means",
  module: "0dte-trading",
  moduleLabel: "0–5DTE TRADING",
  order: 1,
  title: "What 0–5DTE Means",
  duration: "5 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "0–5DTE refers to options that expire within the next five days. These contracts behave differently from longer-dated options because gamma and theta accelerate rapidly as expiration approaches."
    },

    {
      type: "heading",
      body: "Why 0–5DTE Is Unique"
    },
    {
      type: "callout",
      variant: "key",
      body: "Short-dated options experience extreme gamma and theta — fast movement and fast decay."
    },

    {
      type: "list",
      items: [
        "0DTE = expires today",
        "1DTE = expires tomorrow",
        "2–5DTE = ultra-short-term options",
        "High gamma = fast delta changes",
        "High theta = rapid time decay"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Behavior of 0–5DTE",
      body:
        "A 0DTE call can double in minutes or go to zero in minutes.\n" +
        "A 5DTE call moves slower but still decays quickly."
    },

    {
      type: "quiz",
      question: "Which DTE has the fastest decay?",
      options: ["5DTE", "3DTE", "1DTE", "0DTE"],
      answer: 3
    }
  ]
};
