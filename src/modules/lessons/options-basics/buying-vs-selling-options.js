export default {
  id: "buying-vs-selling-options",
  module: "options-basics",
  moduleLabel: "OPTIONS BASICS",
  order: 3,
  title: "Buying vs Selling Options",
  duration: "7 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body: "Options give you choices — you can buy them or sell them. Buying options gives you defined risk and unlimited upside. Selling options gives you limited upside and potentially large risk. Understanding the difference is critical before trading."
    },

    {
      type: "heading",
      body: "Buying Options (Long Calls & Long Puts)"
    },
    {
      type: "callout",
      variant: "key",
      body: "When you BUY an option, your risk is limited to the premium you paid. Your upside can be very large."
    },
    {
      type: "list",
      items: [
        "Long CALL → bullish (profit when stock goes UP)",
        "Long PUT → bearish (profit when stock goes DOWN)",
        "Risk is capped at the premium paid",
        "High leverage — small moves can create big returns",
        "Time decay (theta) works against you"
      ]
    },
    {
      type: "example",
      label: "EXAMPLE — Buying a Call",
      body:
        "SPY is at $480.\n" +
        "You buy the SPY 482 CALL for $2.00 ($200 total).\n\n" +
        "SPY moves to $485 → your call is worth ~$5.00.\n" +
        "Profit: $500 − $200 = $300 (+150%).\n\n" +
        "If SPY stays below 482, your call expires worthless.\n" +
        "Max loss: $200."
    },

    {
      type: "heading",
      body: "Selling Options (Short Calls & Short Puts)"
    },
    {
      type: "callout",
      variant: "warning",
      body: "When you SELL an option, you collect premium — but you take on potentially large risk. Time decay works in your favor."
    },
    {
      type: "list",
      items: [
        "Short CALL → bearish/neutral (profit when stock stays BELOW strike)",
        "Short PUT → bullish/neutral (profit when stock stays ABOVE strike)",
        "You collect premium upfront",
        "Theta decay works FOR you",
        "Risk can be very large (especially naked calls)"
      ]
    },
    {
      type: "example",
      label: "EXAMPLE — Selling a Put",
      body:
        "AAPL is at $190.\n" +
        "You SELL the AAPL 185 PUT for $2.50 ($250 collected).\n\n" +
        "If AAPL stays above 185 → you keep the $250.\n" +
        "If AAPL drops to 180 → your loss is ~$5.00 ($500).\n\n" +
        "Max profit: $250.\n" +
        "Max loss: large (stock could fall much lower)."
    },

    {
      type: "heading",
      body: "Key Differences"
    },
    {
      type: "table",
      headers: ["Action", "Max Profit", "Max Loss", "Theta Effect"],
      rows: [
        ["Buying CALL/PUT", "Unlimited / large", "Premium paid", "Negative (hurts you)"],
        ["Selling CALL/PUT", "Premium collected", "Large / unlimited", "Positive (helps you)"]
      ]
    },

    {
      type: "heading",
      body: "When Traders Buy vs Sell"
    },
    {
      type: "list",
      items: [
        "Buy options when expecting a strong directional move",
        "Sell options when expecting slow movement or consolidation",
        "Buy options for defined risk",
        "Sell options for income (premium collection)",
        "Avoid selling naked calls — risk is unlimited"
      ]
    },

    {
      type: "quiz",
      question: "You SELL a SPY 480 PUT for $3.00. SPY closes at $475. What happens?",
      options: [
        "You keep the full $300",
        "You lose ~$500",
        "You automatically buy 100 shares at $475",
        "Your risk is capped at $300"
      ],
      answer: 1
    }
  ]
};
