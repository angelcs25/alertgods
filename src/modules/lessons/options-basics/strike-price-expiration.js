export default {
  id: "strike-price-expiration",
  module: "options-basics",
  moduleLabel: "OPTIONS BASICS",
  order: 4,
  title: "Strike Price & Expiration",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body: "Every option contract has two defining components: the strike price and the expiration date. These determine when the option becomes profitable and how fast it loses value."
    },

    {
      type: "heading",
      body: "Strike Price"
    },
    {
      type: "callout",
      variant: "key",
      body: "The strike price is the price at which you have the right to buy (call) or sell (put) the underlying stock."
    },
    {
      type: "list",
      items: [
        "CALL → strike is the price you can BUY the stock",
        "PUT → strike is the price you can SELL the stock",
        "Strike determines ITM / ATM / OTM status",
        "Lower strike calls = more expensive; higher strike puts = more expensive"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE",
      body:
        "SPY is trading at $480.\n" +
        "• SPY 470 CALL → ITM\n" +
        "• SPY 480 CALL → ATM\n" +
        "• SPY 490 CALL → OTM"
    },

    {
      type: "heading",
      body: "Expiration"
    },
    {
      type: "text",
      body: "Expiration is the date the option contract ends. After this date, the contract ceases to exist. Shorter expirations decay faster; longer expirations decay slower."
    },
    {
      type: "list",
      items: [
        "0DTE → expires today (fastest decay)",
        "Weekly → expires Friday",
        "Monthly → third Friday of each month",
        "LEAPS → long-term options (months or years)"
      ]
    },

    {
      type: "callout",
      variant: "warning",
      body: "Time decay accelerates as expiration approaches. A 0DTE option can lose 50–90% of its value in minutes."
    },

    {
      type: "quiz",
      question: "SPY is at $480. Which strike is OTM for a CALL?",
      options: [
        "470",
        "480",
        "490",
        "475"
      ],
      answer: 2
    }
  ]
};
