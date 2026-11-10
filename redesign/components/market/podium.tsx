import Link from "next/link";
import { Avatar, Delta, Pct, Sparkline } from "@/components/common";
import { ComplianceBadge } from "@/components/market/badges";
import { priceFrom, type StrategyWithSpark } from "@/lib/domain";
import { fmtNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const PLACE = [
  { label: "1st", ring: "ring-2 ring-primary/60", medal: "bg-primary text-on-primary", order: "md:order-2 md:-translate-y-3" },
  { label: "2nd", ring: "ring-1 ring-border-strong", medal: "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-100", order: "md:order-1" },
  { label: "3rd", ring: "ring-1 ring-border-strong", medal: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200", order: "md:order-3" },
];

/** Top-3 most disciplined strategies (Compliance Score, min. 3 settled Epochs). */
export function Podium({ items }: { items: StrategyWithSpark[] }) {
  return (
    <div className="grid gap-4 pt-3 md:grid-cols-3 md:items-end">
      {items.map((s, i) => {
        const p = PLACE[i];
        const ret = s.metrics.historyDays < 365 ? s.metrics.returnAll : s.metrics.return12m;
        return (
          <Link
            key={s.id}
            href={`/strategies/${s.slug}`}
            className={cn(
              "lift group relative rounded-xl bg-surface p-5 shadow-sm transition-[box-shadow,transform] duration-200",
              p.ring,
              p.order,
            )}
          >
            <span className={cn("tnum absolute -top-3 left-5 flex h-7 items-center rounded-full px-3 text-caption font-bold shadow-sm", p.medal)}>
              {p.label} · most disciplined
            </span>
            <div className="mt-2 flex items-start gap-3">
              <Avatar name={s.traderHandle} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[16px] font-semibold group-hover:text-primary-text">{s.name}</div>
                <div className="text-caption text-tertiary">by {s.traderHandle}</div>
              </div>
              <Sparkline data={s.spark} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <ComplianceBadge strategy={s} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 rounded-md bg-bg-subtle px-3 py-2.5 text-[13px]">
              <div>
                <dt className="text-caption text-tertiary">Return</dt>
                <dd className="font-semibold">
                  <Delta value={ret} />
                </dd>
              </div>
              <div>
                <dt className="text-caption text-tertiary">Max DD</dt>
                <dd className="font-semibold">
                  <Pct value={s.metrics.maxDrawdown} />
                </dd>
              </div>
              <div>
                <dt className="text-caption text-tertiary">Seat</dt>
                <dd className="tnum font-semibold">{fmtNumber(priceFrom(s), 0)} USDC</dd>
              </div>
            </dl>
          </Link>
        );
      })}
    </div>
  );
}
