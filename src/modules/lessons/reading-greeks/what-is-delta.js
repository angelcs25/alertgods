export default {
    id: "what-is-delta",
    module: "reading-greeks",
    moduleLabel: "READING GREEKS",
    order: 1,
    title: "Delta — Your Directional Exposure",
    duration: "7 min",
    level: "Intermediate",
    content: [
      {
        type: "text",
        body: "Delta is the most important greek. It tells you how much your option's price will change for every $1 move in the underlying stock. If you understand one greek, make it this one.",
      },
      {
        type: "callout",
        variant: "key",
        body: "Delta measures directional exposure. A 0.50 delta call gains approximately $0.50 for every $1 the stock moves up — and loses $0.50 for every $1 it moves down.",
      },
      {
        type: "heading",
        body: "Delta ranges",
      },
      {
        type: "table",
        headers: ["Delta range", "What it means", "Option status"],
        rows: [
          ["0.70 – 1.00", "Moves almost like the stock", "Deep in the money (ITM)"],
          ["0.45 – 0.55", "At-the-money — most responsive to direction", "At the money (ATM)"],
          ["0.20 – 0.40", "Cheaper, leveraged, but needs bigger move", "Out of the money (OTM)"],
          ["0.05 – 0.15", "Lottery tickets — rarely pay off", "Far OTM"],
        ],
      },
      {
        type: "heading",
        body: "Calls vs Puts",
      },
      {
        type: "list",
        items: [
          "Call deltas are positive (0 to +1.00) — profit when stock goes up",
          "Put deltas are negative (0 to −1.00) — profit when stock goes down",
          "A −0.50 delta put gains $0.50 when stock drops $1",
        ],
      },
      {
        type: "heading",
        body: "How we use delta in signals",
      },
      {
        type: "text",
        body: "When you see a signal from us, the strike we choose reflects a deliberate delta decision. Here's the logic:",
      },
      {
        type: "list",
        items: [
          "Strong directional conviction → higher delta (0.50–0.65) — more expensive but tracks the move better",
          "Momentum play with tight stop → medium delta (0.35–0.50) — balanced cost vs leverage",
          "0DTE scalp targeting a quick spike → ATM (0.45–0.55) — maximum gamma sensitivity",
          "Lower confidence setup → lower delta (0.25–0.35) — cheap risk, defined loss",
        ],
      },
      {
        type: "example",
        label: "EXAMPLE",
        body: "Signal: SPY BUY CALL 480C @ 3.20 | 0DTE | 88% conf\n\nThe 480C strike has ~0.52 delta. SPY is at $481.\n\nSPY moves up $2 → your option gains ~$1.04 (0.52 × 2)\nNew value: $3.20 + $1.04 = $4.24 (+32%)\n\nSPY drops $2 → your option loses ~$1.04\nNew value: $3.20 − $1.04 = $2.16 (−32%)\n\nThis is why stop discipline matters — the same leverage that creates gains destroys you fast.",
      },
      {
        type: "callout",
        variant: "tip",
        body: "Delta also equals the approximate probability the option expires in the money. A 0.30 delta option has roughly a 30% chance of being worth anything at expiration. A 0.50 delta has roughly a 50% chance.",
      },
      {
        type: "heading",
        body: "Delta changes as price moves — that's Gamma",
      },
      {
        type: "text",
        body: "Delta isn't fixed. As SPY moves toward your strike, delta increases. As it moves away, delta decreases. The rate of that change is called Gamma — covered in the next lesson.",
      },
      {
        type: "quiz",
        question: "You hold a SPY PUT with a delta of −0.40. SPY drops $3. Approximately how much does your option gain?",
        options: [
          "$0.40",
          "$1.20",
          "$3.00",
          "$0.13",
        ],
        answer: 1,
      },
    ],
  };
 
