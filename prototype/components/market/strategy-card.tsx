import { Users } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/common";
import { AreaSpark } from "@/components/common/area-spark";
import { Price } from "@/components/layout/currency";
import { PERIODS, priceFrom, type Period, type StrategyWithSpark } from "@/lib/domain";
import { fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { WatchStar } from "./watch-star";

/**
 * Copy-trading style strategy card (BingX-like): trader + seats + action on top, a big return with an
 * area chart in the middle, three key numbers at the bottom.
 */
export function StrategyCard({ s, className, muted, period }: { s: StrategyWithSpark; className?: string; muted?: boolean; period?: Period }) {
  const short12 = s.metrics.historyDays < 365;
  const pLabel = period ? PERIODS.find((p) => p.value === period)?.label : null;
  const ret = period ? s.perf[period] : short12 ? s.metrics.returnAll : s.metrics.return12m;
  const retLabel = pLabel ?? (short12 ? "all time" : "1Y");
  const full = s.seatsTaken >= s.seatsTotal;
  const paused = s.state === "paused";
  const up = ret >= 0;
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-[22px] border border-border bg-surface p-5 transition-colors hover:border-border-strong",
        muted && "opacity-75",
        className,
      )}
    >
      {/* who + seats + action */}
      <div className="flex items-center gap-3">
        <Avatar name={s.traderHandle} size={44} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="truncate text-[16px] font-semibold leading-6">
              <Link prefetch={false} href={`/strategies/${s.slug}`} className="after:absolute after:inset-0 hover:text-primary-text">
                {s.name}
              </Link>
            </h3>
            <WatchStar id={s.id} name={s.name} size={15} className="size-7 shrink-0" />
          </div>
          <p className="truncate text-[12.5px] text-tertiary">
            {s.traderHandle} · {s.venue}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="tnum inline-flex items-center gap-1.5 text-[13px] text-secondary">
          <Users className="size-4" strokeWidth={1.75} />
          {s.seatsTaken} / {s.seatsTotal}
          {full ? <span className="text-tertiary">· {s.waitlist} waiting</span> : null}
        </span>
        <Link
          prefetch={false}
          href={paused || full ? `/strategies/${s.slug}` : `/seats/${s.slug}`}
          aria-label={full ? `Join the waitlist for ${s.name}` : `Get a Seat in ${s.name}`}
          className={cn(
            "relative z-10 inline-flex h-9 items-center justify-center rounded-full px-5 text-[13.5px] font-semibold transition-colors",
            paused
              ? "pointer-events-none bg-bg-muted text-tertiary"
              : full
                ? "border border-border-strong text-text hover:bg-bg-subtle"
                : "bg-primary text-on-primary hover:bg-primary-hover",
          )}
        >
          {paused ? "Paused" : full ? "Waitlist" : "Get seat"}
        </Link>
      </div>

      {/* big return + chart */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="shrink-0">
          <div className="text-[12.5px] text-tertiary">Return {retLabel}</div>
          <div className={cn("tnum mt-1 text-[30px] font-semibold leading-none tracking-tight", up ? "text-up" : "text-down")}>{fmtPct(ret, { sign: true })}</div>
        </div>
        <AreaSpark data={s.spark} up={up} id={`sc-${s.id}`} strokeWidth={1.8} className="h-14 w-full max-w-[150px]" />
      </div>

      {/* key numbers */}
      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-[12px]">
        <div>
          <dt className="text-tertiary">Max drawdown</dt>
          <dd className="tnum mt-1 text-[14px] font-semibold">{fmtPct(s.metrics.maxDrawdown)}</dd>
        </div>
        <div className="text-center">
          <dt className="text-tertiary">Kept</dt>
          <dd className="tnum mt-1 text-[14px] font-semibold">
            {s.compliance.kept}/{s.compliance.settled}
          </dd>
        </div>
        <div className="text-right">
          <dt className="text-tertiary">Seat / 30d</dt>
          <dd className="mt-1">
            <Price value={priceFrom(s)} className="font-mono text-[14px] font-semibold" />
          </dd>
        </div>
      </dl>
    </article>
  );
}
