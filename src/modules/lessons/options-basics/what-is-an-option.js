export default {
  id: "what-is-an-option",
  module: "options-basics",
  moduleLabel: "OPTIONS BASICS",
  order: 1,
  title: "What is an Option?",
  duration: "6 min",
  level: "Beginner",
  content: [
    {
      type: "text",
      body: "An option is a contract that gives you the right — but not the obligation — to buy or sell 100 shares of a stock at a specific price, on or before a specific date.",
    },
    {
      type: "callout",
      variant: "key",
      body: "Key word: right, not obligation. You can always choose to let an option expire worthless rather than exercise it. The most you can lose when buying an option is the premium you paid.",
    },
    {
      type: "heading",
      body: "The two types",
    },
    {
      type: "list",
      items: [
        "CALL option — the right to BUY 100 shares at the strike price. You profit when the stock goes UP.",
        "PUT option — the right to SELL 100 shares at the strike price. You profit when the stock goes DOWN.",
      ],
    },
    {
      type: "heading",
      body: "The three key terms",
    },
    {
      type: "table",
      headers: ["Term", "What it means", "Example"],
      rows: [
        ["Strike price", "The price you have the right to buy/sell at", "SPY $480 call — you can buy SPY at $480"],
        ["Expiration", "The date the contract expires", "0DTE = expires today, weekly = expires Friday"],
        ["Premium", "What you pay for the option contract", "$3.20 premium × 100 = $320 total cost"],
      ],
    },
    {
      type: "heading",
      body: "A real example",
    },
    {
      type: "example",
      label: "EXAMPLE",
      body: "SPY is trading at $481. You buy 1 SPY 480 CALL expiring today for $3.20.\n\nYou paid $320 (3.20 × 100 shares per contract).\n\nSPY rallies to $488. Your call is now worth ~$8.00.\nYou sell it: $800 − $320 cost = $480 profit (+150%).\n\nSPY drops to $475. Your call expires worthless.\nYou lose your $320 premium — that's it. No more.",
    },
    {
      type: "callout",
      variant: "tip",
      body: "Most option traders never exercise their contracts. They buy the option, it increases in value, and they sell it to close the position — just like a stock.",
    },
    {
      type: "heading",
      body: "Why options instead of stock?",
    },
    {
      type: "list",
      items: [
        "Leverage — control 100 shares for a fraction of the cost",
        "Defined risk — you can only lose what you paid",
        "Flexibility — profit in any direction (up, down, or sideways)",
        "Speed — short-dated options can double or triple in hours",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      body: "Leverage cuts both ways. A 0DTE option can go from $3.00 to $0 in an hour. The same leverage that creates 100%+ gains also creates 100% losses. Size accordingly.",
    },
    {
      type: "quiz",
      question: "You buy 1 SPY 480 CALL for $2.50. SPY closes at $479 at expiration. What happens?",
      options: [
        "You profit because SPY was close to $480",
        "The option expires worthless — you lose $250",
        "You automatically buy 100 shares of SPY at $479",
        "You can exercise it the next trading day",
      ],
      answer: 1,
    },
  ],
};