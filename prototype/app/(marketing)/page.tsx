import { ArrowRight, Check, ChevronRight, Info, LineChart, Radio, Scale, ShieldCheck } from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import Link from "next/link";
import { MarketTable } from "@/components/home/market-table";
import { MarketOverview } from "@/components/home/market-overview";
import { TopicBar } from "@/components/home/topic-bar";
import { LiveBadge } from "@/components/market/market-banner";
import { LiveFeed } from "@/components/market/live-feed";
import { StrategyCard } from "@/components/market/strategy-card";
import { HeroArt } from "@/components/marketing/hero-art";
import { Marquee } from "@/components/marketing/marquee";
import { Accordion } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { fmtMoney, fmtPct } from "@/lib/format";
import { getT } from "@/lib/i18n/server";
import { getHomeData, getSeatMarket } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

const steps = [
  { icon: LineChart, href: "/strategies", title: "Analyze", body: "Institutional-grade analytics, measured Capacity and a Seat Contract from the strategy's own history." },
  { icon: SeatIcon, href: "/seats", title: "Take a Seat", body: "Seats are limited. The fee is paid in USDC and held in escrow for the 30-day Epoch." },
  { icon: ShieldCheck, href: "/how-it-works#risk-engine", title: "Copy with protection", body: "Orders copy into your own exchange account under an independent Risk Engine." },
  { icon: Scale, href: "/how-it-works#epochs", title: "Settle", body: "Contract kept → fee goes to the trader. Breached → copying stops, your fee comes back." },
];

const faq = [
  { q: "Is my money held by PropChange?", a: "No. Your trading capital stays in your own Binance, Bybit or MT5 account. PropChange only receives a trade-only key — keys with withdrawal permission are rejected. The only thing held in escrow is your Seat Fee in USDC." },
  { q: "What is a Seat?", a: "A Seat is the right to copy one strategy up to a fixed Seat Allocation (e.g. $3,000 of your own capital) for as long as the Seat Fee is paid. Seats are limited by the strategy's Capacity so late followers don't become exit liquidity." },
  { q: "What happens if the trader breaks the rules?", a: "Copying stops immediately for all Seats. For a hard breach (drawdown, daily loss, leverage, position size, prohibited instrument) your full Epoch fee is refunded. Soft breaches are refunded pro-rata." },
  { q: "What are the fees?", a: "You pay a Seat Fee per 30-day Epoch, set by the trader within platform bounds and rising with occupancy. If the contract is kept, 75% goes to the trader and 25% to the platform. See the Fees page for the calculator." },
  { q: "Is profit guaranteed?", a: "No. A trader can have a losing Epoch and still be paid if all rules were respected. You pay for disciplined, bounded risk — not for promised returns." },
];

function SectionHead({ title, desc, href, linkLabel }: { title: string; desc?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-[22px] font-semibold leading-7 md:text-[24px]">{title}</h2>
        {desc ? <p className="text-[13px] text-tertiary">{desc}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary-text hover:underline">
          {linkLabel} <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

export default async function Home() {
  const [data, seatMkt, t] = await Promise.all([getHomeData(), getSeatMarket(), getT()]);
  const MARQUEE = [t("tag.strategyMarket"), t("tag.nonCustodial")];
  const live = seatMkt.rows.filter((r) => r.state !== "paused");
  const boards = [
    { key: "hot" as const, title: t("search.hot"), href: "/seats", rows: seatMkt.boards.hot.slice(0, 4) },
    { key: "new" as const, title: t("ov.new"), href: "/strategies?state=rookie", rows: live.filter((r) => r.state === "rookie").slice(0, 4) },
    { key: "gainers" as const, title: t("ov.gainers"), href: "/seats", rows: [...live].sort((a, b) => b.seatPrice7dChange - a.seatPrice7dChange).slice(0, 4) },
    { key: "volume" as const, title: t("ov.volume"), href: "/seats", rows: [...live].sort((a, b) => b.seatsTraded30d - a.seatsTraded30d).slice(0, 4) },
  ];

  const kpis = [
    { label: t("home.stats.strategies"), value: data.stats.strategies, sub: `${seatMkt.stats.traders} ${t("markets.traders")}` },
    { label: t("home.stats.seats"), value: data.stats.seatsActive.toLocaleString("en-US"), sub: `+${seatMkt.stats.seats24h} · ${t("stat.bought24h")}` },
    { label: t("home.stats.kept"), value: fmtPct(data.stats.keptRate), sub: `${seatMkt.stats.full} full · ${seatMkt.stats.waitlist} ${t("stat.waitlist").toLowerCase()}` },
    { label: t("home.stats.escrow"), value: fmtMoney(data.stats.escrowUsdc, { compact: true }), sub: t("markets.inEscrow") },
  ];

  const counts = {
    all: data.table.length,
    free: data.table.filter((r) => r.seatsTaken < r.seatsTotal).length,
    waitlist: data.table.filter((r) => r.waitlist > 0).length,
    crypto: data.table.filter((r) => r.markets.includes("crypto")).length,
    forex: data.table.filter((r) => r.markets.includes("forex")).length,
    stocks: data.table.filter((r) => r.markets.includes("stocks")).length,
    futures: data.table.filter((r) => r.markets.includes("futures")).length,
  };

  return (
    <>
      <TopicBar counts={counts} />
      {/* Compact product header: headline + actions, live platform stats alongside */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="hero-light pointer-events-none absolute inset-0 dark:hidden" />
        <div aria-hidden className="hero-dots pointer-events-none absolute inset-0 dark:hidden" />
        <HeroArt />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 hidden size-[720px] rounded-full opacity-[0.12] blur-3xl dark:block"
          style={{ background: "radial-gradient(circle, #3861FB 0%, transparent 70%)" }}
        />
        <div className="container-market relative grid grid-cols-1 items-center gap-8 pb-8 pt-8 md:pb-10 md:pt-12 lg:min-h-[560px] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="hero-copy min-w-0">
            {/* Vercel-style announcement pill */}
            <Link
              href="/seats"
              className="group mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-surface/60 py-1 pl-1 pr-3 text-[12.5px] backdrop-blur transition-colors hover:border-border-strong dark:bg-white/[0.04]"
            >
              <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[11px] font-semibold text-on-primary">New</span>
              <span className="truncate text-secondary">{t("home.announce")}</span>
              <span className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-text">
                {t("home.announceCta")} <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="[&>span]:bg-primary-soft [&>span]:text-primary-soft-text [&>span]:ring-primary/20 dark:[&>span]:bg-white/10 dark:[&>span]:text-white dark:[&>span]:ring-white/20">
                <LiveBadge label={t("live")} />
              </span>
              <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-tertiary">{t("tag.strategyMarket")}</span>
            </div>
            <h1 className="mt-3 max-w-[600px] text-[30px] font-semibold leading-[34px] tracking-[-0.045em] sm:text-[34px] sm:leading-[40px] md:text-[48px] md:leading-[54px]">{t("hero.title")}</h1>
            <p className="mt-3 max-w-[540px] text-[15px] leading-6 text-secondary">{t("hero.subtitle")}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <Link href="/strategies" className={cn(buttonVariants({ size: "lg" }), "btn-glass group rounded-full max-sm:gap-1 max-sm:px-2 max-sm:text-[14px]")}>
                {t("hero.explore")} <ArrowRight className="hidden transition-transform duration-200 group-hover:translate-x-0.5 sm:block" />
              </Link>
              <Link href="/seats" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "btn-glass-ghost rounded-full max-sm:px-2 max-sm:text-[14px]")}>
                {t("nav.seatMarket")}
              </Link>
              <Link href="/how-it-works" className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "hidden rounded-full text-secondary sm:inline-flex")}>
                <Info /> {t("nav.howItWorks")}
              </Link>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-secondary sm:gap-x-5 sm:text-[13px]">
              {[t("hero.check1"), t("hero.check2"), t("hero.check3")].map((label) => (
                <li key={label} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-success" /> {label}
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            {kpis.map((k) => (
              <div key={k.label} className="kpi-glass min-w-0 rounded-xl border border-border p-4">
                <dt className="truncate text-[12px] font-medium text-tertiary">{k.label}</dt>
                <dd className="tnum mt-1 truncate text-[24px] font-bold leading-8 md:text-[28px]">{k.value}</dd>
                <dd className="tnum truncate text-[12px] text-tertiary">{k.sub}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Marquee items={MARQUEE} className="lg:py-[9px] lg:text-[13px] lg:leading-5" />
      </section>

      <div className="container-market space-y-12 pb-4 pt-10 md:space-y-14">
        {/* Markets overview (Binance-style boards) */}
        <section aria-label={t("ov.title")}>
          <SectionHead title={t("ov.title")} href="/seats" linkLabel={t("nav.seatMarket")} />
          <MarketOverview boards={boards} more={t("ov.more")} traded={t("ov.traded")} />
        </section>

        {/* Featured */}
        <section aria-label={t("home.featured")}>
          <SectionHead title={t("home.featured")} desc={t("home.featuredDesc")} href="/strategies" linkLabel={t("home.viewAll")} />
          <div className="swipe-row grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.featured.map((s) => (
              <StrategyCard key={s.id} s={s} />
            ))}
          </div>
        </section>


        {/* Markets table */}
        <section aria-label={t("home.markets")} className="cv-auto">
          <SectionHead title={t("home.markets")} desc={t("home.marketsDesc")} href="/strategies?sort=compliance&view=leaderboard" linkLabel={t("nav.leaderboard")} />
          <MarketTable rows={data.table} />
        </section>

        {/* Live activity + how it works */}
        <section className="cv-auto grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[18px] font-semibold">
                <Radio className="size-5 text-primary-text" strokeWidth={1.75} /> {t("seats.liveActivity")}
              </h2>
              <span className="text-caption text-tertiary">
                {seatMkt.stats.registeredUsers.toLocaleString("en-US")} {t("seats.users")}
              </span>
            </div>
            <LiveFeed events={seatMkt.activity} rows={7} />
          </div>
          <div className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-semibold">{t("home.howItWorks")}</h2>
                <p className="text-[13px] text-tertiary">{t("home.howDesc")}</p>
              </div>
              <Link href="/how-it-works" className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary-text hover:underline">
                {t("home.viewAll")} <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <ol className="space-y-1">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <Link href={s.href} className="group flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-bg-subtle">
                  <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-soft-text">
                    <s.icon className="size-4" strokeWidth={1.75} />
                    <span className="tnum absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                      {i + 1}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold transition-colors group-hover:text-primary-text">{s.title}</div>
                    <p className="text-[13px] text-secondary">{s.body}</p>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-tertiary opacity-0 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Trader CTA */}
        <section className="market-banner relative overflow-hidden rounded-xl px-5 py-6 text-white md:px-8">
          <div aria-hidden className="market-banner-dots pointer-events-none absolute inset-0" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="max-w-[640px] text-[15px] leading-6 text-white/85">{t("home.traderCta")}</p>
            <Link href="/signup?role=trader" className={cn(buttonVariants({ size: "md" }), "shrink-0 bg-white text-primary hover:bg-blue-50")}>
              {t("hero.becomeTrader")} <ArrowRight />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="cv-auto">
          <SectionHead title={t("home.faq")} />
          <Accordion items={faq} />
        </section>
      </div>
    </>
  );
}
