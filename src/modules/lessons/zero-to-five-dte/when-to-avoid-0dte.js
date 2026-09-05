export default {
  id: "when-to-avoid-0dte",
  module: "0dte-trading",
  moduleLabel: "0–5DTE TRADING",
  order: 9,
  title: "When to Avoid 0DTE",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Not every day is a good day for 0DTE. Avoid trading when conditions reduce your edge."
    },

    {
      type: "heading",
      body: "Bad Conditions for 0DTE"
    },
    {
      type: "callout",
      variant: "key",
      body: "Avoid 0DTE during chop, low volume, or uncertainty."
    },

    {
      type: "list",
      items: [
        "Mid-day low volatility",
        "Inside days with no trend",
        "Major news events approaching",
        "Low volume holiday sessions"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Bad 0DTE Day",
      body:
        "SPY stays inside yesterday’s range.\n" +
        "No trend, no momentum.\n" +
        "Theta destroys premium."
    },

    {
      type: "quiz",
      question: "Which condition is worst for 0DTE?",
      options: ["High volume", "Strong trend", "Mid-day chop", "Breakout"],
      answer: 2
    }
  ]
};
