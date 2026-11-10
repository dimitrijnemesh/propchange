"use client";
import { ArrowDown, ArrowRight, ArrowUpDown, Clock, Flame, LayoutGrid, Lock, Rows3, Search, SlidersHorizontal, Sparkles, Star, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, Sparkline } from "@/components/common";
import { useEdition } from "@/components/layout/edition-provider";
import { WatchStar } from "@/components/market/watch-star";
import { Badge } from "@/components/ui/badge";
import { PERIODS, type Period } from "@/lib/domain";
import { fmtMoney, fmtNumber, fmtPct } from "@/lib/format";
import type { SeatRow } from "@/lib/mock-api";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/watchlist";
import { ACTION_LABEL, epochLeft, listPrice, seatAction, seatStatus, type SeatStatus } from "./seat-status";

type Tab = "all" | "fav" | "crypto" | "forex" | "stocks" | "futures" | "rookie";
type Chip = SeatStatus | "ending";
type Sort = "volume" | "return" | "price" | "change" | "capacity" | "seatlist" | "kept" | "ending" | "newest" | "dd";
type View = "table" | "cards";

export interface SeatsKpis {
  strategies: number;
  traders: number;
  seatsActive: number;
  keptRate: number;
  seats24h: number;
  volume24h: number;
  seatlist: number;
}

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fav", label: "Favourites" },
  { value: "crypto", label: "Crypto" },
  { value: "forex", label: "FX" },
  { value: "stocks", label: "Stocks" },
  { value: "futures", label: "Futures" },
  { value: "rookie", label: "Rookies" },
];

const SORT_LABEL: Record<Sort, string> = {
  volume: "Most traded",
  return: "Return",
  price: "Seat price",
  change: "Price change",
  capacity: "Capacity used",
  seatlist: "Seatlist bids",
  kept: "Contracts kept",
  dd: "Lowest drawdown",
  ending: "Epoch ending soon",
  newest: "Newest",
};

const kept = (r: SeatRow) => (r.compliance.settled ? r.compliance.kept / r.compliance.settled : 0);
const priceChange = (r: SeatRow, p: Period) => (p === "24h" ? r.change24h : r.seatPrice7dChange);

/** Binance-style Markets page: overview panels, category tabs, status chips, dense table or Polymarket cards. */
export function SeatsMarket({ rows, kpis }: { rows: SeatRow[]; kpis: SeatsKpis }) {
  const edition = useEdition();
  const router = useRouter();
  const watch = useWatchlist();
  const [tab, setTab] = useState<Tab>("all");
  const [chips, setChips] = useState<Chip[]>([]);
  const [period, setPeriod] = useState<Period>("30d");
  const [sort, setSort] = useState<Sort>("volume");
  const [view, setView] = useState<View>("table");
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [venue, setVenue] = useState<string>("all");
  const [maxRisk, setMaxRisk] = useState(100);
  const [limit, setLimit] = useState(25);

  const chipOptions: { value: Chip; label: string }[] = [
    { value: "open", label: "Open now" },
    { value: "full", label: "Seatlist" },
    ...(edition === "v3" ? [{ value: "market" as Chip, label: "On market" }] : []),
    { value: "paused", label: "Paused" },
    { value: "ending", label: "Ending soon" },
  ];

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const sorters: Record<Sort, (a: SeatRow, b: SeatRow) => number> = {
      volume: (a, b) => b.seatsTraded30d - a.seatsTraded30d,
      return: (a, b) => b.perf[period] - a.perf[period],
      price: (a, b) => listPrice(b, edition) - listPrice(a, edition),
      change: (a, b) => priceChange(b, period) - priceChange(a, period),
      capacity: (a, b) => b.seatsTaken / b.seatsTotal - a.seatsTaken / a.seatsTotal,
      seatlist: (a, b) => b.waitlist - a.waitlist,
      kept: (a, b) => kept(b) - kept(a) || b.compliance.settled - a.compliance.settled,
      dd: (a, b) => a.maxDrawdown - b.maxDrawdown,
      ending: (a, b) => a.epochDaysLeft - b.epochDaysLeft,
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    };
    return rows
      .filter((r) => {
        if (tab === "fav" && !watch.includes(r.id)) return false;
        if (tab === "rookie" && r.state !== "rookie") return false;
        if (tab !== "all" && tab !== "fav" && tab !== "rookie" && !r.markets.includes(tab)) return false;
        if (chips.length) {
          // v2 has no resale: "market" rows count as plain Seatlist rows
          const st = seatStatus(r);
          const s = edition === "v2" && st === "market" ? "full" : st;
          const hit = chips.some((c) => (c === "ending" ? r.epochDaysLeft <= 5 && s !== "paused" : c === s));
          if (!hit) return false;
        }
        if (venue !== "all" && r.venue !== venue) return false;
        if (r.riskScore > maxRisk) return false;
        if (needle && !`${r.name} ${r.traderHandle} ${r.symbol}`.toLowerCase().includes(needle)) return false;
        return true;
      })
      .sort(sorters[sort]);
  }, [rows, tab, chips, period, sort, q, venue, maxRisk, watch, edition]);

  const shown = list.slice(0, limit);
  const reset = () => setLimit(25);
  const toggleChip = (c: Chip) => {
    setChips((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
    reset();
  };
  const go = (r: SeatRow, action?: string) => router.push(`/seats/${r.slug}${action ? `?action=${action}` : ""}`);
  const filtersOn = venue !== "all" || maxRisk < 100;

  return (
    <div className="container-market pb-10 pt-4 md:pt-6">
      <Overview rows={rows} kpis={kpis} />

      {/* tabs + controls */}
      <section className="mt-6" aria-label="Seats list">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border">
          <div role="tablist" aria-label="Category" className="scroll-thin -mb-px flex gap-5 overflow-x-auto">
            {TABS.map((t) => {
              const on = tab === t.value;
              return (
                <button
                  key={t.value}
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setTab(t.value);
                    reset();
                  }}
                  className={cn(
                    "flex h-10 shrink-0 items-center gap-1 border-b-2 text-[14px] font-semibold transition-colors",
                    on ? "border-primary text-text dark:border-white" : "border-transparent text-tertiary hover:text-text",
                  )}
                >
                  {t.value === "fav" ? <Star className={cn("size-3.5", on && "fill-current")} strokeWidth={2} /> : null}
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="hidden items-center gap-1 pb-1.5 md:flex" role="radiogroup" aria-label="Period">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                role="radio"
                aria-checked={period === p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "tnum h-7 rounded px-2 text-[12px] font-semibold transition-colors",
                  period === p.value ? "bg-bg-muted text-text" : "text-tertiary hover:text-text",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="scroll-thin flex flex-1 gap-1.5 overflow-x-auto">
            {chipOptions.map((c) => {
              const on = chips.includes(c.value);
              return (
                <button
                  key={c.value}
                  aria-pressed={on}
                  onClick={() => toggleChip(c.value)}
                  className={cn(
                    "h-7 shrink-0 rounded-md border px-2.5 text-[12px] font-semibold transition-colors",
                    on ? "border-primary bg-primary-soft text-primary-soft-text" : "border-border text-secondary hover:border-border-strong hover:text-text",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <label className="relative flex h-8 w-full items-center sm:w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 size-3.5 text-tertiary" />
            <span className="sr-only">Search in the list</span>
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                reset();
              }}
              placeholder="Search strategy, @trader, symbol"
              className="h-8 w-full rounded-md border border-border bg-surface pl-8 pr-7 text-[12.5px] outline-none placeholder:text-tertiary focus:border-primary"
            />
            {q ? (
              <button aria-label="Clear search" onClick={() => setQ("")} className="absolute right-2 text-tertiary hover:text-text">
                <X className="size-3.5" />
              </button>
            ) : null}
          </label>
          <select
            aria-label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-8 rounded-md border border-border bg-surface px-2 text-[12.5px] font-semibold text-text outline-none focus:border-primary"
          >
            {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
              <option key={s} value={s}>
                {SORT_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[12.5px] font-semibold transition-colors",
              filtersOn ? "border-primary text-primary-text" : "border-border text-secondary hover:text-text",
            )}
          >
            <SlidersHorizontal className="size-3.5" /> Filters
          </button>
          <div className="inline-flex h-8 rounded-md border border-border p-0.5" role="radiogroup" aria-label="View">
            {([
              ["table", Rows3],
              ["cards", LayoutGrid],
            ] as const).map(([v, Icon]) => (
              <button
                key={v}
                role="radio"
                aria-checked={view === v}
                aria-label={v === "table" ? "Table view" : "Card view"}
                onClick={() => setView(v)}
                className={cn("inline-flex w-7 items-center justify-center rounded", view === v ? "bg-bg-muted text-text" : "text-tertiary hover:text-text")}
              >
                <Icon className="size-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* period on phones */}
        <div className="scroll-thin mt-2 flex gap-1 overflow-x-auto md:hidden" role="radiogroup" aria-label="Period">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              role="radio"
              aria-checked={period === p.value}
              onClick={() => setPeriod(p.value)}
              className={cn("tnum h-7 shrink-0 rounded px-2.5 text-[12px] font-semibold", period === p.value ? "bg-bg-muted text-text" : "text-tertiary")}
            >
              {p.label}
            </button>
          ))}
        </div>

        {showFilters ? (
          <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3 rounded-lg border border-border bg-bg-subtle p-3 text-[12.5px]">
            <div>
              <div className="mb-1 font-semibold text-secondary">Venue</div>
              <div className="flex gap-1">
                {["all", "Binance", "Bybit", "MT5"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setVenue(v)}
                    className={cn("h-7 rounded-md px-2.5 font-semibold", venue === v ? "bg-surface text-text shadow-sm" : "text-tertiary hover:text-text")}
                  >
                    {v === "all" ? "Any" : v}
                  </button>
                ))}
              </div>
            </div>
            <label className="block w-[220px]">
              <div className="mb-1 flex justify-between font-semibold text-secondary">
                <span>Max risk score</span>
                <span className="tnum font-mono text-text">{maxRisk}</span>
              </div>
              <input type="range" min={10} max={100} step={5} value={maxRisk} onChange={(e) => setMaxRisk(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
            </label>
            {filtersOn ? (
              <button
                onClick={() => {
                  setVenue("all");
                  setMaxRisk(100);
                }}
                className="h-7 font-semibold text-primary-text hover:underline"
              >
                Reset
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mt-3 text-[12px] text-tertiary">
          <span className="tnum">{list.length}</span> strategies
        </div>

        {list.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-border-strong p-10 text-center">
            <p className="font-semibold">{tab === "fav" ? "No favourites yet" : "Nothing matches these filters"}</p>
            <p className="mt-1 text-[13px] text-tertiary">{tab === "fav" ? "Tap the ★ next to a strategy to keep it here." : "Try removing a chip or clearing the search."}</p>
          </div>
        ) : view === "table" ? (
          <>
            <SeatsTable rows={shown} period={period} sort={sort} setSort={setSort} go={go} />
            <MobileList rows={shown} period={period} go={go} />
          </>
        ) : (
          <SeatsCards rows={shown} period={period} go={go} />
        )}

        {list.length > limit ? (
          <div className="mt-4 flex justify-center">
            <button onClick={() => setLimit((l) => l + 25)} className="h-9 rounded-md border border-border px-5 text-[13px] font-semibold text-secondary hover:border-border-strong hover:text-text">
              Load more · <span className="tnum">{list.length - limit}</span> left
            </button>
          </div>
        ) : null}
      </section>

      <HowRow />
    </div>
  );
}

/* ---------- overview: KPIs + 4 panels ---------- */

function Overview({ rows, kpis }: { rows: SeatRow[]; kpis: SeatsKpis }) {
  const edition = useEdition();
  const live = rows.filter((r) => r.state !== "paused");
  const panels = [
    { key: "hot", icon: Flame, title: "Hot Seats", rows: [...live].sort((a, b) => b.waitlist - a.waitlist).slice(0, 4), val: (r: SeatRow) => `${r.waitlist} bids` },
    { key: "gainers", icon: TrendingUp, title: "Top gainers · 30d", rows: [...live].sort((a, b) => b.perf["30d"] - a.perf["30d"]).slice(0, 4), val: (r: SeatRow) => r.perf["30d"] },
    { key: "new", icon: Sparkles, title: "New traders", rows: [...live].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4), val: (r: SeatRow) => r.perf.all },
    { key: "ending", icon: Clock, title: "Epoch ending soon", rows: [...live].sort((a, b) => a.epochDaysLeft - b.epochDaysLeft).slice(0, 4), val: (r: SeatRow) => epochLeft(r) },
  ];
  const kpiList = [
    { label: "Strategies listed", value: fmtNumber(kpis.strategies, 0), sub: `${kpis.traders} traders` },
    { label: "Seats active", value: kpis.seatsActive.toLocaleString("en-US"), sub: "this Epoch" },
    { label: "Contracts kept", value: fmtPct(kpis.keptRate, { digits: 1 }), sub: "all settled Epochs" },
    { label: "Seats taken 24h", value: fmtNumber(kpis.seats24h, 0), sub: edition === "v3" ? `${fmtMoney(kpis.volume24h, { compact: true })} USDC volume` : `${kpis.seatlist} on Seatlists` },
  ];
  return (
    <section aria-label="Market overview">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold leading-7 md:text-[26px]">Seats</h1>
          <p className="text-[13px] text-tertiary">
            {edition === "v3" ? "Every strategy's Seats — mint, buy, sell or bid." : "Take a Seat, copy in your own account. Money-back if the trader breaks the Seat Contract."}
          </p>
        </div>
        <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-2 sm:w-auto sm:grid-cols-4">
          {kpiList.map((k) => (
            <div key={k.label}>
              <dt className="text-[11.5px] text-tertiary">{k.label}</dt>
              <dd className="tnum font-mono text-[17px] font-semibold leading-6">{k.value}</dd>
              <dd className="text-[11px] text-tertiary">{k.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="scroll-thin -mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0">
        {panels.map((p) => (
          <div key={p.key} className="min-w-[260px] snap-start rounded-lg border border-border bg-surface p-3 lg:min-w-0">
            <h2 className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-secondary">
              <p.icon className="size-3.5 text-primary-text" strokeWidth={2} /> {p.title}
            </h2>
            <ul>
              {p.rows.map((r) => {
                const v = p.val(r);
                return (
                  <li key={r.id}>
                    <Link href={`/seats/${r.slug}`} className="-mx-1.5 flex h-9 items-center gap-2 rounded px-1.5 hover:bg-bg-muted">
                      <Avatar name={r.traderHandle} size={20} />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{r.name}</span>
                      <span className="tnum font-mono text-[12.5px] text-secondary">{fmtNumber(listPrice(r, edition))}</span>
                      <span className={cn("tnum w-[64px] text-right font-mono text-[12.5px] font-semibold", typeof v === "number" ? (v >= 0 ? "text-up" : "text-down") : "text-text")}>
                        {typeof v === "number" ? fmtPct(v, { sign: true }) : v}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- table ---------- */

function ActionButton({ r, go, className }: { r: SeatRow; go: (r: SeatRow, a?: string) => void; className?: string }) {
  const edition = useEdition();
  const a = seatAction(r, edition);
  return (
    <button
      disabled={a === "paused"}
      onClick={(e) => {
        e.stopPropagation();
        go(r, a);
      }}
      className={cn(
        "inline-flex h-7 min-w-[76px] items-center justify-center rounded-md px-3 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        a === "take" || a === "mint" || a === "buy"
          ? "bg-primary text-on-primary hover:bg-primary-hover"
          : a === "bid"
            ? "border border-primary text-primary-text hover:bg-primary-soft"
            : "bg-bg-muted text-tertiary",
        className,
      )}
    >
      {ACTION_LABEL[a]}
    </button>
  );
}

function Capacity({ r }: { r: SeatRow }) {
  const pct = Math.min(1, r.seatsTaken / Math.max(1, r.seatsTotal));
  return (
    <div className="ml-auto w-[92px]">
      <div className="tnum mb-1 text-right font-mono text-[12px]">
        {r.seatsTaken}
        <span className="text-tertiary">/{r.seatsTotal}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-bg-muted">
        <div className={cn("h-full rounded-full", pct >= 1 ? "bg-text" : "bg-primary")} style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}

function NameCell({ r }: { r: SeatRow }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar name={r.traderHandle} size={28} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-semibold">{r.name}</span>
          {r.state === "rookie" ? <Badge variant="neutral">Rookie</Badge> : null}
          {r.state === "paused" ? <Badge variant="outline">Paused</Badge> : null}
        </div>
        <div className="truncate text-[11.5px] text-tertiary">
          <span className="font-mono font-semibold text-secondary">{r.symbol}</span> · {r.traderHandle} · {r.venue}
        </div>
      </div>
    </div>
  );
}

function SeatsTable({
  rows,
  period,
  sort,
  setSort,
  go,
}: {
  rows: SeatRow[];
  period: Period;
  sort: Sort;
  setSort: (s: Sort) => void;
  go: (r: SeatRow, a?: string) => void;
}) {
  const edition = useEdition();
  const head = (key: Sort | null, label: string, align: "left" | "right" = "right") => (
    <th className={cn("px-3 py-2 font-medium", align === "right" ? "text-right" : "text-left")}>
      {key ? (
        <button onClick={() => setSort(key)} className={cn("inline-flex items-center gap-1 hover:text-text", sort === key && "text-text")} aria-label={`Sort by ${label}`}>
          {label} {sort === key ? <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-50" />}
        </button>
      ) : (
        label
      )}
    </th>
  );
  return (
    <div className="scroll-thin mt-2 hidden overflow-x-auto rounded-lg border border-border bg-surface md:block">
      <table className="w-full min-w-[1120px] text-[13px]">
        <thead className="border-b border-border text-[11.5px] text-tertiary">
          <tr>
            <th className="w-9 px-1 py-2" aria-label="Favourite" />
            {head(null, "Strategy / trader", "left")}
            {head("price", edition === "v3" ? "Last price" : "Seat price")}
            {head("change", `Change ${period === "24h" ? "24h" : "7d"}`)}
            {head("return", `Return ${PERIODS.find((p) => p.value === period)?.label}`)}
            {head("dd", "Max DD")}
            {head("kept", "Kept")}
            {head("capacity", "Capacity")}
            {head("seatlist", "Seatlist")}
            {head("ending", "Epoch")}
            <th className="px-3 py-2 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => {
            const ch = priceChange(r, period);
            const ret = r.perf[period];
            return (
              <tr
                key={r.id}
                tabIndex={0}
                role="link"
                aria-label={`${r.name} by ${r.traderHandle}`}
                onClick={() => go(r)}
                onKeyDown={(e) => e.key === "Enter" && go(r)}
                className="h-14 cursor-pointer transition-colors hover:bg-bg-muted"
              >
                <td className="px-1 text-center">
                  <WatchStar id={r.id} name={r.name} size={15} className="size-7" />
                </td>
                <td className="max-w-[280px] px-3">
                  <NameCell r={r} />
                </td>
                <td className="tnum px-3 text-right font-mono font-semibold">
                  {fmtNumber(listPrice(r, edition))}
                  <div className="text-[10.5px] font-normal text-tertiary">USDC</div>
                </td>
                <td className={cn("tnum px-3 text-right font-mono font-semibold", ch >= 0 ? "text-up" : "text-down")}>{fmtPct(ch, { sign: true, digits: 2 })}</td>
                <td className="px-3">
                  <div className="flex items-center justify-end gap-2">
                    <Sparkline data={r.priceHistory} width={64} height={24} tone={ret >= 0 ? "up" : "down"} />
                    <span className={cn("tnum w-[58px] text-right font-mono font-semibold", ret >= 0 ? "text-up" : "text-down")}>{fmtPct(ret, { sign: true })}</span>
                  </div>
                </td>
                <td className="tnum px-3 text-right font-mono">{fmtPct(r.maxDrawdown)}</td>
                <td className="tnum px-3 text-right font-mono">
                  {r.compliance.settled ? (
                    <>
                      {r.compliance.kept}
                      <span className="text-tertiary">/{r.compliance.settled}</span>
                    </>
                  ) : (
                    <span className="text-tertiary">new</span>
                  )}
                </td>
                <td className="px-3">
                  <Capacity r={r} />
                </td>
                <td className="tnum px-3 text-right font-mono">
                  {r.waitlist || <span className="text-tertiary">—</span>}
                  {edition === "v3" && r.waitlist ? <div className="text-[10.5px] text-tertiary">top {fmtNumber(r.marketPrice * 1.08)}</div> : null}
                </td>
                <td className="tnum px-3 text-right font-mono text-secondary">{r.state === "paused" ? "—" : epochLeft(r)}</td>
                <td className="px-3 text-right">
                  <ActionButton r={r} go={go} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Phones: Binance-app style compact rows (name · price · change · action). */
function MobileList({ rows, period, go }: { rows: SeatRow[]; period: Period; go: (r: SeatRow, a?: string) => void }) {
  const edition = useEdition();
  return (
    <ul className="mt-1 divide-y divide-border md:hidden">
      {rows.map((r) => {
        const ret = r.perf[period];
        return (
          <li key={r.id} className="flex h-16 items-center gap-2" onClick={() => go(r)}>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[14px] font-semibold">{r.name}</span>
                {r.state === "rookie" ? <Badge variant="neutral">Rookie</Badge> : null}
              </div>
              <div className="tnum truncate text-[11.5px] text-tertiary">
                {r.traderHandle} · {r.seatsTaken}/{r.seatsTotal} Seats{r.waitlist ? ` · ${r.waitlist} bids` : ""}
              </div>
            </div>
            <div className="text-right">
              <div className="tnum font-mono text-[14px] font-semibold">{fmtNumber(listPrice(r, edition))}</div>
              <div className={cn("tnum font-mono text-[11.5px] font-semibold", ret >= 0 ? "text-up" : "text-down")}>{fmtPct(ret, { sign: true })}</div>
            </div>
            <ActionButton r={r} go={go} className="min-w-[72px]" />
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- cards ---------- */

function SeatsCards({ rows, period, go }: { rows: SeatRow[]; period: Period; go: (r: SeatRow, a?: string) => void }) {
  const edition = useEdition();
  return (
    <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rows.map((r) => {
        const ret = r.perf[period];
        const left = r.seatsTotal - r.seatsTaken;
        return (
          <div
            key={r.id}
            role="link"
            tabIndex={0}
            onClick={() => go(r)}
            onKeyDown={(e) => e.key === "Enter" && go(r)}
            className="flex cursor-pointer flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong"
          >
            <div className="flex items-start justify-between gap-2">
              <NameCell r={r} />
              <WatchStar id={r.id} name={r.name} size={15} className="-mr-1.5 -mt-1 size-7 shrink-0" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="tnum font-mono text-[24px] font-semibold leading-7">{fmtNumber(listPrice(r, edition))}</div>
                <div className="text-[11px] text-tertiary">USDC per Seat</div>
              </div>
              <div className="text-right">
                <div className={cn("tnum font-mono text-[15px] font-semibold", ret >= 0 ? "text-up" : "text-down")}>{fmtPct(ret, { sign: true })}</div>
                <div className="text-[11px] text-tertiary">return {PERIODS.find((p) => p.value === period)?.label}</div>
              </div>
            </div>
            <Sparkline data={r.priceHistory} width={260} height={40} tone={ret >= 0 ? "up" : "down"} className="mt-2 w-full" />
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-bg-muted">
              <div className={cn("h-full rounded-full", left <= 0 ? "bg-text" : "bg-primary")} style={{ width: `${Math.min(1, r.seatsTaken / r.seatsTotal) * 100}%` }} />
            </div>
            <div className="tnum mt-1.5 flex justify-between text-[11.5px] text-secondary">
              <span>{left > 0 ? `${left} Seats left` : "Full"}</span>
              <span>{r.waitlist ? `${r.waitlist} on Seatlist` : "No bids"}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
              <span className="tnum inline-flex items-center gap-1 text-[11.5px] text-tertiary">
                <Clock className="size-3" /> {r.state === "paused" ? "Paused" : `Epoch ends in ${epochLeft(r)}`}
              </span>
              <ActionButton r={r} go={go} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- footer row ---------- */

function HowRow() {
  const edition = useEdition();
  const steps = ["Analyze", "Take a Seat", "Copy with protection", "Settle"];
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-bg-subtle px-4 py-3 text-[12.5px]">
      <span className="font-semibold">How Seats work</span>
      {steps.map((s, i) => (
        <span key={s} className="inline-flex items-center gap-2 text-secondary">
          <span className="tnum flex size-5 items-center justify-center rounded-full bg-surface font-mono text-[11px] font-semibold text-text">{i + 1}</span>
          {s}
          {i < steps.length - 1 ? <ArrowRight className="size-3 text-tertiary" /> : null}
        </span>
      ))}
      <Link href="/how-it-works" className="ml-auto font-semibold text-primary-text hover:underline">
        Learn more
      </Link>
      {edition === "v2" ? (
        <span className="inline-flex w-full items-center gap-1.5 text-tertiary">
          <Lock className="size-3" /> Seat Market — coming soon. Seats become tradable after licensing.
        </span>
      ) : null}
    </div>
  );
}
