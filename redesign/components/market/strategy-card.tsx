import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Avatar, Delta, Pct } from "@/components/common";
import { AreaSpark } from "@/components/common/area-spark";
import { PERIODS, priceFrom, type Period, type StrategyWithSpark } from "@/lib/domain";
import { fmtNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ComplianceBadge, RiskFlagChip, StateBadge } from "./badges";
import { WatchStar } from "./watch-star";
import { SeatIcon } from "@/components/common/seat-icon";

/**
 * Compact, data-first strategy card (exchange / prediction-market style):
 * identity → headline return with risk → mini chart → trust & capacity → price + action.
 */
export function StrategyCard({ s, className, muted, period }: { s: StrategyWithSpark; className?: string; muted?: boolean; period?: Period }) {
  const short12 = s.metrics.historyDays < 365;
  const pLabel = period ? PERIODS.find((p) => p.value === period)?.label : null;
  const ret = period ? s.perf[period] : short12 ? s.metrics.returnAll : s.metrics.return12m;
  const retLabel = pLabel ? `Return ${pLabel}` : short12 ? "Return (all)" : "Return 12m";
  const occ = s.seatsTaken / s.seatsTotal;
  const full = s.seatsTaken >= s.seatsTotal;
  const paused = s.state === "paused";
  return (
    <article
      className={cn(
        "lift group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:border-border-strong",
        muted && "opacity-75",
        className,
      )}
    >
      {/* identity */}
      <div className="flex items-start gap-3 px-4 pt-4">
        <Avatar name={s.traderHandle} size={36} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-5">
            <Link href={`/strategies/${s.slug}`} className="after:absolute after:inset-0 hover:text-primary-text">
              {s.name}
            </Link>
          </h3>
          <p className="truncate text-[12px] text-tertiary">
            {s.traderHandle} · {s.venue}
          </p>
        </div>
        <WatchStar id={s.id} name={s.name} className="-mr-1.5 -mt-1" />
      </div>

      {/* headline numbers */}
      <div className="mt-3 flex items-end justify-between gap-3 px-4">
        <div>
          <div className="text-[11px] font-medium text-tertiary">{retLabel}</div>
          <div className="tnum text-[24px] font-bold leading-7">
            <Delta value={ret} />
          </div>
        </div>
        <dl className="tnum flex gap-4 text-right text-[12px]">
          <div>
            <dt className="text-tertiary">Max DD</dt>
            <dd className="font-semibold">
              <Pct value={s.metrics.maxDrawdown} />
            </dd>
          </div>
          <div>
            <dt className="text-tertiary">Sharpe</dt>
            <dd className="font-semibold">{s.metrics.sharpe.toFixed(2)}</dd>
          </div>
        </dl>
      </div>

      {/* mini chart, edge to edge */}
      <AreaSpark data={s.spark} height={58} className="mt-2" />

      {/* trust & capacity */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-4 pt-3">
        <span className="relative z-10">
          <ComplianceBadge strategy={s} short />
        </span>
        {s.state !== "active" ? <StateBadge state={s.state} /> : null}
        {s.flags[0] ? (
          <span className="relative z-10">
            <RiskFlagChip flag={s.flags[0]} />
          </span>
        ) : null}
        <span className="tnum ml-auto inline-flex items-center gap-1 text-[12px] text-tertiary">
          <SeatIcon className="size-3.5" strokeWidth={1.75} aria-hidden />
          {full ? `Full · ${s.waitlist} waiting` : `${s.seatsTotal - s.seatsTaken} seats left`}
        </span>
      </div>
      <div className="mx-4 mt-2 h-1 overflow-hidden rounded-full bg-bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, occ * 100)}%` }} />
      </div>

      {/* price + action */}
      <div className="mt-auto flex items-center justify-between gap-3 px-4 pb-4 pt-3">
        <div className="tnum leading-tight">
          <span className="text-[16px] font-bold">{fmtNumber(priceFrom(s))}</span>{" "}
          <span className="text-[11px] font-medium text-tertiary">USDC / 30d</span>
        </div>
        {paused ? (
          // paused: no action — clicks fall through to the card link (strategy page)
          <span className="inline-flex h-8 items-center rounded-md bg-bg-muted px-3 text-[13px] font-semibold text-tertiary">Paused</span>
        ) : (
          <Link
            href={full ? `/strategies/${s.slug}` : `/seats/${s.slug}`}
            aria-label={full ? `Join the waitlist for ${s.name}` : `Get a Seat in ${s.name}`}
            className={cn(
              "relative z-10 inline-flex h-8 items-center gap-1 rounded-md px-3 text-[13px] font-semibold transition-colors",
              full ? "border border-border-strong text-text hover:bg-bg-subtle" : "bg-primary text-on-primary hover:bg-primary-hover",
            )}
          >
            {full ? "Waitlist" : "Get seat"}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </article>
  );
}
