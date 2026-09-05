export default {
  id: "power-hour-plays-0dte",
  module: "0dte-trading",
  moduleLabel: "0–5DTE TRADING",
  order: 8,
  title: "Power Hour Plays",
  duration: "7 min",
  level: "Intermediate",

  content: [
    {
      type: "text",
      body:
        "Power hour (3–4 PM ET) often brings strong directional moves as institutions position for the close."
    },

    {
      type: "heading",
      body: "Why Power Hour Works"
    },
    {
      type: "callout",
      variant: "key",
      body: "Volume returns late in the day — perfect for 0DTE momentum trades."
    },

    {
      type: "list",
      items: [
        "End-of-day volatility spikes",
        "Breakouts from mid-day consolidation",
        "Institutional repositioning",
        "Clearer trend direction"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Power Hour Trend",
      body:
        "SPY trends all day.\n" +
        "3 PM volume spikes.\n" +
        "0DTE contracts expand rapidly."
    },

    {
      type: "quiz",
      question: "What time is power hour?",
      options: ["9–10 AM", "11–12 PM", "1–2 PM", "3–4 PM"],
      answer: 3
    }
  ]
};
