export default {
  id: "scaling-in-and-out",
  module: "position-sizing",
  moduleLabel: "POSITION SIZING",
  order: 6,
  title: "Scaling In and Out",
  duration: "8 min",
  level: "Intermediate",

  content: [
    {
      type: "text",
      body:
        "Scaling allows you to enter or exit positions gradually. This reduces risk and improves trade management."
    },

    {
      type: "heading",
      body: "Why Scale?"
    },
    {
      type: "callout",
      variant: "key",
      body: "Scaling smooths out entries and exits — reducing emotional pressure."
    },

    {
      type: "list",
      items: [
        "Scale in during confirmation",
        "Scale out into strength",
        "Reduces risk on early entries",
        "Locks in profits gradually"
      ]
    },

    {
      type: "example",
      label: "EXAMPLE — Scaling Out",
      body:
        "You enter 2 contracts.\n" +
        "Take profit on 1 contract at first target.\n" +
        "Let the second contract run with a trailing stop."
    },

    {
      type: "quiz",
      question: "What is scaling used for?",
      options: ["Random entries", "Gambling", "Smoother entries/exits", "Avoiding stops"],
      answer: 2
    }
  ]
};
