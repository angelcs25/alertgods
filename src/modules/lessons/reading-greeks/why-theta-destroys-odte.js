export default {
  id: "why-theta-destroys-0dte-buys",
  module: "options-greeks",
  moduleLabel: "OPTIONS GREEKS",
  order: 6,
  title: "Why Theta Destroys 0DTE Buys",
  duration: "8 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "0DTE options experience extreme theta decay. They lose value every minute, making them highly risky for buyers unless the underlying moves immediately."
    },

    {
      type: "heading",
      body: "What Makes 0DTE Dangerous"
    },
    {
      type: "callout",
      variant: "key",
      body: "0DTE buyers must get a fast, large, immediate move — or theta wipes out the trade."
    },

    {
      type: "list",
      items: [
        "Theta is highest on expiration day",
        "Premium evaporates every minute",
        "Even correct directional moves can be too slow",
        "Gamma is explosive, but theta is lethal"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — 0DTE Time Decay",
      body:
        "You buy a 0DTE call for $1.50 with theta = -0.40 per hour.\n\n" +
        "If price chops for 2 hours, you lose ≈ $0.80.\n" +
        "You weren’t wrong — you were too slow."
    },

    {
      type: "heading",
      body: "Why Theta Wins"
    },
    {
      type: "list",
      items: [
        "0DTE options require perfect timing",
        "Small pullbacks erase premium instantly",
        "You can be right but still lose money",
        "Theta accelerates as the clock approaches zero"
      ]
    },

    {
      type: "quiz",
      question: "0DTE buyers need what to succeed?",
      options: [
        "A slow grind upward",
        "A fast and immediate move",
        "High IV crush",
        "Deep ITM contracts"
      ],
      answer: 1
    }
  ]
};
