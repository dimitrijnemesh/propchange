export interface FaqCategory {
  id: string;
  title: string;
  items: { q: string; a: string }[];
}

export const faq: FaqCategory[] = [
  {
    id: "basics",
    title: "Getting started",
    items: [
      { q: "What is PropChange?", a: "A marketplace for trading strategies. You buy a limited Seat on a strategy, its trades copy into your own exchange or broker account, and an independent Risk Engine enforces the trader's Seat Contract. You pay for disciplined, bounded risk — not for promised returns." },
      { q: "Do I need a wallet?", a: "Yes, a Solana wallet to pay Seat Fees in USDC and receive refunds. Your trading capital stays on your exchange (Binance, Bybit) or MT5 broker account." },
      { q: "Which venues are supported?", a: "Binance and Bybit (spot and USDⓈ-M futures) and MetaTrader 5 brokers. More venues are added as their APIs allow trade-only keys." },
      { q: "Is there a minimum account size?", a: "Each strategy sets a minimum account size and a Seat Allocation (the capital one Seat copies). You can see both on the strategy page before buying." },
      { q: "How do I get started?", a: "Create an account (Google, Apple, a wallet, email or phone), connect a trade-only API key from your exchange or MT5 broker, link a Solana wallet with USDC, then pick a strategy and take a Seat. Copying starts with the next trade." },
      { q: "Can I try it without risking money?", a: "Yes. Every strategy has a Simulator tab that runs a Monte Carlo backtest of the strategy with your own Seat allocation and risk limits, so you can see a range of outcomes before paying." },
      { q: "Which countries are supported?", a: "Most countries are supported. Residents of restricted jurisdictions (including Russia, Belarus, Iran, North Korea, Syria and Cuba) cannot open an account." },
      { q: "Is PropChange a broker or an exchange?", a: "Neither. PropChange is software: it copies orders into the exchange or broker account you already have, enforces Seat Contracts and settles Seat Fees. Your venue executes and custodies your trades." },
      { q: "Can I use PropChange on my phone?", a: "Yes. The whole platform works in a mobile browser, including buying Seats, the live Seat Market and alerts. You can add it to your home screen like an app." },
    ],
  },
  {
    id: "seats",
    title: "Seats & fees",
    items: [
      { q: "What is a Seat?", a: "The right to copy one strategy up to a fixed Seat Allocation (e.g. $3,000 of your own capital) for a 30-day Epoch. Seats are limited by the strategy's measured Capacity so late followers don't become exit liquidity." },
      { q: "How is the Seat price set?", a: "The trader sets a base price within platform bounds; it rises with occupancy. The price you pay is locked for the Epoch you buy." },
      { q: "Where does my fee go?", a: "Into escrow for the 30-day Epoch. If the Seat Contract is kept, 75% goes to the trader and 25% to the platform at settlement. If it is breached, you are refunded." },
      { q: "What happens when a strategy is full?", a: "You can join the waitlist. When a Seat frees up, waitlisted followers are offered it in order and have 24 hours to accept." },
      { q: "Can I resell a Seat?", a: "Not yet. Transferable Seats are being explored; see the Resale concept on the Seat Market page." },
      { q: "Can I hold Seats in several strategies?", a: "Yes. Each Seat is independent, with its own allocation, fee and Seat Contract. Your dashboard shows combined exposure so you don't over-allocate one exchange account." },
      { q: "What happens at the end of an Epoch?", a: "The Epoch settles automatically: the escrow pays the trader if the contract was kept, or refunds you if it was breached. Your Seat renews at the new price unless you turned off auto-renew." },
      { q: "Can I cancel a Seat mid-Epoch?", a: "You can stop copying at any time and close positions from your exchange. The Seat Fee for the running Epoch is not refunded unless the trader breaches the contract." },
      { q: "Why did the Seat price change?", a: "Seat prices rise with occupancy: the fuller a strategy, the higher the price of the next Seat. The price you paid is locked for your Epoch." },
      { q: "What is the Seat Allocation?", a: "The amount of your own capital one Seat copies, for example $3,000. Positions are scaled to it, so a trader's 10% position becomes $300 in your account." },
      { q: "Can I copy with more capital?", a: "Buy several Seats in the same strategy, up to the per-follower cap. Each Seat adds one Seat Allocation of copied capital." },
      { q: "What is a 90-day or 180-day term?", a: "Longer terms prepay several Epochs at a small discount. Each Epoch is still settled separately, so a breach in one Epoch refunds that Epoch." },
    ],
  },
  {
    id: "risk",
    title: "Seat Contracts",
    items: [
      { q: "What is a Seat Contract?", a: "A set of hard limits the trader commits to for each Epoch: max drawdown, daily loss, leverage, position size and allowed instruments. It is derived from the strategy's own history." },
      { q: "What happens if the trader breaks the rules?", a: "Copying stops immediately for all Seats. A hard breach refunds your full Epoch fee; a soft breach is refunded pro-rata." },
      { q: "Is profit guaranteed?", a: "No. A trader can have a losing Epoch and still be paid if every rule was respected. Seat Contracts bound behaviour; they do not guarantee returns." },
      { q: "Can I add my own limits?", a: "Yes. In Risk settings you can set a personal max loss per Seat and pause copying at any time; your limits apply on top of the trader's contract." },
      { q: "Who checks the Seat Contract?", a: "An independent Risk Engine watches the trader's account in real time. Rule checks are automatic and the result of every Epoch is recorded on-chain with the contract hash." },
      { q: "What is a hard vs. a soft breach?", a: "Hard breaches (drawdown, daily loss, leverage, position size, prohibited instruments) stop copying and refund the full Epoch fee. Soft breaches (for example, too little activity) refund pro-rata." },
      { q: "What does Capacity mean?", a: "Capacity is how much capital a strategy can absorb before follower slippage eats its edge. Seats are limited by it, so a full strategy is a feature, not a bug." },
      { q: "Can the trader change the rules mid-Epoch?", a: "No. The contract is frozen at the start of each Epoch and its hash is stored on-chain. Traders can only tighten limits for the next Epoch, never loosen them." },
      { q: "Why can the follower result differ from the trader's?", a: "Fills differ slightly because of latency, liquidity, fees and account size. Each strategy page shows the measured gap between trader NAV and realized follower results." },
    ],
  },
  {
    id: "security",
    title: "Security & custody",
    items: [
      { q: "Is my money held by PropChange?", a: "No. Your trading capital stays in your own account. PropChange only receives a trade-only API key; keys with withdrawal permission are rejected. The only funds in escrow are Seat Fees in USDC." },
      { q: "How are API keys stored?", a: "Envelope-encrypted and only decrypted inside the isolated execution service. Keys never reach the browser, logs or analytics." },
      { q: "What if PropChange goes offline?", a: "Your positions stay on your exchange and remain under your control. Escrowed fees settle on-chain according to the Epoch rules." },
      { q: "Do you support two-factor authentication?", a: "Yes. You can enable an authenticator app in Settings; it is required for traders and before changing payout addresses." },
      { q: "What if my API key is compromised?", a: "Trade-only keys cannot withdraw. Revoke the key on your exchange and in Connections; copying pauses immediately and you can connect a new key." },
      { q: "Is my personal data shared with traders?", a: "No. Followers are pseudonymous by default — traders only see an anonymous handle and Seat count, never your name, email or balances." },
    ],
  },
  {
    id: "traders",
    title: "For traders",
    items: [
      { q: "How do I list a strategy?", a: "Connect a read-only track-record account, choose your Seat price within bounds, and accept the Seat Contract derived from your history. A small performance bond keeps incentives aligned." },
      { q: "When do I get paid?", a: "At the end of each Epoch in which you kept your Seat Contract — 75% of escrowed Seat Fees, in USDC, to your wallet." },
      { q: "What is a Rookie?", a: "A strategy with fewer than 3 settled Epochs. Rookies are listed with fewer Seats and a capped price until they build a compliance record." },
      { q: "How much can I earn as a trader?", a: "75% of the Seat Fees for every Epoch in which you keep your Seat Contract. Earnings scale with your Seat price, occupancy and compliance record." },
      { q: "What is the performance bond?", a: "A USDC deposit that scales with your Capacity. It aligns incentives and covers part of follower refunds after repeated hard breaches." },
      { q: "What is a verified trader?", a: "Verified traders passed identity checks and connected a read-only track record. Verified+ adds at least 12 months of history and a kept-contract record." },
      { q: "Can I run several strategies?", a: "Yes. Each strategy runs on its own sub-account with its own Seat Contract, Capacity and Seat price, so a breach in one doesn't affect the others." },
    ],
  },
  {
    id: "payments",
    title: "Payments & wallets",
    items: [
      { q: "Which currency are fees paid in?", a: "Seat Fees are paid in USDC on Solana. Card payments and other stablecoins are on the roadmap." },
      { q: "Which wallets can I use?", a: "Any Solana wallet works — Phantom, MetaMask (Solana), WalletConnect-compatible wallets and Coinbase Wallet are supported at sign-in." },
      { q: "How fast are refunds?", a: "Refunds settle from escrow at the end of the Epoch, usually within minutes of settlement, directly to the wallet you paid from." },
      { q: "Are there network fees?", a: "Solana network fees are a fraction of a cent. PropChange does not add deposit or withdrawal fees." },
      { q: "Do I get an invoice or a receipt?", a: "Every payment, renewal, settlement and refund appears in Activity with its on-chain transaction, and can be exported as CSV for your records." },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & metrics",
    items: [
      { q: "Why is the list sorted by compliance, not return?", a: "Return alone rewards luck and hidden risk. Compliance — the share of Epochs where the Seat Contract was kept — measures discipline, then risk-adjusted return breaks ties." },
      { q: "What do Sharpe and Sortino mean?", a: "Both measure return per unit of risk. Sharpe uses total volatility; Sortino only counts downside volatility. Above 1 is good, above 2 is excellent." },
      { q: "What is max drawdown?", a: "The largest fall from a peak to a later low. It tells you the worst loss you would have sat through if you joined at the top." },
      { q: "What is PSR (probabilistic Sharpe)?", a: "The probability that the strategy's true Sharpe is above zero given its sample size and return shape. Below 0.9 the track record may be luck." },
      { q: "What do beta and correlation to BTC show?", a: "How much the strategy moves with Bitcoin. Beta near 0 means market-neutral; a high correlation means you are mostly buying crypto exposure." },
      { q: "How does the Simulator work?", a: "It re-samples the strategy's own daily returns thousands of times (Monte Carlo), applies your Seat allocation, costs and personal loss limit, and shows the range of outcomes — with and without the Risk Engine." },
      { q: "Is the data on strategy pages real-time?", a: "NAV and positions update continuously from the trader's connected account; metrics are recomputed daily and are reproducible from raw exchange data." },
    ],
  },
  {
    id: "account",
    title: "Account & referrals",
    items: [
      { q: "How does the referral program work?", a: "Share your link. When a friend buys their first Seat you both get 10% off one Epoch fee, and you earn 5% of the platform share of their fees for 12 months." },
      { q: "How do I close my account?", a: "Let active Seats run to the end of their Epoch (or exit), disconnect your exchange keys in Connections, then request deletion in Settings." },
    ],
  },
];
