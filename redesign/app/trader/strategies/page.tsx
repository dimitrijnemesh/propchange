import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Delta, Pct } from "@/components/common";
import { PageHeader } from "@/components/layout/page-header";
import { ComplianceBadge, StateBadge } from "@/components/market/badges";
import { SeatMeter } from "@/components/market/seat-meter";
import { TraderStrategyActions } from "@/components/app/trader-strategy-actions";
import { buttonVariants } from "@/components/ui/button";
import { getTraderDashboard, priceFrom } from "@/lib/mock-api";
import { fmtMoney, fmtNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Your strategies" };

export default async function TraderStrategies() {
  const d = await getTraderDashboard();
  return (
    <>
      <PageHeader
        title="Strategies"
        description="Each strategy has its own sub-account, contract, Capacity and Seats. Closed strategies stay public."
        actions={
          <Link href="/trader/create" className={buttonVariants()}>
            <PlusCircle /> Create strategy
          </Link>
        }
      />
      <div className="scroll-thin overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-bg-subtle text-caption text-secondary">
            <tr>
              <th className="sticky left-0 bg-bg-subtle px-4 py-2.5 text-left font-medium">Strategy</th>
              <th className="px-4 py-2.5 text-left font-medium">State</th>
              <th className="px-4 py-2.5 text-right font-medium">Compliance</th>
              <th className="px-4 py-2.5 text-right font-medium">Return 12m</th>
              <th className="px-4 py-2.5 text-right font-medium">Max DD</th>
              <th className="px-4 py-2.5 text-right font-medium">Seats</th>
              <th className="px-4 py-2.5 text-right font-medium">Base → price</th>
              <th className="px-4 py-2.5 text-right font-medium">Bond</th>
              <th className="px-4 py-2.5 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {d.strategies.map((s) => (
              <tr key={s.id} className={s.state === "closed" ? "text-secondary" : ""}>
                <td className="sticky left-0 bg-surface px-4 py-3">
                  <Link href={`/strategies/${s.slug}`} className="font-semibold text-text hover:text-primary-text">
                    {s.name}
                  </Link>
                  <div className="text-caption text-tertiary">
                    {s.venue} · {s.instruments.join(", ")}
                  </div>
                </td>
                <td className="px-4">
                  <StateBadge state={s.state} />
                </td>
                <td className="px-4 text-right">
                  <ComplianceBadge strategy={s} short />
                </td>
                <td className="px-4 text-right font-semibold">
                  <Delta value={s.metrics.historyDays < 365 ? s.metrics.returnAll : s.metrics.return12m} />
                </td>
                <td className="px-4 text-right">
                  <Pct value={s.metrics.maxDrawdown} />
                </td>
                <td className="px-4">
                  <div className="ml-auto w-[100px]">
                    <SeatMeter size="sm" taken={s.seatsTaken} total={s.seatsTotal} />
                  </div>
                </td>
                <td className="tnum px-4 text-right">
                  {s.basePriceUsdc} → <b>{fmtNumber(priceFrom(s))}</b>
                </td>
                <td className="tnum px-4 text-right">{fmtMoney(s.bondUsdc, { currency: "USDC", digits: 0 })}</td>
                <td className="px-4 text-right">{s.state !== "closed" ? <TraderStrategyActions name={s.name} base={s.basePriceUsdc} paused={s.state === "paused"} /> : <span className="text-caption">{s.closedReason}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
