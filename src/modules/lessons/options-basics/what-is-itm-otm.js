export default {
  id: "what-is-itm-otm",
  module: "options-basics",
  moduleLabel: "OPTIONS BASICS",
  order: 2,
  title: "What is In / At / Out of the Money?",
  duration: "5 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body: "Every option contract has a relationship to the current stock price. This relationship determines whether the option is in the money (ITM), at the money (ATM), or out of the money (OTM). Understanding these terms is essential because they affect price, risk, and how the option behaves."
    },

    {
      type: "heading",
      body: "In the Money (ITM)"
    },
    {
      type: "callout",
      variant: "key",
      body: "An option is ITM when exercising it would give you immediate value."
    },
    {
      type: "list",
      items: [
        "CALL option is ITM when the stock price is ABOVE the strike price.",
        "PUT option is ITM when the stock price is BELOW the strike price."
      ]
    },
    {
      type: "example",
      label: "EXAMPLE",
      body:
        "AAPL is trading at $190.\n" +
        "• AAPL 180 CALL → ITM (you can buy at 180 and immediately own shares worth 190)\n" +
        "• AAPL 200 PUT → ITM (you can sell at 200 while the market is at 190)"
    },

    {
      type: "heading",
      body: "At the Money (ATM)"
    },
    {
      type: "text",
      body: "An option is ATM when the strike price is very close to the current stock price. ATM options have the highest gamma and react fastest to price movement."
    },
    {
      type: "example",
      label: "EXAMPLE",
      body: "SPY is trading at $480.\nSPY 480 CALL or SPY 480 PUT → ATM."
    },

    {
      type: "heading",
      body: "Out of the Money (OTM)"
    },
    {
      type: "callout",
      variant: "warning",
      body: "OTM options have no intrinsic value — they are pure speculation and expire worthless unless the stock moves in your favor."
    },
    {
      type: "list",
      items: [
        "CALL option is OTM when the stock price is BELOW the strike price.",
        "PUT option is OTM when the stock price is ABOVE the strike price."
      ]
    },
    {
      type: "example",
      label: "EXAMPLE",
      body:
        "TSLA is trading at $250.\n" +
        "• TSLA 270 CALL → OTM (needs TSLA to rise above 270)\n" +
        "• TSLA 230 PUT → OTM (needs TSLA to fall below 230)"
    },

    {
      type: "heading",
      body: "Intrinsic vs Extrinsic Value"
    },
    {
      type: "text",
      body: "ITM options have intrinsic value — the part of the option worth something right now. OTM options have only extrinsic value — time and volatility. ATM options have the highest extrinsic value."
    },

    {
      type: "table",
      headers: ["Status", "Intrinsic Value", "Extrinsic Value", "Risk Profile"],
      rows: [
        ["ITM", "High", "Lower", "More stable, less leverage"],
        ["ATM", "Medium", "High", "Fast-moving, balanced"],
        ["OTM", "None", "High", "Cheap but risky, can go to zero"]
      ]
    },

    {
      type: "quiz",
      question: "AAPL is trading at $190. Which option is OTM?",
      options: [
        "AAPL 180 CALL",
        "AAPL 190 PUT",
        "AAPL 200 CALL",
        "AAPL 185 CALL"
      ],
      answer: 2
    }
  ]
};