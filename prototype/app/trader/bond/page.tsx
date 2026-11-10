import type { Metadata } from "next";
import { Landmark, ShieldAlert } from "lucide-react";
import { BondTopUp } from "@/components/app/bond-topup";
import { MetricTile, Money } from "@/components/common";
import { PageHeader } from "@/components/layout/page-header";
import { StateBadge } from "@/components/market/badges";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getTraderDashboard } from "@/lib/mock-api";
import { fmtMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Trader Bond" };

export default async function BondPage() {
  const d = await getTraderDashboard();
  const live = d.strategies.filter((s) => s.state !== "closed");
  return (
    <>
      <PageHeader title="Trader Bond" description="USDC locked per strategy. Slashed only for fraud and distributed to that strategy's Seat holders." />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        <MetricTile label="Total bonded" value={<Money value={d.totals.bondTotal} currency="USDC" digits={0} />} sub={`${live.length} strategies`} />
        <MetricTile label="Slashed (lifetime)" value={<Money value={0} currency="USDC" digits={0} />} sub="No fraud reports" />
        <MetricTile label="Required" value="1% of Capacity" sub="Minimum 500 USDC" className="col-span-2 lg:col-span-1" />
      </div>
      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Bonds by strategy" />
        <div className="mt-4 divide-y divide-border">
          {live.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary-soft-text">
                <Landmark className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-[180px] flex-1">
                <div className="flex items-center gap-2 font-semibold">
                  {s.name} <StateBadge state={s.state} />
                </div>
                <div className="tnum text-caption text-tertiary">Capacity {fmtMoney(s.fullCapacityUsd, { compact: true })} → required {fmtMoney(Math.max(500, s.fullCapacityUsd * 0.01), { currency: "USDC", digits: 0 })}</div>
              </div>
              <div className="tnum text-right text-[17px] font-semibold">{fmtMoney(s.bondUsdc, { currency: "USDC", digits: 0 })}</div>
              <BondTopUp name={s.name} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="mt-6">
        <CardHeader title={<><ShieldAlert className="size-5 text-warning" /> What can slash a bond</>} />
        <CardBody>
          <ul className="grid gap-3 md:grid-cols-2">
            {[
              ["Trading against followers", "Exiting or reversing right after follower entries to profit from their flow."],
              ["Front-running", "Correlated trades on linked accounts ahead of strategy trades."],
              ["Wash / self-dealing", "Trader-controlled wallets buying Seats to inflate occupancy and price."],
              ["Data manipulation", "Gaps around losses, account resets."],
            ].map(([t, b]) => (
              <li key={t} className="rounded-md bg-bg-subtle p-4">
                <div className="font-semibold">{t}</div>
                <p className="mt-0.5 text-secondary">{b}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-caption text-tertiary">Ordinary breaches never touch the bond — they only refund that Epoch&apos;s Seat Fees. Slashing requires an oracle-signed fraud report and a dispute window.</p>
        </CardBody>
      </Card>
    </>
  );
}
