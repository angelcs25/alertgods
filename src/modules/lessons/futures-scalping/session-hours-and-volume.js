export default {
  id: "session-hours-and-volume",
  module: "futures-basics",
  moduleLabel: "FUTURES BASICS",
  order: 5,
  title: "Session Hours & Volume",
  duration: "6 min",
  level: "Beginner",

  content: [
    {
      type: "text",
      body:
        "Futures trade nearly 24 hours a day. Volume changes depending on the session, affecting volatility and opportunity."
    },

    {
      type: "heading",
      body: "Major Sessions"
    },
    {
      type: "callout",
      variant: "key",
      body: "U.S. session = highest volume and best opportunities."
    },

    {
      type: "list",
      items: [
        "Asia session: slow, low volume",
        "London session: moderate volume",
        "U.S. session: highest volume",
        "Market open and close = peak volatility"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Volume Behavior",
      body:
        "At 9:30 AM ET, volume spikes.\n" +
        "At mid-day, volume drops.\n" +
        "At 3 PM, volume returns."
    },

    {
      type: "quiz",
      question: "Which session has the most volume?",
      options: ["Asia", "London", "U.S.", "Overnight"],
      answer: 2
    }
  ]
};
