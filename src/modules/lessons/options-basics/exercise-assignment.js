export default {
  id: "exercise-assignment",
  module: "options-basics",
  moduleLabel: "OPTIONS BASICS",
  order: 6,
  title: "Exercise & Assignment",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body: "Exercise and assignment describe what happens when an option is used to buy or sell shares. Most traders never exercise options — they simply buy and sell the contracts."
    },

    {
      type: "heading",
      body: "Exercise (Buyer Action)"
    },
    {
      type: "callout",
      variant: "key",
      body: "Exercise happens when the BUYER of an option chooses to use their right to buy or sell shares."
    },
    {
      type: "list",
      items: [
        "CALL exercise → buy 100 shares at strike",
        "PUT exercise → sell 100 shares at strike",
        "Most retail traders do NOT exercise — they close the option instead"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE",
      body:
        "You own a SPY 480 CALL.\n" +
        "SPY is at $500.\n" +
        "If you exercise, you buy 100 shares at $480.\n" +
        "But most traders simply sell the option for profit."
    },

    {
      type: "heading",
      body: "Assignment (Seller Obligation)"
    },
    {
      type: "callout",
      variant: "warning",
      body: "Assignment happens when the SELLER of an option is forced to fulfill the contract."
    },
    {
      type: "list",
      items: [
        "Short CALL → must sell 100 shares at strike",
        "Short PUT → must buy 100 shares at strike",
        "Assignment risk increases as expiration approaches"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE",
      body:
        "You SOLD a TSLA 250 PUT.\n" +
        "TSLA closes at $240.\n" +
        "You are assigned → you must buy 100 shares at $250."
    },

    {
      type: "quiz",
      question: "Who can be assigned?",
      options: [
        "Option buyers",
        "Option sellers",
        "Both buyers and sellers",
        "Neither"
      ],
      answer: 1
    }
  ]
};
