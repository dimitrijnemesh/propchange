<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/logo-white.svg" />
    <img src="docs/brand/logo.svg" alt="PropChange" width="120" />
  </picture>
</p>

<h1 align="center">PropChange</h1>

<p align="center"><strong>Take a Seat. Copy. Earn.</strong> The Seat Market for copy trading on Solana.</p>

<p align="center">
  <a href="https://propchange.vercel.app"><img alt="Live app" src="https://img.shields.io/badge/live-propchange.vercel.app-3b63ff?style=flat-square" /></a>
  <img alt="Solana" src="https://img.shields.io/badge/Solana-devnet-14F195?style=flat-square&logo=solana&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Dev3pack" src="https://img.shields.io/badge/Dev3pack-Global%20Hackathon%202026-8b5cf6?style=flat-square" />
</p>

PropChange turns a trader's discipline into a tradable asset. Every strategy has a limited number of
**Seats**. A Seat lets you copy the strategy in your own exchange account under a **Seat Contract** — rules
taken from the trader's own history. The Seat fee is paid in USDC and held in escrow for the 30-day Epoch:
if the trader keeps the rules, they get paid; if they break them, copying stops and **your fee comes back**.

## Links

| | |
|---|---|
| Live app | https://propchange.vercel.app |
| Landing & waitlist | https://join-propchange.vercel.app |
| How it works | https://propchange.vercel.app/how-it-works |
| Fees | https://propchange.vercel.app/fees |
| Demo video | _coming with the Dev3pack submission_ |

<p align="center">
  <img src="docs/before-hackathon/mobile-01-landing.jpg" alt="Landing" width="190" />
  <img src="docs/before-hackathon/mobile-03-strategies-cards.jpg" alt="Strategies" width="190" />
  <img src="docs/before-hackathon/mobile-06-seat-trading.jpg" alt="Seat trading" width="190" />
  <img src="docs/before-hackathon/mobile-09-follower-dashboard.jpg" alt="Follower dashboard" width="190" />
</p>
<p align="center">
  <img src="docs/seat-market.jpg" alt="Seat market" width="400" />
  <img src="docs/seat-trading.jpg" alt="Seat trading on desktop" width="400" />
</p>

## Why

Copy trading ranks traders by past returns and lets unlimited followers pile in. Track records get
cherry-picked, late followers become exit liquidity, and when a trader blows up, the follower just loses —
nobody is accountable. PropChange makes the trader accountable: no rules kept, no pay.

## What it does

- **Limited Seats.** Each strategy has a measured capacity split into a fixed number of Seats. When they're gone,
  you join the waitlist or buy a Seat from a current holder.
- **Seat Contract.** Before every Epoch, limits are derived from the strategy's own history: max drawdown, daily
  loss, leverage, single position size, allowed instruments, minimum activity.
- **Escrow and refund.** The Seat fee (USDC) sits in an Epoch escrow. Kept → 75% to the trader, 25% to
  PropChange. Broken → copying stops and Seat holders are refunded.
- **Seat = token.** One Seat is one SPL token (Token-2022 design). New Seats are minted on a bonding curve;
  existing Seats trade on an order book, with a 2% platform fee on resales.
- **Your money stays with you.** Trades are copied into your own Binance, Bybit or MT5 account through a
  trade-only key; keys with withdrawal permission are rejected.
- **Analytics a trader can't fake.** Time-weighted returns, equity curve, drawdown, daily P&L calendar,
  monthly returns, risk flags and the full contract history (kept / breached) per Epoch.
- **Follower and trader areas.** Active Seats, escrow, refunds and Risk Engine activity for followers;
  earnings, upcoming settlements and contract health for traders.
- **Also:** Phantom wallet connect, light / dark theme, 13 languages, prices in USD / EUR / UAH.

## How a Seat works

```mermaid
flowchart LR
  F["Follower"] -- "buys Seat · USDC" --> E[("Epoch escrow<br/>on Solana")]
  F -. "Seat = SPL token" .-> M["Seat market<br/>mint · buy · sell"]
  E -- "rules kept" --> T["Trader 75% · PropChange 25%"]
  E -- "rules broken" --> R["Refund to Seat holders"]
  X["Follower's exchange account"] <-- "trade-only key" --> K["Copy engine + Risk Engine"]
```

## Status

| Part | State |
|---|---|
| Web app — landing, market, analytics, trading screen, follower & trader areas | ✅ Live at [propchange.vercel.app](https://propchange.vercel.app) |
| Data | Demo data from a deterministic mock layer (`prototype/lib/mock-api.ts`) — no real money |
| Wallet | Phantom connect; falls back to a demo wallet when Phantom isn't installed |
| Solana program — Seat mint, USDC escrow, settle / refund | 🛠 Building on devnet during Dev3pack |

## Repository map

| Folder | What it is | Stack | Docs |
|---|---|---|---|
| [`prototype`](prototype) | **Main web app**, deployed to propchange.vercel.app | Next.js 16, React 19, TypeScript, Tailwind 4, Radix UI | [README](prototype/README.md) |
| [`landing`](landing) | Waitlist landing with feedback forms | Next.js, TypeScript, Google Apps Script | [README](landing/README.md) |
| [`redesign`](redesign) | Earlier single-page Seats exploration, kept for reference | Next.js, TypeScript | — |
| [`docs`](docs) | Screenshots, brand assets, before-hackathon record | Markdown, images | [before-hackathon](docs/before-hackathon) |

## How to run it

### A. Just try it

Open https://propchange.vercel.app. Browsing needs no account; to trade a Seat, sign up (demo account) and
connect Phantom — or use the built-in demo wallet if Phantom isn't installed.

### B. Run the web app locally

Requirements: Node.js ≥ 20.9.

```bash
cd prototype
npm install
npm run dev          # http://localhost:3100
```

No environment variables are needed locally. Optional: `NEXT_PUBLIC_SITE_URL` (see `prototype/.env.example`)
for canonical URLs, the sitemap and social cards.

```bash
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

## Dev3pack Global Hackathon

PropChange is entered in the Dev3pack Global Hackathon (27–29 Nov 2026).

- **Built before:** everything up to the tag
  [`pre-dev3pack`](https://github.com/dimitrijnemesh/propchange/tree/pre-dev3pack) — screenshots in
  [`docs/before-hackathon`](docs/before-hackathon).
- **Built during:** every commit after the tag —
  [compare `pre-dev3pack...main`](https://github.com/dimitrijnemesh/propchange/compare/pre-dev3pack...main).

## Team

**Dimitrii Nemesh** — founder. Lost money copy trading, then built the product that would have prevented it.
