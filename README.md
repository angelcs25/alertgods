# alertgods
Full-stack options and futures signal delivery platform built for retail traders.
AlertGods combine real-time AI-powered signal scanner, a subscriber-facing alert dashboard, an educational library, and automated payment(work in progress) + Discord onboarding.

Overview
AlertGods is a trading alert service that delivers futures and options signals (0–5 DTE focus) to subscribers via Discord and SMS. The platform includes:

AI scanner — autonomously scans a watchlist of tickers on a market-phase-aware schedule (5 min intervals during open/power hour, 15 min mid-day), fetches live options chains with Greeks via the Schwab API, and sends real market data to Claude to generate structured trade setups.

Admin signal composer — password-gated admin panel where the operator can compose signals manually or with AI assistance, review AI-generated suggestions before publishing, and monitor live price alerts.

Subscriber dashboard — real-time signal feed with live price tickers, confidence scores, and alert delivery status.

Education library — self-paced course system with 8 modules (Options Basics → Advanced Order Flow), interactive 
quizzes, and SVG chart illustrations — structured around a custom content schema with a central lesson registry.

Automated onboarding — Formspree form capture + Discord webhook admin notifications + Stripe Payment Link for $36/mo Pro subscriptions

****Tech Stack***
Frontend:

Technology:                Purpose:
React 18	                UI framework — functional components, hooks throughout
Vite	                    Build tool and dev server
React Hooks(useState, 
useEffect, useRef)	      State management, side effects, animations
Hash-based routing	      Custom client-side router (no React Router dependency)
CSS-in-JS (inline styles)	Component-scoped styling, dark trading terminal aesthetic
IntersectionObserver API	Scroll-triggered entrance animations

Backend / Scanner:

Technology:	              Purpose:
Node.js	                  Scanner runtime and API server
Express.js	              REST API serving signals and scanner status to the frontend
PM2                       Keeps scanner running, auto-restarts on crash, survives reboots
ES Modules	              Native import/export throughout the Node backend

AI & Market Data:

Technology:	                     Purpose:
Anthropic Claude API             Receives real market data (price, volume, options chain with Greeks)               (claude-sonnet-4-6)              and returns structured JSON trade setups
	             
Schwab Individual Trader API	   Real-time equity quotes, options chains with full Greeks (Δ, Γ, Θ, Vega, IV), and                                   WebSocket streaming. Will be used for futures data as well instead of Databento.

Payments & Delivery:

Technology:	                      Purpose:
Stripe	                          Recurring billing — $36/mo Pro subscriptions via Payment Links
Twilio	                          SMS signal delivery to Pro subscribers
Discord Webhooks	                Signal alerts to subscriber channels + admin notifications on new signups
Formspree	                        Form submission capture and email notifications

Deployment:
Technology:                      	Purpose:
Vercel	                          Frontend hosting — auto-deploys from GitHub, global CDN, free SSL
Railway	                          Node.js scanner hosting — always-on cloud process, $5/mo


Architecture: 
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vercel)                    │
│                                                             │
│  LandingPage → FreeSignup / ProSignup (Stripe)             │
│  AdminPanel (password-gated)                                │
│    ├── SignalComposer  (manual + AI-assisted)               │
│    ├── AIScanner       (autonomous, approval queue)         │
│    ├── AlertEngine     (price monitoring, Discord/SMS)      │
│    └── AlertSettings   (Schwab, Twilio, Discord config)    │
│  SubscriberDashboard   (live signal feed)                   │
│  LearnPage + LessonViewer  (education library)              │
└──────────────────────┬──────────────────────────────────────┘
                       │ polls every 10s
┌──────────────────────▼──────────────────────────────────────┐
│                    SCANNER BACKEND (Railway)                 │
│                                                             │
│  Express REST API  (/api/signals, /api/status, /api/scan)  │
│  Market phase detection  (PRE_MARKET → OPEN → MID →        │
│                            POWER_HOUR → CLOSED)            │
│  Schwab API  →  options chains + quotes                     │
│  Databento API  →  futures quotes                           │
│  Claude API  →  signal analysis  →  approve or skip        │
│  Discord Webhook  →  instant alert on signal               │
└─────────────────────────────────────────────────────────────┘
Key Features

Market-phase-aware scanning The scanner detects US market hours (ET timezone) and adjusts its interval dynamically — 5-minute scans during the market open (9:30–10:30 AM) and power hour (3–4 PM), 15-minute scans mid-day. Automatically pauses outside market hours.

AI signal generation with real data Claude receives a structured prompt containing the actual ticker price, OHLCV data, volume vs average, 52-week range, and the full 0–5 DTE options chain (strikes, premiums, bid/ask, IV, delta, gamma, theta, vega) before generating a signal. It returns a strict JSON schema or {"skip": true} with a reason. Signals are never auto-published — they go into an approval queue.

Custom content management for education The education library uses a data-driven content schema — lessons are plain JS objects with typed blocks (text, heading, callout, table, example, quiz, chart). A central registry (lessonRegistry.js) maps modules to their first lesson for routing. Adding a lesson is two lines: create the file, import it.

Zero-dependency routing Hash-based client-side routing implemented in ~20 lines using window.location.hash and a hashchange event listener. No React Router. /learn/what-is-an-option style routes handled with an if guard before the main switch.
>>>>>>> 6b045e5e418654adb57ecce31c240beef7c7a338
