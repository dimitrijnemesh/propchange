# PropChange — web app

Strategy marketplace with Seat Contracts: browse strategies, buy limited Seats, copy into your own exchange
account under an independent Risk Engine. Built from `FRONTEND_DESIGN.md` v1.0 and `PROJECT_CONTEXT.md` v2.0.

Data comes from a deterministic mock layer (`lib/mock-api.ts`), so there is no backend, wallet, payment or
API-key handling yet. Swapping in a real API only touches that file.

## Run locally

```bash
npm install
npm run dev         # http://localhost:3100
npm run typecheck   # tsc --noEmit
npm run build       # production build
npm start           # serve the production build
```

Requires Node ≥ 20.9.

## Deploy (Vercel)

1. Import the repository in Vercel.
2. **Root Directory: `prototype`** — the parent folder contains a separate Vite app with its own `vercel.json`
   (SPA rewrite to `/index.html`), which must not apply to this Next.js app.
3. Framework preset: Next.js (auto-detected). Build command `next build`, no output-directory override.
4. Optional env var `NEXT_PUBLIC_SITE_URL` (see `.env.example`) for canonical URLs, the sitemap and social cards.
   Without it, the Vercel production domain is used.

Production build specifics:

- Simulated API latency is development-only (no artificial delay in production).
- Security headers (nosniff, frame-options, referrer and permissions policy, HSTS) are set in `next.config.ts`;
  `X-Powered-By` is off.
- `robots.txt`, `sitemap.xml` (public pages, all listed strategies and traders), `manifest.webmanifest` and a
  generated social card (`app/opengraph-image.tsx`) are served from the App Router.
- Private areas (`/app`, `/trader`, `/settings`, `/onboarding`) are `noindex` and disallowed in `robots.txt`.
- Pages read the language cookie, so they render on demand; strategy and legal pages also have static params.

## Stack

Next.js 16 (App Router, Server Components), TypeScript strict, Tailwind CSS 4 with CSS-variable tokens, Radix
primitives, next-themes (dark default + switch), lucide-react, Recharts, TanStack Table, react-hook-form + zod,
cmdk. 13 interface languages (English default, Ukrainian, …) via the `pc_lang` cookie.

## Pages

| Area | Routes |
|---|---|
| Market | `/`, `/strategies` (period 24h–All, sort, filters, table/cards in the URL), `/strategies/[slug]?tab=overview\|analytics\|simulate\|contract\|capacity\|followers\|epochs`, `/traders/[handle]`, `/seats` (Seat Market), `/seats/[slug]` (Seat token trading: mint, buy/sell, order book) |
| Info | `/how-it-works`, `/fees`, `/faq`, `/glossary`, `/about`, `/community`, `/support`, `/status`, `/legal/[terms\|privacy\|risk]` |
| Auth | `/login`, `/signup` (Google, Apple, MetaMask, Phantom, WalletConnect, Coinbase, email or phone with country code), `/onboarding` |
| Follower | `/app`, `/app/seats`, `/app/risk`, `/app/connections`, `/app/wallet`, `/app/activity`, `/app/notifications`, `/app/referral` |
| Trader | `/trader`, `/trader/strategies`, `/trader/create`, `/trader/earnings`, `/trader/bond`, `/trader/followers` |
| Settings | `/settings` |

Phone sign-in excludes restricted jurisdictions; edit `RESTRICTED` in `lib/countries.ts` to change the policy.

## Data layer

- `mock/strategies.ts` (hand-written fixtures) + `mock/procedural.ts` (deterministic long tail): 142 strategies,
  72 traders. `mock/community.ts`: 1,200 followers and recent Seat activity.
- NAV series come from a seeded generator (`mock/nav.ts`) fitted to each strategy's target return and max
  drawdown, with a shared BTC factor so beta, correlation and capture ratios are meaningful. All metrics are
  computed from the series (`lib/series-stats.ts`, `lib/pro-stats.ts`), so numbers stay consistent and render
  identically on server and client.
- Reference strategy *ETH Swing · alex.k*: +38.4% / 12.0% max DD / Sharpe 1.84, 11/12 kept.

## Seat Market on Solana (mocked)

- Each strategy's current Epoch is one fungible **Seat token** (SPL Token-2022, 1 token = 1 Seat, supply = Capacity).
- New Seats are minted from a **bonding curve** that starts at the trader's price (`seatPrice()` in `lib/pricing.ts`);
  holders trade them on an **order book** with a 5% trader + 2% platform royalty.
- Client-safe math and types: `lib/seat-curve.ts`. Deterministic mock chain data (mint/escrow addresses, book,
  trades, chart): `mock/seat-chain.ts`. UI: `components/seat-market/*`.
- No program is deployed: addresses and signatures are mock values and are not linked to an explorer.
  A real integration replaces `mock/seat-chain.ts` with on-chain reads and adds the Solana wallet adapter.

## Notes

- **Naming:** "Seat Contract" is the trader's rule set (formerly "Risk Contract"); code identifiers such as
  `RiskContractCard` keep their original names.
- **Solana branding:** "Powered / Built / Settled on Solana" placements use one component
  (`components/common/solana-mark.tsx`). The mark shape is a placeholder — replace the mask SVG in `.sol-mark`
  (`app/globals.css`) with the official logomark from solana.com/branding before launch.
- **Social accounts:** X @propchange_io, Instagram @propchange.io — edit in `lib/site-nav.ts`.

- Logo: `public/brand/mark.svg` and `mark-white.svg`, favicon `app/icon.svg`. Sign-in provider and social icons
  are simplified glyphs (`components/auth/provider-icons.tsx`, `components/common/social-icons.tsx`).
- Legal pages carry plain-language summaries and are marked as such; replace with final legal text before launch.
- Seat resale is shown only as a labeled concept on `/seats` (open product decision).
