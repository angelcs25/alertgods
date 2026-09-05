export default {
  id: "hard-stop-vs-mental-stop",
  module: "risk-management",
  moduleLabel: "RISK MANAGEMENT",
  order: 3,
  title: "Hard Stop vs Mental Stop",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Stops protect your account. A hard stop is placed on the chart, while a mental stop is a level you exit manually. Each has advantages and risks."
    },

    {
      type: "heading",
      body: "Choosing the Right Stop Type"
    },
    {
      type: "callout",
      variant: "key",
      body: "Hard stops enforce discipline. Mental stops require discipline."
    },

    {
      type: "list",
      items: [
        "Hard stops prevent emotional hesitation",
        "Mental stops allow flexibility in fast markets",
        "Hard stops protect against catastrophic losses",
        "Mental stops require strong discipline"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Hard Stop",
      body:
        "You place a stop at -$150.\n" +
        "Price hits your level → auto exit.\n" +
        "No hesitation, no emotional override."
    },

    {
      type: "quiz",
      question: "Which stop type enforces discipline automatically?",
      options: ["Mental stop", "Hard stop", "Trailing stop", "No stop"],
      answer: 1
    }
  ]
};
