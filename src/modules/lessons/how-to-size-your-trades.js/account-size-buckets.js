export default {
  id: "account-size-buckets",
  module: "position-sizing",
  moduleLabel: "POSITION SIZING",
  order: 1,
  title: "Account Size Buckets",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Position sizing begins with knowing your account size bucket. Different account sizes require different risk rules and contract sizing."
    },

    {
      type: "heading",
      body: "Why Buckets Matter"
    },
    {
      type: "callout",
      variant: "key",
      body: "Sizing rules change depending on account size — not all traders can use the same risk."
    },

    {
      type: "list",
      items: [
        "$1K–$5K → micro contracts only",
        "$5K–$15K → small futures or conservative options",
        "$15K–$50K → standard futures with strict risk",
        "$50K+ → flexible sizing with scaling"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Bucket Sizing",
      body:
        "Account: $8,000.\n" +
        "Bucket: $5K–$15K.\n" +
        "Sizing: 1–2 micro futures or small option positions."
    },

    {
      type: "quiz",
      question: "Which bucket fits a $4,000 account?",
      options: ["$1K–$5K", "$5K–$15K", "$15K–$50K", "$50K+"],
      answer: 0
    }
  ]
};
