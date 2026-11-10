"use client";
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, Delta, Pct, Sparkline } from "@/components/common";
import { ComplianceBadge, StateBadge } from "@/components/market/badges";
import { WatchStar } from "@/components/market/watch-star";
import { SeatIcon } from "@/components/common/seat-icon";
import { useT } from "@/components/layout/i18n-provider";
import { fmtNumber } from "@/lib/format";
import type { MessageKey } from "@/lib/i18n/messages";
import { useWatchlist } from "@/lib/watchlist";
import { cn } from "@/lib/utils";
import type { Market, StrategyState } from "@/types/domain";
import { PERIODS, type Period } from "@/lib/domain";

export interface MarketRow {
  id: string;
  slug: string;
  name: string;
  traderHandle: string;
  venue: string;
  markets: Market[];
  state: StrategyState;
  compliance: { kept: number; settled: number };
  ret: number;
  maxDd: number;
  fresh: boolean;
  perf: Record<Period, number>;
  spark: number[];
  seatsTaken: number;
  seatsTotal: number;
  waitlist: number;
  price: number;
}

type Tab = "fav" | "all" | Market;
type Preset = "smart" | "topReturn" | "lowDd" | "rising";
type Col = "ret" | "maxDd" | "seats" | "price";

const TABS: Tab[] = ["fav", "all", "crypto", "forex", "stocks", "futures"];
const PRESETS: { key: Preset; label: MessageKey }[] = [
  { key: "smart", label: "rank.smart" },
  { key: "topReturn", label: "rank.topReturn" },
  { key: "lowDd", label: "rank.lowDd" },
  { key: "rising", label: "rank.rising" },
];
const TABLE_PERIODS = PERIODS.filter((p) => p.value !== "all");
const colValue = (period: Period): Record<Col, (r: MarketRow) => number> => ({
  ret: (r) => r.perf[period],
  maxDd: (r) => Math.abs(r.maxDd),
  seats: (r) => r.seatsTaken / r.seatsTotal,
  price: (r) => r.price,
});

/** Exchange-style markets table: Favorites + market tabs, ranking presets, sortable columns (top 10). */
export function MarketTable({ rows }: { rows: MarketRow[] }) {
  const t = useT();
  const router = useRouter();
  const favs = useWatchlist();
  const [tab, setTab] = useState<Tab>("all");
  const [preset, setPreset] = useState<Preset>("smart");
  const [sort, setSort] = useState<{ col: Col; dir: "asc" | "desc" } | null>(null);
  const [period, setPeriod] = useState<Period>("1y");

  const inTab = (r: MarketRow, k: Tab) => (k === "all" ? true : k === "fav" ? favs.includes(r.id) : r.markets.includes(k));
  const list = useMemo(() => {
    let l = rows.filter((r) => inTab(r, tab));
    if (preset === "topReturn") l = [...l].sort((a, b) => b.perf[period] - a.perf[period]);
    if (preset === "lowDd") l = [...l].sort((a, b) => Math.abs(a.maxDd) - Math.abs(b.maxDd));
    if (preset === "rising") l = l.filter((r) => r.fresh).sort((a, b) => b.perf[period] - a.perf[period]);
    if (sort) {
      const v = colValue(period)[sort.col];
      l = [...l].sort((a, b) => (sort.dir === "desc" ? v(b) - v(a) : v(a) - v(b)));
    }
    return l;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, tab, preset, sort, favs, period]);
  const shown = list.slice(0, 10);

  const head = (col: Col, label: string) => {
    const on = sort?.col === col;
    const Icon = !on ? ArrowUpDown : sort.dir === "desc" ? ArrowDown : ArrowUp;
    return (
      <button
        type="button"
        onClick={() => setSort(on ? (sort.dir === "desc" ? { col, dir: "asc" } : null) : { col, dir: "desc" })}
        className={cn("ml-auto inline-flex items-center gap-1 transition-colors hover:text-text", on && "text-text")}
        aria-label={`Sort by ${label}`}
      >
        {label} <Icon className={cn("size-3", !on && "opacity-50")} />
      </button>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="scroll-thin flex items-center gap-1 overflow-x-auto border-b border-border px-3" role="tablist">
        {TABS.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={cn(
              "relative inline-flex h-12 shrink-0 items-center px-3 text-[14px] font-semibold transition-colors",
              tab === k ? "text-text" : "text-tertiary hover:text-text",
            )}
          >
            {k === "fav" ? (
              <>
                <Star className={cn("mr-1.5 size-3.5", favs.length && "fill-primary text-primary dark:fill-warning dark:text-warning")} strokeWidth={1.75} />
                {t("fav.tab")}
              </>
            ) : k === "all" ? (
              t("strat.allMarkets")
            ) : (
              t(`market.${k}` as MessageKey)
            )}
            <span className="tnum ml-1.5 text-[12px] font-medium text-tertiary">{rows.filter((r) => inTab(r, k)).length}</span>
            {tab === k ? <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-t-full bg-primary" /> : null}
          </button>
        ))}
        <Link href="/strategies" className="ml-auto hidden shrink-0 items-center gap-1 text-[13px] font-semibold text-primary-text hover:underline sm:inline-flex">
          {t("home.allStrategies")} <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* ranking presets */}
      <div className="scroll-thin flex items-center gap-2 overflow-x-auto px-4 pt-3">
        <span className="shrink-0 text-[12px] text-tertiary">{t("rank.label")}</span>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            aria-pressed={preset === p.key}
            onClick={() => {
              setPreset(p.key);
              setSort(null);
            }}
            className={cn(
              "h-7 shrink-0 rounded-md px-2.5 text-[12.5px] font-semibold transition-colors",
              preset === p.key ? "bg-bg-muted text-text" : "text-tertiary hover:bg-bg-subtle hover:text-text",
            )}
          >
            {t(p.label)}
          </button>
        ))}
        <div className="ml-auto flex shrink-0 rounded-md bg-bg-subtle p-0.5" role="radiogroup" aria-label="Return period">
          {TABLE_PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              role="radio"
              aria-checked={period === p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "h-7 rounded-[6px] px-2 font-mono text-[12px] font-semibold transition-colors",
                period === p.value ? "bg-surface text-text shadow-sm dark:bg-bg-muted" : "text-tertiary hover:text-text",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-14 text-center text-[13px] text-tertiary">
          <Star className="size-6" strokeWidth={1.5} />
          {tab === "fav" ? t("fav.empty") : t("search.noResults")}
        </div>
      ) : (
        <>
        {/* phone: compact app-style list */}
        <ul className="mt-2 md:hidden">
          {shown.map((r) => (
            <li key={r.id} className="flex items-center gap-1 border-t border-border pr-4 first:border-t-0">
              <WatchStar id={r.id} name={r.name} size={15} className="size-9 shrink-0" />
              <Link href={`/strategies/${r.slug}`} className="flex min-w-0 flex-1 items-center gap-3 py-3">
                <Avatar name={r.traderHandle} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold">{r.name}</div>
                  <div className="tnum flex items-center gap-1 truncate text-[12px] text-tertiary">
                    <SeatIcon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                    {r.seatsTaken} / {r.seatsTotal} · {r.traderHandle}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="tnum text-[14px] font-semibold">{fmtNumber(r.price)}</div>
                  <div className="text-[11px] text-tertiary">USDC / 30d</div>
                </div>
                <span
                  className={cn(
                    "tnum inline-flex h-8 w-[74px] shrink-0 items-center justify-center rounded-md text-[13px] font-semibold",
                    r.perf[period] >= 0 ? "bg-up-soft text-up" : "bg-down-soft text-down",
                  )}
                >
                  {r.perf[period] >= 0 ? "+" : ""}
                  {(r.perf[period] * 100).toFixed(1)}%
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="scroll-thin hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-[12px] text-tertiary">
              <tr>
                <th className="w-[72px] py-2.5 pl-3 text-left font-medium">#</th>
                <th className="py-2.5 text-left font-medium">{t("col.strategy")}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t("col.compliance")}</th>
                <th className="px-3 py-2.5 text-right font-medium">{head("ret", `${t("col.return")} ${TABLE_PERIODS.find((p) => p.value === period)?.label}`)}</th>
                <th className="px-3 py-2.5 text-right font-medium">{head("maxDd", t("col.maxdd"))}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t("col.chart")}</th>
                <th className="px-3 py-2.5 text-right font-medium">{head("seats", t("col.seats"))}</th>
                <th className="px-3 py-2.5 text-right font-medium">{head("price", t("col.price"))}</th>
                <th className="py-2.5 pr-4 text-right font-medium">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => {
                const full = r.seatsTaken >= r.seatsTotal;
                const paused = r.state === "paused";
                return (
                  <tr
                    key={r.id}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("a,button")) return;
                      router.push(`/strategies/${r.slug}`);
                    }}
                    className="group h-14 cursor-pointer border-t border-border transition-colors hover:bg-bg-subtle"
                  >
                    <td className="pl-1">
                      <div className="flex items-center gap-0.5">
                        <WatchStar id={r.id} name={r.name} size={15} className="size-7" />
                        <span className="tnum font-mono text-[12px] text-tertiary">{i + 1}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={r.traderHandle} size={30} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link href={`/strategies/${r.slug}`} className="truncate font-semibold hover:text-primary-text">
                              {r.name}
                            </Link>
                            {r.state !== "active" ? <StateBadge state={r.state} /> : null}
                          </div>
                          <div className="text-[12px] text-tertiary">
                            {r.traderHandle} · {r.venue}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 text-right">
                      <ComplianceBadge strategy={r} short />
                    </td>
                    <td className="tnum px-3 text-right font-semibold">
                      <Delta value={r.perf[period]} />
                    </td>
                    <td className="tnum px-3 text-right">
                      <Pct value={r.maxDd} />
                    </td>
                    <td className="px-3">
                      <div className="flex justify-end">
                        <Sparkline data={r.spark} width={88} height={28} tone={r.spark[r.spark.length - 1] >= r.spark[0] ? "up" : "down"} />
                      </div>
                    </td>
                    <td className="tnum px-3 text-right text-[13px]">
                      <div className="inline-flex items-center gap-1 font-semibold">
                        <SeatIcon className="size-3.5 text-tertiary" strokeWidth={1.75} aria-hidden />
                        {r.seatsTaken}
                        <span className="font-normal text-tertiary"> / {r.seatsTotal}</span>
                      </div>
                      <div className="ml-auto mt-1 h-1 w-16 overflow-hidden rounded-full bg-bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (r.seatsTaken / r.seatsTotal) * 100)}%` }} />
                      </div>
                    </td>
                    <td className="tnum px-3 text-right font-semibold">{fmtNumber(r.price)}</td>
                    <td className="pr-4 text-right">
                      <Link
                        href={`/strategies/${r.slug}`}
                        className={cn(
                          "inline-flex h-8 items-center rounded-md px-3 text-[13px] font-semibold transition-colors",
                          paused
                            ? "pointer-events-none bg-bg-muted text-tertiary"
                            : full
                              ? "border border-border-strong text-text hover:bg-bg-muted"
                              : "bg-primary-soft text-primary-soft-text hover:bg-primary hover:text-on-primary",
                        )}
                      >
                        {full ? t("col.waitlist") : t("col.getSeat")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
      {list.length > shown.length ? (
        <Link
          href={tab === "all" || tab === "fav" ? "/strategies" : `/strategies?market=${tab}`}
          className="flex h-11 items-center justify-center gap-1 border-t border-border text-[13px] font-semibold text-primary-text transition-colors hover:bg-bg-subtle"
        >
          {t("home.viewAll")} · {list.length} <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
