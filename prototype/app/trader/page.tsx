import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, PlusCircle } from "lucide-react";
import { EarningsChart } from "@/components/analytics/charts";
import { MetricTile, Money } from "@/components/common";
import { usageTone } from "@/components/contract/risk-contract";
import { PageHeader } from "@/components/layout/page-header";
import { ComplianceBadge, StateBadge } from "@/components/market/badges";
import { SeatMeter } from "@/components/market/seat-meter";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getTraderDashboard } from "@/lib/mock-api";
import { fmtDate, fmtMoney, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Trader overview" };

export default async function TraderOverview() {
  const d = await getTraderDashboard();
  const live = d.strategies.filter((s) => s.state !== "closed");
  const kept = d.strategies.reduce((a, s) => a + s.compliance.kept, 0);
  const settled = d.strategies.reduce((a, s) => a + s.compliance.settled, 0);
  const alerts = live.flatMap((s) =>
    s.contract.rules.filter((r) => r.key !== "activity" && r.key !== "instruments" && r.usage >= 0.6).map((r) => ({ s, r })),
  );
  return (
    <>
      <PageHeader
        title="Trader overview"
        description={<>Demo: viewing as <b className="text-text">{d.trader.handle}</b>. You earn only for Epochs where you keep the Seat Contract.</>}
        actions={
          <Link href="/trader/create" className={buttonVariants()}>
            <PlusCircle /> Create strategy
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <MetricTile label="Pending this Epoch" value={<Money value={d.totals.pendingTraderShare} currency="USDC" digits={0} />} sub="Your 75% if contracts are kept" info="Seat Fees currently in escrow × 75%." />
        <MetricTile label="Lifetime payouts" value={<Money value={d.totals.lifetimePayout} currency="USDC" digits={0} />} sub={`${fmtMoney(d.totals.lifetimeRefunded, { currency: "USDC", digits: 0 })} refunded on breaches`} />
        <MetricTile label="Seats filled" value={<span className="tnum">{d.totals.seatsFilled}</span>} sub={`Across ${live.length} live strategies`} />
        <MetricTile label="Compliance" value={<span className="tnum">{kept}/{settled}</span>} sub={`${fmtPct(kept / settled, { digits: 0 })} · all strategies incl. closed`} />
      </div>

      {alerts.length ? (
        <div className="mt-6 space-y-2">
          {alerts.map(({ s, r }) => (
            <div key={s.id + r.key} className={cn("flex flex-wrap items-center gap-3 rounded-lg border p-4", usageTone(r.usage) === "danger" ? "border-danger/30 bg-danger-soft" : "border-warning/30 bg-warning-soft")}>
              <AlertTriangle className={cn("size-5", usageTone(r.usage) === "danger" ? "text-danger" : "text-warning")} />
              <p className="flex-1 text-[13px]">
                <b>{s.name}:</b> {r.label.toLowerCase()} at {r.current} — {Math.round(r.usage * 100)}% of the {r.limit} limit.{" "}
                {s.state === "paused" ? "Strategy paused after breach." : "Reduce risk to keep this Epoch."}
              </p>
              <Link href={`/strategies/${s.slug}?tab=contract`} className="text-[13px] font-semibold text-primary-text hover:underline">
                View contract
              </Link>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader title="Earnings by month" description="Released Seat Fees (blue) vs. refunded to followers (red)" />
          <CardBody>
            <EarningsChart data={d.earningsByMonth} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Upcoming settlements" />
          <CardBody className="divide-y divide-border py-0">
            {d.currentEscrow.map(({ strategy: s, epoch, gross, traderShare }) => (
              <div key={s.id} className="py-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{s.name}</span>
                  <span className="tnum font-semibold">{fmtMoney(traderShare, { currency: "USDC", digits: 0 })}</span>
                </div>
                <div className="mt-1 flex justify-between text-caption text-tertiary">
                  <span>
                    Epoch {epoch.index} ends {fmtDate(epoch.end, { year: false })}
                  </span>
                  <span className="tnum">gross {fmtMoney(gross, { currency: "USDC", digits: 0 })}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(epoch.progress ?? 0) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h2">Your strategies</h2>
          <Link href="/trader/strategies" className="inline-flex items-center gap-1 font-semibold text-primary-text hover:underline">
            Manage <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {live.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/strategies/${s.slug}`} className="text-[15px] font-semibold hover:text-primary-text">
                    {s.name}
                  </Link>
                  <div className="mt-1 flex gap-1.5">
                    <StateBadge state={s.state} />
                    <ComplianceBadge strategy={s} short />
                  </div>
                </div>
              </div>
              <SeatMeter className="mt-4" taken={s.seatsTaken} total={s.seatsTotal} waitlist={s.waitlist} />
              <div className="mt-4 space-y-2">
                {s.contract.rules.slice(0, 3).map((r) => (
                  <div key={r.key} className="flex items-center gap-3 text-caption">
                    <span className="w-24 shrink-0 truncate text-secondary">{r.label.replace(" in Epoch", "")}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-muted">
                      <div className={cn("h-full rounded-full", { primary: "bg-primary", warning: "bg-warning", danger: "bg-danger" }[usageTone(r.usage)])} style={{ width: `${Math.min(100, r.usage * 100)}%` }} />
                    </div>
                    <span className="tnum w-14 text-right">{Math.round(r.usage * 100)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
