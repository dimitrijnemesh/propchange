"use client";
import { Price } from "@/components/layout/currency";
import { ArrowDown, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AreaSpark, ChangePill } from "@/components/common/area-spark";
import { Avatar, Delta, Sparkline } from "@/components/common";
import { Pills } from "@/components/ui/tabs";
import type { SeatRow } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

type Filter = "all" | "crypto" | "forex" | "stocks" | "futures" | "free" | "waitlist";
type Sort = "volume" | "price" | "change" | "occupancy" | "waitlist";

const SORTS: Record<Sort, (a: SeatRow, b: SeatRow) => number> = {
  volume: (a, b) => b.seatsTraded30d - a.seatsTraded30d,
  price: (a, b) => b.marketPrice - a.marketPrice,
  change: (a, b) => b.seatPrice7dChange - a.seatPrice7dChange,
  occupancy: (a, b) => b.seatsTaken / b.seatsTotal - a.seatsTaken / a.seatsTotal,
  waitlist: (a, b) => b.waitlist - a.waitlist,
};

export function SeatMarketTable({ rows }: { rows: SeatRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("volume");
  // render in pages: 136 rows with sparklines at once is heavy on phones
  const [limit, setLimit] = useState(25);
  const list = useMemo(() => {
    const f = rows.filter((r) =>
      filter === "all"
        ? true
        : filter === "free"
          ? r.seatsTaken < r.seatsTotal && r.state !== "paused"
          : filter === "waitlist"
            ? r.waitlist > 0
            : r.markets.includes(filter),
    );
    return [...f].sort(SORTS[sort]);
  }, [rows, filter, sort]);
  const shown = list.slice(0, limit);
  const count = (fn: (r: SeatRow) => boolean) => rows.filter(fn).length;

  const head = (key: Sort, label: string) => (
    <button
      onClick={() => setSort(key)}
      className={cn("ml-auto inline-flex items-center gap-1 hover:text-text", sort === key && "text-text")}
      aria-label={`Sort by ${label}`}
    >
      {label} {sort === key ? <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3" />}
    </button>
  );

  return (
    <div>
      <Pills
        ariaLabel="Filter seats"
        className="mb-3"
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setLimit(25);
        }}
        options={[
          { value: "all", label: `All ${rows.length}` },
          { value: "crypto", label: `Crypto ${count((r) => r.markets.includes("crypto"))}` },
          { value: "forex", label: `Forex ${count((r) => r.markets.includes("forex"))}` },
          { value: "stocks", label: `Stocks ${count((r) => r.markets.includes("stocks"))}` },
          { value: "futures", label: `Futures ${count((r) => r.markets.includes("futures"))}` },
          { value: "free", label: "Has free seats" },
          { value: "waitlist", label: "Waitlist" },
        ]}
      />
      <div className="scroll-thin overflow-x-auto rounded-[22px] border border-border bg-surface">
        <table className="w-full min-w-[760px] text-[14px]">
          <thead className="text-[12.5px] text-tertiary">
            <tr className="border-b border-border">
              <th className="sticky left-0 z-[1] bg-surface px-5 py-3 text-left font-medium">Strategy</th>
              <th className="px-4 py-3 text-right font-medium">
                <div className="flex justify-end">{head("price", "Price")}</div>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <div className="flex justify-end">{head("change", "7d")}</div>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                <div className="flex justify-end">{head("occupancy", "Seats")}</div>
              </th>
              <th className="px-4 py-3 text-right font-medium">30d</th>
              <th className="px-5 py-3">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => {
              const free = Math.max(0, s.seatsTotal - s.seatsTaken);
              return (
                <tr
                  key={s.id}
                  tabIndex={0}
                  role="link"
                  aria-label={`${s.name} — trade ${s.symbol} Seats`}
                  onClick={() => router.push(`/seats/${s.slug}`)}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/seats/${s.slug}`)}
                  className="group h-[72px] cursor-pointer transition-colors hover:bg-bg-subtle"
                >
                  <td className="sticky left-0 z-[1] bg-surface px-5 group-hover:bg-bg-subtle">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.traderHandle} size={38} />
                      <div className="min-w-0">
                        <div className="truncate font-semibold">
                          {s.name}
                          {s.state === "paused" ? <span className="ml-2 text-[12px] font-medium text-warning">Paused</span> : null}
                        </div>
                        <div className="text-[12.5px] text-tertiary">{s.traderHandle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="tnum px-4 text-right">
                    <Price value={s.marketPrice} className="font-mono font-semibold" />
                  </td>
                  <td className="px-4 text-right">
                    <ChangePill v={s.seatPrice7dChange} />
                  </td>
                  <td className="tnum px-4 text-right">
                    {free > 0 ? <span className="text-secondary">{free} free</span> : <span className="text-tertiary">Full</span>}
                  </td>
                  <td className="px-4">
                    <div className="flex justify-end">
                      <AreaSpark data={s.priceHistory} up={s.seatPrice7dChange >= 0} id={`smt-${s.id}`} className="h-9 w-24" />
                    </div>
                  </td>
                  <td className="px-5 text-right">
                    <span className="inline-flex h-9 items-center rounded-full bg-primary px-5 text-[13px] font-semibold text-on-primary transition-colors group-hover:bg-primary-hover">
                      Trade
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {list.length > shown.length ? (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((n) => n + 25)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-5 text-[14px] font-semibold transition-colors hover:border-border-strong hover:bg-bg-subtle"
          >
            Show more <span className="tnum text-tertiary">{shown.length} / {list.length}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
