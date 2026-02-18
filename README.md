# Socratix AI — Positioning & ROI Analysis

Interactive competitive positioning and ROI model for [Socratix AI](https://getsocratix.ai) (YC S25) — AI coworkers for fraud and risk teams.

**[Live Demo →](https://your-vercel-url.vercel.app)**

## What This Is

A single-page React app with three sections:

- **How Socratix Wins** — competitive attribute matrix scoring 4 approaches (manual teams, rule engines, ML platforms, AI agents) across 6 buyer-evaluated dimensions. Includes counter-positioning analysis.
- **What It's Worth** — interactive ROI calculator. Plug in team size, salary, alert volume, false positive rate, and investigation time. Outputs annual savings, hours freed, and headcount equivalence.
- **What I'd Ship** — 30-day plan scoped for a founding team, plus author card.

## Run Locally

```bash
npm install
npm run dev
```

Opens at `localhost:5173`.

## Deploy to Vercel

Push to GitHub → import in Vercel. It auto-detects Vite.

Or via CLI:

```bash
npm install
npx vercel
```

No environment variables needed.

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Stack

React 18, Vite 5, zero external UI libraries. All styling is inline. Fonts loaded from Google Fonts (DM Sans, JetBrains Mono, Playfair Display).

## Context

Built by [Sidharth Sundaram](https://sidharthsundaram.com) as a positioning analysis exercise. Not affiliated with Socratix AI.
