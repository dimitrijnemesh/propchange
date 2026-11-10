import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical, Map as MapIcon, Radio } from "lucide-react";
import { Avatar, Delta, Sparkline } from "@/components/common";
import { ComplianceBadge, StateBadge } from "@/components/market/badges";
import { LiveFeed } from "@/components/market/live-feed";
import { MarketBanner } from "@/components/market/market-banner";
import { SeatBoards } from "@/components/market/seat-boards";
import { SeatHeatmap } from "@/components/market/seat-heatmap";
import { SeatMarketTable } from "@/components/market/seat-market-table";
import { SeatMeter } from "@/components/market/seat-meter";
import { Marquee } from "@/components/marketing/marquee";
import { SolanaBadge } from "@/components/common/solana-mark";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getSeatMarket } from "@/lib/mock-api";
import { getT } from "@/lib/i18n/server";
import { fmtMoney, fmtNumber, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Seat Market",
  description: "Live market for strategy Seats — prices, occupancy, waitlists and seat activity across every strategy.",
};

const VERB = { buy: "bought", renew: "renewed", waitlist: "joined the waitlist for", exit: "left" } as const;

export default async function SeatMarketPage() {
  const [{ rows, movers, stats, activity, boards }, t] = await Promise.all([getSeatMarket(), getT()]);
  const listings = rows.filter((r) => r.state === "full" || r.seatsTaken / r.seatsTotal > 0.8).slice(0, 3);
  const ticker = activity
    .slice(0, 14)
    .map((e) => `${e.user} ${VERB[e.type]} ${e.type === "buy" || e.type === "renew" ? `${e.seats} seat${e.seats > 1 ? "s" : ""} · ` : ""}${e.name}${e.type === "buy" || e.type === "renew" ? ` · ${fmtNumber(e.priceUsdc)} USDC` : ""}`);

  return (
    <div className="container-market pt-6 md:pt-8">
      <MarketBanner
        live={t("live")}
        eyebrow={t("seats.eyebrow")}
        badge={<SolanaBadge label="Settled on Solana" variant="chip" className="border-white/20 bg-white/10 text-white [&_.sol-mark]:bg-[linear-gradient(45deg,#9945ff,#14f195)]" />}
        title={t("nav.seatMarket")}
        description={t("seats.description")}
        actions={
          <Link href="/strategies" className={cn(buttonVariants({ size: "md" }), "bg-white text-primary hover:bg-blue-50 active:bg-blue-100")}>
            {t("seats.browse")} <ArrowRight />
          </Link>
        }
        stats={[
          { label: t("seats.feesMonth"), value: <>{fmtMoney(stats.escrowRunRate, { compact: true })}</>, sub: "USDC run rate in escrow" },
          { label: t("seats.active"), value: stats.seatsActive.toLocaleString("en-US"), sub: `${stats.followersWithSeats.toLocaleString("en-US")} followers` },
          { label: t("seats.bought24h"), value: stats.seats24h, sub: `${fmtNumber(stats.volume24h, 0)} USDC · ${stats.buyers24h} buyers` },
          { label: t("seats.avgOcc"), value: fmtPct(stats.avgOccupancy, { digits: 0 }), sub: `${stats.full} strategies full` },
          { label: t("seats.onWaitlists"), value: stats.waitlist.toLocaleString("en-US"), sub: `${stats.strategies} strategies · ${stats.traders} traders` },
        ]}
        footer={<Marquee bare items={ticker} className="py-2.5 text-[12px] normal-case tracking-normal text-white/85 lg:py-3 lg:text-[13px]" />}
      />

      {/* top movers */}
      <section className="mt-8">
        <h2 className="mb-3 text-caption font-semibold uppercase tracking-[0.12em] text-secondary">{t("seats.topMovers")}</h2>
        <div className="scroll-thin -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:px-0 lg:grid-cols-4">
          {movers.map((s) => (
            <Link
              key={s.id}
              href={`/seats/${s.slug}`}
              className="lift min-w-[260px] snap-start rounded-lg border border-border bg-surface p-4 shadow-sm transition-[box-shadow,transform] duration-200 hover:border-border-strong"
            >
              <div className="flex items-center gap-2.5">
                <Avatar name={s.traderHandle} size={28} />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{s.name}</div>
                  <div className="text-caption text-tertiary">{s.traderHandle}</div>
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="tnum text-metric-lg">{fmtNumber(s.price)}</div>
                  <div className="text-caption text-tertiary">USDC / 30d</div>
                </div>
                <div className="text-right">
                  <Delta value={s.seatPrice7dChange} arrow className="font-semibold" />
                  <Sparkline data={s.priceHistory} tone={s.seatPrice7dChange >= 0 ? "up" : "down"} />
                </div>
              </div>
              <SeatMeter className="mt-3" taken={s.seatsTaken} total={s.seatsTotal} waitlist={s.waitlist} size="sm" />
            </Link>
          ))}
        </div>
      </section>

      {/* heat map + live feed */}
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="min-w-0 rounded-lg border border-border bg-surface p-5 shadow-sm lg:col-span-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-h3 flex items-center gap-2">
                <MapIcon className="size-5 text-primary-text" strokeWidth={1.75} /> {t("seats.map")}
              </h2>
              <p className="text-secondary">{t("seats.mapDesc")}</p>
            </div>
            <div className="flex items-center gap-2 text-caption text-tertiary">
              <span className="h-2.5 w-8 rounded-sm" style={{ background: "linear-gradient(90deg, var(--down), var(--surface), var(--up))" }} />
              −8% … +8%
            </div>
          </div>
          <SeatHeatmap rows={rows.filter((r) => r.state !== "paused")} />
        </section>
        <section className="min-w-0 rounded-lg border border-border bg-surface p-5 shadow-sm lg:col-span-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-h3 flex items-center gap-2">
              <Radio className="size-5 text-primary-text" strokeWidth={1.75} /> {t("seats.liveActivity")}
            </h2>
            <span className="text-caption text-tertiary">{stats.registeredUsers.toLocaleString("en-US")} {t("seats.users")}</span>
          </div>
          <LiveFeed events={activity} rows={11} />
        </section>
      </div>

      {/* demand boards */}
      <section className="mt-8">
        <SeatBoards
          hot={boards.hot}
          filling={boards.filling}
          waitlist={boards.waitlist}
          titles={{ hot: t("seats.mostDemand"), filling: t("seats.fillingFast"), waitlist: t("seats.longestWaitlists") }}
        />
      </section>

      {/* all seats */}
      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-h2">{t("seats.all")}</h2>
            <p className="text-secondary">{t("seats.allDesc")}</p>
          </div>
        </div>
        <SeatMarketTable rows={rows} />
      </section>

      <section className="mt-10 rounded-xl border border-dashed border-border-strong p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-h2">Resale listings</h2>
          <Badge variant="warning">
            <FlaskConical strokeWidth={1.75} /> Concept — resale not yet decided
          </Badge>
        </div>
        <p className="mt-1 max-w-[720px] text-secondary">
          If Seats become transferable, holders could list them here. The buyer inherits the current Epoch&apos;s escrow; the trader earns a 5% royalty and the platform 2%.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {listings.map((s, i) => (
            <div key={s.id} className="rounded-lg bg-bg-subtle p-4 opacity-90">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold">{s.name}</span>
                {s.state === "full" ? <StateBadge state="full" /> : null}
              </div>
              <dl className="mt-3 space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-secondary">Lowest ask</dt>
                  <dd className="tnum font-semibold">{fmtNumber(s.price * (1.12 + i * 0.05))} USDC</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-secondary">Seats listed by holders</dt>
                  <dd className="tnum font-semibold">{2 + i}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-secondary">Compliance</dt>
                  <dd>
                    <ComplianceBadge strategy={s} short />
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
