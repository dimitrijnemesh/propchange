"use client";
import * as D from "@radix-ui/react-dialog";
import { LayoutGrid, Rows3, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { SheetContent } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Pills } from "@/components/ui/tabs";
import { PERIODS } from "@/lib/domain";
import { cn } from "@/lib/utils";

const markets = [
  { value: "all", label: "All" },
  { value: "crypto", label: "Crypto" },
  { value: "forex", label: "Forex" },
  { value: "stocks", label: "Stocks" },
  { value: "futures", label: "Futures" },
];

export const sortOptions = [
  { value: "compliance", label: "Compliance" },
  { value: "return", label: "Return (period)" },
  { value: "sharpe", label: "Sharpe" },
  { value: "sortino", label: "Sortino" },
  { value: "calmar", label: "Calmar" },
  { value: "maxdd", label: "Max DD (low first)" },
  { value: "seatChange", label: "Seat price change 7d" },
  { value: "volume", label: "Seats traded 30d" },
  { value: "popular", label: "Most popular" },
  { value: "occupancy", label: "Occupancy" },
  { value: "waitlist", label: "Longest waitlist" },
  { value: "price", label: "Price (low first)" },
  { value: "newest", label: "Newest" },
];

const PERIOD_OPTS = PERIODS.map((p) => ({ value: p.value, label: p.label }));

/** Exchange-style performance window: drives the Return column and Return sort. */
export function PeriodSwitch({ className }: { className?: string }) {
  const { sp, set } = useParamsUpdater();
  const cur = sp.get("period") ?? "1y";
  return (
    <div className={cn("flex shrink-0 rounded-md bg-bg-subtle p-0.5", className)} role="radiogroup" aria-label="Performance period">
      {PERIOD_OPTS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={cur === o.value}
          onClick={() => set({ period: o.value === "1y" ? null : o.value })}
          className={cn(
            "h-8 rounded-[6px] px-2.5 font-mono text-[12px] font-semibold transition-colors",
            cur === o.value ? "bg-surface text-text shadow-sm dark:bg-bg-muted" : "text-tertiary hover:text-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function useParamsUpdater() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v === null || v === "" ? next.delete(k) : next.set(k, v)));
    next.delete("page");
    start(() => router.replace(`${path}?${next.toString()}`, { scroll: false }));
  };
  return { sp, set, pending };
}

function Filters({ layout }: { layout: "bar" | "sheet" }) {
  const { sp, set } = useParamsUpdater();
  const [dd, setDd] = useState(Number(sp.get("maxDd") ?? 70));
  useEffect(() => setDd(Number(sp.get("maxDd") ?? 70)), [sp]);
  const sheet = layout === "sheet";
  return (
    <div className={cn(sheet ? "space-y-5" : "flex flex-wrap items-end gap-3")}>
      <div className={sheet ? "" : "w-[150px]"}>
        <Label htmlFor={`venue-${layout}`}>Venue</Label>
        <Select id={`venue-${layout}`} value={sp.get("venue") ?? ""} onChange={(e) => set({ venue: e.target.value })}>
          <option value="">Any venue</option>
          <option>Binance</option>
          <option>Bybit</option>
          <option>MT5</option>
        </Select>
      </div>
      <div className={sheet ? "" : "w-[140px]"}>
        <Label htmlFor={`risk-${layout}`}>Risk level</Label>
        <Select id={`risk-${layout}`} value={sp.get("risk") ?? ""} onChange={(e) => set({ risk: e.target.value })}>
          <option value="">Any risk</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </div>
      <div className={sheet ? "" : "w-[150px]"}>
        <Label htmlFor={`comp-${layout}`}>Min compliance</Label>
        <Select id={`comp-${layout}`} value={sp.get("minCompliance") ?? ""} onChange={(e) => set({ minCompliance: e.target.value })}>
          <option value="">Any</option>
          <option value="70">≥ 70%</option>
          <option value="90">≥ 90%</option>
          <option value="100">100%</option>
        </Select>
      </div>
      <div className={sheet ? "" : "w-[150px]"}>
        <Label htmlFor={`avail-${layout}`}>Availability</Label>
        <Select id={`avail-${layout}`} value={sp.get("avail") ?? ""} onChange={(e) => set({ avail: e.target.value })}>
          <option value="">Any</option>
          <option value="free">Has free seats</option>
          <option value="waitlist">Waitlist</option>
        </Select>
      </div>
      <div className={sheet ? "" : "w-[150px]"}>
        <Label htmlFor={`style-${layout}`}>Style</Label>
        <Select id={`style-${layout}`} value={sp.get("style") ?? ""} onChange={(e) => set({ style: e.target.value })}>
          <option value="">Any style</option>
          <option value="trend">Trend</option>
          <option value="momentum">Momentum</option>
          <option value="breakout">Breakout</option>
          <option value="mean-reversion">Mean reversion</option>
          <option value="carry-arb">Carry / arbitrage</option>
          <option value="scalping">Scalping</option>
          <option value="swing">Swing</option>
        </Select>
      </div>
      <div className={sheet ? "" : "w-[130px]"}>
        <Label htmlFor={`hist-${layout}`}>History</Label>
        <Select id={`hist-${layout}`} value={sp.get("minHistory") ?? ""} onChange={(e) => set({ minHistory: e.target.value })}>
          <option value="">Any</option>
          <option value="90">≥ 90 days</option>
          <option value="180">≥ 6 months</option>
          <option value="365">≥ 1 year</option>
          <option value="730">≥ 2 years</option>
        </Select>
      </div>
      <div className={sheet ? "" : "w-[130px]"}>
        <Label htmlFor={`price-${layout}`}>Seat price</Label>
        <Select id={`price-${layout}`} value={sp.get("maxPrice") ?? ""} onChange={(e) => set({ maxPrice: e.target.value })}>
          <option value="">Any</option>
          <option value="20">≤ 20 USDC</option>
          <option value="30">≤ 30 USDC</option>
          <option value="50">≤ 50 USDC</option>
        </Select>
      </div>
      <div className={sheet ? "" : "w-[120px]"}>
        <Label htmlFor={`sharpe-${layout}`}>Sharpe</Label>
        <Select id={`sharpe-${layout}`} value={sp.get("minSharpe") ?? ""} onChange={(e) => set({ minSharpe: e.target.value })}>
          <option value="">Any</option>
          <option value="1">≥ 1.0</option>
          <option value="1.5">≥ 1.5</option>
          <option value="2">≥ 2.0</option>
        </Select>
      </div>
      <div className={sheet ? "" : "w-[130px]"}>
        <Label htmlFor={`state-${layout}`}>State</Label>
        <Select id={`state-${layout}`} value={sp.get("state") ?? ""} onChange={(e) => set({ state: e.target.value })}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="rookie">Rookie</option>
        </Select>
      </div>
      <div className={sheet ? "" : "w-[200px]"}>
        <Label>Max drawdown ≤ {dd}%</Label>
        <Slider
          label="Max drawdown"
          showBubble={false}
          value={dd}
          min={5}
          max={70}
          format={(v) => `${v}%`}
          onChange={setDd}
          className="-mt-6"
        />
        <CommitDd value={dd} onCommit={(v) => set({ maxDd: v >= 70 ? null : String(v) })} />
      </div>
      <label className={cn("flex h-10 cursor-pointer items-center gap-2 text-[13px] font-medium text-secondary", sheet && "h-auto")}>
        <input
          type="checkbox"
          checked={sp.get("profitable") === "1"}
          onChange={(e) => set({ profitable: e.target.checked ? "1" : null })}
          className="size-4 accent-[var(--primary)]"
        />
        Profitable in period
      </label>
    </div>
  );
}

/** Debounced URL commit for the slider. */
function CommitDd({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const sp = useSearchParams();
  useEffect(() => {
    const cur = Number(sp.get("maxDd") ?? 70);
    if (cur === value) return;
    const t = setTimeout(() => onCommit(value), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return null;
}

export function FilterBar({ total }: { total: number }) {
  const { sp, set, pending } = useParamsUpdater();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if ((sp.get("q") ?? "") !== q) set({ q });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const activeCount = ["venue", "risk", "minCompliance", "avail", "state", "maxDd", "style", "minHistory", "maxPrice", "minSharpe", "profitable"].filter((k) => sp.get(k)).length;
  const view = sp.get("view");
  return (
    <div className="sticky top-14 z-20 -mx-4 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur md:top-16 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          icon={<Search />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search strategy, trader, instrument"
          aria-label="Search strategies"
          className="w-full sm:w-[280px]"
        />
        <Pills
          ariaLabel="Market"
          options={markets}
          value={sp.get("market") ?? "all"}
          onChange={(v) => set({ market: v === "all" ? null : v })}
          className="hidden md:flex"
        />
        <PeriodSwitch className="order-last w-full justify-between overflow-x-auto sm:order-none sm:w-auto" />
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
          {pending ? <span className="text-caption text-tertiary">Updating…</span> : <span className="tnum hidden text-caption text-tertiary sm:inline">{total} results</span>}
          <Select
            aria-label="Sort by"
            className="h-9 w-auto min-w-0 max-w-full"
            value={sp.get("sort") ?? "compliance"}
            onChange={(e) => set({ sort: e.target.value === "compliance" ? null : e.target.value, dir: null })}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </Select>
          {view !== "leaderboard" ? (
            <div className="hidden rounded-md bg-bg-subtle p-0.5 md:flex" role="radiogroup" aria-label="View">
              {[
                { v: "table", I: Rows3, label: "Table" },
                { v: "cards", I: LayoutGrid, label: "Cards" },
              ].map(({ v, I, label }) => {
                const on = (view ?? "table") === v;
                return (
                  <button
                    key={v}
                    role="radio"
                    aria-checked={on}
                    aria-label={label}
                    onClick={() => set({ view: v === "table" ? null : v })}
                    className={cn("inline-flex size-8 items-center justify-center rounded-[6px]", on ? "bg-surface text-text shadow-sm dark:bg-bg-muted" : "text-tertiary hover:text-text")}
                  >
                    <I className="size-4" strokeWidth={1.75} />
                  </button>
                );
              })}
            </div>
          ) : null}
          <D.Root open={open} onOpenChange={setOpen}>
            <D.Trigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal /> Filters{activeCount ? ` · ${activeCount}` : ""}
              </Button>
            </D.Trigger>
            <SheetContent title="Filters" side="bottom">
              <div className="space-y-5 p-4 pb-8">
                <div>
                  <Label>Market</Label>
                  <Pills ariaLabel="Market" options={markets} value={sp.get("market") ?? "all"} onChange={(v) => set({ market: v === "all" ? null : v })} />
                </div>
                <Filters layout="sheet" />
                <div className="flex gap-2">
                  <a href="/strategies" className={cn(buttonVariants({ variant: "outline" }), "flex-1")}>
                    Reset
                  </a>
                  <Button className="flex-1" onClick={() => setOpen(false)}>
                    Show {total} results
                  </Button>
                </div>
              </div>
            </SheetContent>
          </D.Root>
        </div>
      </div>
      <div className="mt-3 hidden items-end gap-3 lg:flex">
        <Filters layout="bar" />
        {activeCount || sp.get("q") || sp.get("market") ? (
          <a href="/strategies" className="mb-2.5 ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-primary-text hover:underline">
            <X className="size-3.5" /> Reset
          </a>
        ) : null}
      </div>
    </div>
  );
}
