import { ChevronDown, Gauge } from "lucide-react";
import { Money, StatList } from "@/components/common";
import type { Strategy } from "@/types/domain";

export function CapacityPanel({ s }: { s: Strategy }) {
  const rookie = s.state === "rookie";
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Gauge className="size-4 text-primary-text" strokeWidth={1.75} />
        <h3 className="text-h3">Capacity</h3>
      </div>
      <div className="text-metric-xl mt-2">
        <Money value={s.capacityUsd} digits={0} />
      </div>
      <p className="text-caption text-tertiary">
        {rookie ? (
          <>
            Rookie limit: 10% of computed capacity <Money value={s.fullCapacityUsd} compact />
          </>
        ) : (
          "Max follower capital before slippage eats a third of the edge"
        )}
      </p>
      <StatList
        className="mt-4"
        rows={[
          { label: "Seat allocation", value: <Money value={s.seatAllocationUsd} digits={0} />, info: "Each Seat lets you copy up to this amount of your own capital." },
          { label: "Seats", value: `${s.seatsTotal} = floor(${(s.capacityUsd / 1000).toFixed(1)}k / ${(s.seatAllocationUsd / 1000).toFixed(0)}k)` },
          { label: "Min account size", value: <Money value={s.minAccountUsd} digits={0} />, info: "Below this, copied positions would round below venue minimums." },
          { label: "Expectancy (edge)", value: `${s.metrics.expectancyBps} bps / trade` },
          { label: "Avg follower slippage", value: `${s.followerSlippageBps.toFixed(1)} bps` },
        ]}
      />
      <details className="group mt-4 rounded-md bg-bg-subtle">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold">
          How capacity is calculated
          <ChevronDown className="size-4 text-tertiary transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-2 px-4 pb-4 text-secondary">
          <p>
            Every follower order moves the market a little. The more followers, the worse their fills. We estimate how much
            money can follow this strategy before that extra cost reaches <b className="text-text">one third of its average edge</b> per trade.
          </p>
          <p>
            We use a square-root market impact model per instrument: cost ≈ volatility × √(order size ÷ daily volume). The
            tightest instrument sets the limit. After launch we measure real follower slippage and recalibrate monthly.
          </p>
          <p>If capacity falls, nobody loses a Seat — every Seat&apos;s allocation shrinks by the same factor.</p>
        </div>
      </details>
    </section>
  );
}
