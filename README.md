# PropChange

Seat Market for trading strategies: verified traders offer a limited number of Seats; users copy their trades in their own accounts, protected by a Seat Contract and an independent Risk Engine.

## Projects

| Folder | What | Run |
|---|---|---|
| [`redesign/`](redesign) | Current web app — one main **Seats** page (Binance-style), Seat trading screen, v2/v3 switch, mobile tab bar | `npm install && npm run dev` |
| [`prototype/`](prototype) | Previous prototype (separate Strategies and Seat Market pages) | `npm install && npm run dev` |
| [`landing/`](landing) | Landing page with waitlist and feedback forms (Google Sheets) — see `landing/README.md` | `npm install && npm run dev` |

All three are Next.js + TypeScript and use demo data only (no real money). Copy `.env.example` to `.env.local` where needed.

- Prototype: https://propchange.vercel.app
- Landing: https://join-propchange.vercel.app
