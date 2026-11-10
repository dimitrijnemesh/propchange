import type { Metadata } from "next";
import { EarningsChart } from "@/components/analytics/charts";
import { Delta, MetricTile, Money } from "@/components/common";
import { OutcomeBadge } from "@/components/contract/epoch-timeline";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getTraderDashboard } from "@/lib/mock-api";
import { fmtDate, fmtMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Earnings" };

export default async function Earnings() {
  const d = await getTraderDashboard();
  const last = d.earningsByMonth.at(-1);
  return (
    <>
      <PageHeader title="Earnings" description="Seat Fees are released from escrow to your wallet at the end of every kept Epoch (75% share)." />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <MetricTile label="Lifetime payouts" value={<Money value={d.totals.lifetimePayout} currency="USDC" digits={0} />} />
        <MetricTile label="Last month" value={<Money value={last?.payout ?? 0} currency="USDC" digits={0} />} />
        <MetricTile label="Pending in escrow" value={<Money value={d.totals.pendingTraderShare} currency="USDC" digits={0} />} sub="Your share, if kept" />
        <MetricTile label="Refunded on breach" value={<Money value={d.totals.lifetimeRefunded} currency="USDC" digits={0} />} sub="What breaches cost you" />
      </div>
      <Card className="mt-6">
        <CardHeader title="Payouts by month" />
        <CardBody>
          <EarningsChart data={d.earningsByMonth} height={300} />
        </CardBody>
      </Card>
      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Settled Epochs" />
        <div className="scroll-thin mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-bg-subtle text-caption text-secondary">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium">Strategy</th>
                <th className="px-5 py-2.5 text-left font-medium">Epoch</th>
                <th className="px-5 py-2.5 text-right font-medium">Seats</th>
                <th className="px-5 py-2.5 text-right font-medium">Return</th>
                <th className="px-5 py-2.5 text-left font-medium">Outcome</th>
                <th className="px-5 py-2.5 text-right font-medium">Paid to you</th>
                <th className="px-5 py-2.5 text-right font-medium">Refunded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {d.epochRows.slice(0, 24).map((e) => (
                <tr key={e.strategyId + e.index} className="h-12">
                  <td className="px-5 font-semibold">{e.strategyName}</td>
                  <td className="px-5 text-secondary">
                    #{e.index} · ends {fmtDate(e.end)}
                  </td>
                  <td className="tnum px-5 text-right">{e.seats}</td>
                  <td className="px-5 text-right">{e.returnPct !== undefined ? <Delta value={e.returnPct} /> : "—"}</td>
                  <td className="px-5">
                    <OutcomeBadge outcome={e.outcome} />
                  </td>
                  <td className="tnum px-5 text-right font-semibold">{fmtMoney(e.payoutUsdc ?? 0, { currency: "USDC", digits: 0 })}</td>
                  <td className="tnum px-5 text-right text-secondary">{e.refundUsdc ? fmtMoney(e.refundUsdc, { currency: "USDC", digits: 0 }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
