export default {
  id: "key-levels-vwap-vpoc",
  module: "futures-basics",
  moduleLabel: "FUTURES BASICS",
  order: 6,
  title: "Key Levels: VWAP, VPOC",
  duration: "7 min",
  level: "Intermediate",

  content: [
    {
      type: "text",
      body:
        "VWAP and VPOC are institutional levels used to identify value, balance, and high-volume zones."
    },

    {
      type: "heading",
      body: "Understanding VWAP & VPOC"
    },
    {
      type: "callout",
      variant: "key",
      body: "VWAP = fair value. VPOC = highest traded volume."
    },

    {
      type: "list",
      items: [
        "VWAP acts as dynamic support/resistance",
        "VPOC shows where institutions traded most",
        "Price often returns to VPOC",
        "VWAP reversion is a common strategy"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — VWAP Reaction",
      body:
        "Price drops to VWAP.\n" +
        "Buyers step in.\n" +
        "Bounce forms → scalp opportunity."
    },

    {
      type: "quiz",
      question: "Which level shows highest traded volume?",
      options: ["VWAP", "VPOC", "EMA", "Pivot"],
      answer: 1
    }
  ]
};
