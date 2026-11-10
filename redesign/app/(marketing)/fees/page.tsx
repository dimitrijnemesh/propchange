import type { Metadata } from "next";
import { FollowerCalculator, TraderCalculator } from "@/components/marketing/fee-calculators";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Fees", description: "Seat price formula, trader income calculator and platform fees." };

const platformFees = [
  ["Share of Seat Fees (kept Epochs)", "25%"],
  ["Share of performance fees", "25%"],
  ["Seat resale fee (if enabled)", "2%"],
  ["Trader royalty on resale (if enabled)", "5% (to trader)"],
  ["Breached Epoch", "0% — full or pro-rata refund"],
  ["Trader Bond", "1% of Capacity, min. 500 USDC — slashed only for fraud"],
  ["Follower deposits / withdrawals", "None — capital stays on your exchange"],
];

export default function FeesPage() {
  return (
    <div className="container-marketing">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Fees" }]}
        title="Fees"
        description="Simple: followers pay a Seat Fee per 30-day Epoch. It is released only if the trader keeps the Seat Contract."
      />
      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Follower: Seat price"
            description={
              <span className="font-mono text-[13px]">price = base × (days / 30)^0.9 × (1 + 0.5 × occupancy²)</span>
            }
          />
          <CardBody>
            <FollowerCalculator />
            <p className="mt-4 text-caption text-tertiary">Longer terms are slightly cheaper per day. The price rises as the strategy fills and is locked for your term.</p>
          </CardBody>
        </Card>
        <Card id="trader" className="scroll-mt-24">
          <CardHeader title="Trader: income per Epoch" description="Defaults reproduce the worked example: 100 Seats × 30 USDC, +3% Epoch, 10 resales." />
          <CardBody>
            <TraderCalculator />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Platform fees" action={<Badge variant="neutral">Subject to change</Badge>} />
          <CardBody className="px-0 pb-2">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {platformFees.map(([k, v]) => (
                  <tr key={k}>
                    <td className="px-5 py-3 text-secondary">{k}</td>
                    <td className="px-5 py-3 text-right font-semibold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
