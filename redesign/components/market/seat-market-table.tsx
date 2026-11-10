"use client";
import { ArrowDown, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, Delta, Sparkline } from "@/components/common";
import { Pills } from "@/components/ui/tabs";
import { fmtNumber } from "@/lib/format";
import type { SeatRow } from "@/lib/mock-api";
import { cn } from "@/lib/utils";
import { ComplianceBadge, StateBadge } from "./badges";
import { SeatMeter } from "./seat-meter";

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
      <div className="scroll-thin overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-bg-subtle text-caption text-secondary">
            <tr>
              <th className="sticky left-0 z-[1] bg-bg-subtle px-4 py-2.5 text-left font-medium">Strategy</th>
              <th className="px-4 py-2.5 text-right font-medium">
                <div className="flex justify-end">{head("price", "Market price")}</div>
              </th>
              <th className="px-4 py-2.5 text-right font-medium">
                <div className="flex justify-end">{head("change", "7d")}</div>
              </th>
              <th className="px-4 py-2.5 text-right font-medium">
                <div className="flex justify-end">{head("occupancy", "Occupancy")}</div>
              </th>
              <th className="px-4 py-2.5 text-right font-medium">
                <div className="flex justify-end">{head("waitlist", "Waitlist")}</div>
              </th>
              <th className="px-4 py-2.5 text-right font-medium">Compliance</th>
              <th className="px-4 py-2.5 text-right font-medium">
                <div className="flex justify-end">{head("volume", "Seats traded 30d")}</div>
              </th>
              <th className="px-4 py-2.5 text-right font-medium">Price 30d</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shown.map((s) => (
              <tr
                key={s.id}
                tabIndex={0}
                role="link"
                aria-label={`${s.name} — trade ${s.symbol} Seats`}
                onClick={() => router.push(`/seats/${s.slug}`)}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/seats/${s.slug}`)}
                className="group h-12 cursor-pointer transition-colors hover:bg-bg-muted"
              >
                <td className="sticky left-0 z-[1] bg-surface px-4 py-2 group-hover:bg-bg-muted">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.traderHandle} size={28} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="truncate">{s.name}</span> {s.state !== "active" ? <StateBadge state={s.state} /> : null}
                      </div>
                      <div className="text-caption text-tertiary">
                        <span className="font-mono font-semibold text-secondary">{s.symbol}</span> · {s.traderHandle} · {s.venue}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="tnum px-4 text-right">
                  <div className="font-semibold">{fmtNumber(s.marketPrice)} USDC</div>
                  <div className={cn("text-[11.5px]", s.premium >= 0 ? "text-up" : "text-down")}>
                    {s.premium >= 0 ? "+" : ""}
                    {(s.premium * 100).toFixed(1)}% vs curve {fmtNumber(s.price)}
                  </div>
                </td>
                <td className="px-4 text-right font-semibold">
                  <Delta value={s.seatPrice7dChange} arrow />
                </td>
                <td className="px-4">
                  <div className="ml-auto w-[110px]">
                    <SeatMeter size="sm" taken={s.seatsTaken} total={s.seatsTotal} />
                  </div>
                </td>
                <td className="tnum px-4 text-right">{s.waitlist || "—"}</td>
                <td className="px-4 text-right">
                  <ComplianceBadge strategy={s} short />
                </td>
                <td className="tnum px-4 text-right">{s.seatsTraded30d}</td>
                <td className="px-4">
                  <div className="flex justify-end">
                    <Sparkline data={s.priceHistory} tone={s.seatPrice7dChange >= 0 ? "up" : "down"} />
                  </div>
                </td>
              </tr>
            ))}
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
