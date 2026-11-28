import { SeatTrends } from "@/components/home/seat-trends";
import { CtaBanner, FactsStrip, FaqSection, HowItWorksCards, InvestorsSection, WhySolana } from "@/components/home/landing-sections";
import { ProductRows } from "@/components/home/product-rows";
import { RefundCalculator } from "@/components/home/refund-calculator";
import { SeatFinder } from "@/components/home/seat-finder";
import { TopicBar } from "@/components/home/topic-bar";
import { HomeHero } from "@/components/home/home-hero";
import { AppShowcase } from "@/components/home/app-showcase";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { cookies } from "next/headers";
import { Accordion } from "@/components/ui/accordion";
import { getT } from "@/lib/i18n/server";
import { getHomeData, getSeatMarket } from "@/lib/mock-api";

const faq = [
  { q: "Is my money held by PropChange?", a: "No. Your trading capital stays in your own Binance, Bybit or MT5 account. PropChange only receives a trade-only key — keys with withdrawal permission are rejected. The only thing held in escrow is your Seat Fee in USDC." },
  { q: "What is a Seat?", a: "A Seat is the right to copy one strategy up to a fixed Seat Allocation (e.g. $3,000 of your own capital) for as long as the Seat Fee is paid. Seats are limited by the strategy's Capacity so late followers don't become exit liquidity." },
  { q: "What happens if the trader breaks the rules?", a: "Copying stops immediately for all Seats. For a hard breach (drawdown, daily loss, leverage, position size, prohibited instrument) your full Epoch fee is refunded. Soft breaches are refunded pro-rata." },
  { q: "What are the fees?", a: "You pay a Seat Fee per 30-day Epoch, set by the trader within platform bounds and rising with occupancy. If the contract is kept, 75% goes to the trader and 25% to the platform. See the Fees page for the calculator." },
  { q: "Is profit guaranteed?", a: "No. A trader can have a losing Epoch and still be paid if all rules were respected. You pay for disciplined, bounded risk — not for promised returns." },
];

export default async function Home() {
  const [data, seatMkt, t, jar] = await Promise.all([getHomeData(), getSeatMarket(), getT(), cookies()]);
  const authed = jar.get("pc_auth")?.value === "1";
  const live = seatMkt.rows.filter((r) => r.state !== "paused");
  const counts = {
    all: data.table.length,
    free: data.table.filter((r) => r.seatsTaken < r.seatsTotal).length,
    waitlist: data.table.filter((r) => r.waitlist > 0).length,
    crypto: data.table.filter((r) => r.markets.includes("crypto")).length,
    forex: data.table.filter((r) => r.markets.includes("forex")).length,
    stocks: data.table.filter((r) => r.markets.includes("stocks")).length,
    futures: data.table.filter((r) => r.markets.includes("futures")).length,
  };

  const trends = seatMkt.boards.hot.slice(0, 3);
  const trending = seatMkt.boards.hot.slice(0, 5);
  const fresh = live.filter((r) => r.state === "rookie").slice(0, 5);
  const popular = [...live].sort((a, b) => b.seatsTraded30d - a.seatsTraded30d).slice(0, 6);
  const gainers = [...live].sort((a, b) => b.seatPrice7dChange - a.seatPrice7dChange).slice(0, 5);

  return (
    <>
      <TopicBar counts={counts} />
      <HomeHero initialLoggedIn={authed} />
      <ScrollReveal />
      {/* everything below slides over the pinned hero */}
      <div className="home-overlay">
      <SeatTrends trends={trends} trending={popular} fresh={fresh} gainers={gainers} />
      <FactsStrip />
      <HowItWorksCards />
      <RefundCalculator />
      <SeatFinder rows={live} />
      <ProductRows />
      <AppShowcase hot={trending} gainers={gainers} />
      <WhySolana />
      <InvestorsSection />

      <CtaBanner loggedIn={authed} />
      <FaqSection title={t("home.faq")} viewAll={t("home.viewAll")}>
        <Accordion items={faq} />
      </FaqSection>
      </div>
    </>
  );
}
