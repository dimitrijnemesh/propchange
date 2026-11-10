import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { MetricTile, Money } from "@/components/common";
import { PageHeader } from "@/components/layout/page-header";
import { RiskEngineLog } from "@/components/risk/risk-engine-log";
import { SeatCard } from "@/components/seat/seat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getPortfolio, getRiskLog } from "@/lib/mock-api";
import { fmtMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function FollowerOverview() {
  const [p, log] = await Promise.all([getPortfolio(), getRiskLog(6)]);
  const active = p.seats.filter((r) => r.seat.status === "active");
  return (
    <>
      <PageHeader
        title={`Welcome back, ${p.user.name.split(" ")[0]}`}
        description="Your Seats, escrow and Risk Engine activity."
        actions={
          <Link href="/strategies" className={buttonVariants()}>
            Find strategies
          </Link>
        }
      />
      {p.totals.claimableRefundUsdc ? (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-warning/30 bg-warning-soft p-4">
          <RotateCcw className="size-5 text-warning" />
          <p className="flex-1 text-[13px]">
            <b>Refund available:</b> Gold Breakout breached its Seat Contract. {fmtMoney(p.totals.claimableRefundUsdc, { currency: "USDC" })} can be claimed from escrow.
          </p>
          <Link href="/app/wallet" className={buttonVariants({ size: "sm" })}>
            Claim refund
          </Link>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <MetricTile label="Copying allocation" value={<Money value={p.totals.allocationUsd} digits={0} />} sub={`${p.totals.activeSeats} active Seats`} info="Total Seat Allocation across your active Seats. Capital stays in your exchange accounts." />
        <MetricTile label="Held in escrow" value={<Money value={p.totals.escrowUsdc} currency="USDC" />} sub="Released or refunded at Epoch end" />
        <MetricTile label="PnL on allocations" value={<span className={p.totals.pnlUsd >= 0 ? "text-up" : "text-down"}><Money value={p.totals.pnlUsd} /></span>} sub="All Seats, since start" />
        <MetricTile label="Wallet balance" value={<Money value={p.user.usdcBalance} currency="USDC" />} sub={`${p.user.solBalance} SOL for fees`} />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <section className="min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-h2">Active Seats</h2>
            <Link href="/app/seats" className="inline-flex items-center gap-1 font-semibold text-primary-text hover:underline">
              All Seats <ArrowRight className="size-4" />
            </Link>
          </div>
          {active.map((r) => (
            <SeatCard key={r.seat.id} seat={r.seat} strategy={r.strategy} account={p.accounts.find((a) => a.id === r.seat.accountId)} />
          ))}
        </section>
        <aside className="space-y-6">
          <Card>
            <CardHeader title="Risk Engine" action={<Link href="/app/activity" className="text-[13px] font-semibold text-primary-text hover:underline">View all</Link>} />
            <CardBody>
              <RiskEngineLog entries={log} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Connections" action={<Link href="/app/connections" className="text-[13px] font-semibold text-primary-text hover:underline">Manage</Link>} />
            <CardBody className="space-y-3">
              {p.accounts.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.label}</div>
                    <div className="tnum text-caption text-tertiary">{fmtMoney(a.equityUsd)}</div>
                  </div>
                  {a.status === "ok" ? (
                    <Badge variant="success">
                      <CheckCircle2 /> OK
                    </Badge>
                  ) : (
                    <Badge variant="warning">Check IP whitelist</Badge>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>
        </aside>
      </div>
    </>
  );
}
