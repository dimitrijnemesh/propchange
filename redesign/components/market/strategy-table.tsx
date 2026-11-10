"use client";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Avatar, Delta, Pct, Sparkline } from "@/components/common";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { PERIODS, priceFrom, type StrategyWithSpark } from "@/lib/domain";
import { fmtNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ComplianceBadge, MarketBadges, RiskFlagChip, RiskScoreBadge, StateBadge } from "./badges";
import { SeatMeter } from "./seat-meter";

const col = createColumnHelper<StrategyWithSpark & { rank: number }>();

export function StrategyTable({ rows, leaderboard }: { rows: StrategyWithSpark[]; leaderboard?: boolean }) {
  const periodLabel = PERIODS.find((p) => p.value === (rows[0]?.period ?? "1y"))?.label ?? "1Y";
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const sort = sp.get("sort") ?? "compliance";
  const dir = sp.get("dir");

  const sortHeader = (key: string, label: string, tip?: string) => {
    const on = sort === key;
    const Icon = on ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
    const btn = (
      <button
        className={cn("ml-auto inline-flex items-center gap-1 hover:text-text", on && "text-text")}
        onClick={() => {
          const next = new URLSearchParams(sp.toString());
          if (on) next.set("dir", dir === "asc" ? "desc" : "asc");
          else {
            next.set("sort", key);
            next.delete("dir");
          }
          router.replace(`${path}?${next}`, { scroll: false });
        }}
        aria-label={`Sort by ${label}`}
      >
        {label} <Icon className="size-3" />
      </button>
    );
    return tip ? <Tooltip content={tip} asChild>{btn}</Tooltip> : btn;
  };

  const columns = [
    ...(leaderboard
      ? [
          col.accessor("rank", {
            header: "#",
            cell: (c) => <span className="tnum font-semibold text-tertiary">{c.getValue()}</span>,
          }),
        ]
      : []),
    col.accessor("name", {
      header: "Strategy",
      cell: ({ row: { original: s } }) => (
        <div className="flex min-w-[220px] items-start gap-3 py-1">
          <Avatar name={s.traderHandle} size={32} />
          <div className="min-w-0">
            <Link href={`/strategies/${s.slug}`} className="font-semibold hover:text-primary-text">
              {s.name}
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-caption text-tertiary">
              <span>{s.traderHandle}</span>
              <MarketBadges markets={s.markets} />
              {s.state !== "active" ? <StateBadge state={s.state} /> : null}
            </div>
            {s.flags.length ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {s.flags.slice(0, 2).map((f) => (
                  <RiskFlagChip key={f} flag={f} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ),
    }),
    col.display({
      id: "compliance",
      header: () => sortHeader("compliance", "Compliance", "Share of settled Epochs where the Seat Contract was kept"),
      cell: ({ row: { original: s } }) => <ComplianceBadge strategy={s} short />,
    }),
    col.display({
      id: "return",
      header: () => sortHeader("return", `Return ${periodLabel}`),
      cell: ({ row: { original: s } }) => {
        const days = PERIODS.find((p) => p.value === s.period)?.days ?? 365;
        const short = s.metrics.historyDays < days && s.period !== "all";
        return short ? (
          <Tooltip content={`Only ${s.metrics.historyDays} days of history — showing return since start`}>
            <span className="font-semibold">
              <Delta value={s.perf[s.period]} />*
            </span>
          </Tooltip>
        ) : (
          <span className="font-semibold">
            <Delta value={s.perf[s.period]} />
          </span>
        );
      },
    }),
    col.display({
      id: "maxdd",
      header: () => sortHeader("maxdd", "Max DD"),
      cell: ({ row: { original: s } }) => <Pct value={s.metrics.maxDrawdown} className="font-semibold" />,
    }),
    col.display({
      id: "sharpe",
      header: () => sortHeader("sortino", "Sharpe / Sortino"),
      cell: ({ row: { original: s } }) => (
        <span className="tnum">
          <b>{s.metrics.sharpe.toFixed(2)}</b>
          <span className="text-tertiary"> / {s.metrics.sortino.toFixed(2)}</span>
        </span>
      ),
    }),
    col.display({
      id: "risk",
      header: () => <span className="ml-auto">Risk</span>,
      cell: ({ row: { original: s } }) => <RiskScoreBadge score={s.metrics.riskScore} withLabel={false} />,
    }),
    col.display({
      id: "spark",
      header: () => <span className="ml-auto">{["24h", "7d"].includes(rows[0]?.period ?? "") ? "7d" : periodLabel}</span>,
      cell: ({ row: { original: s } }) => <Sparkline data={s.spark} tone={s.spark[s.spark.length - 1] >= s.spark[0] ? "primary" : "down"} />,
    }),
    col.display({
      id: "seats",
      header: () => sortHeader("occupancy", "Seats"),
      cell: ({ row: { original: s } }) => (
        <div className="ml-auto w-[96px]">
          <SeatMeter size="sm" taken={s.seatsTaken} total={s.seatsTotal} />
        </div>
      ),
    }),
    col.display({
      id: "price",
      header: () => sortHeader("price", "Price from"),
      cell: ({ row: { original: s } }) => (
        <span className="tnum whitespace-nowrap">
          <b>{fmtNumber(priceFrom(s))}</b> <span className="text-caption text-tertiary">USDC</span>
        </span>
      ),
    }),
    col.display({
      id: "action",
      header: () => <span className="sr-only">Action</span>,
      cell: ({ row: { original: s } }) => (
        <Link href={`/strategies/${s.slug}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          View
        </Link>
      ),
    }),
  ];

  const table = useReactTable({
    data: rows.map((r, i) => ({ ...r, rank: i + 1 })),
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const firstSticky = leaderboard ? 1 : 0;

  return (
    <div className="scroll-thin overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[1100px] border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="bg-bg-subtle text-caption text-secondary">
              {hg.headers.map((h, i) => (
                <th
                  key={h.id}
                  className={cn(
                    "h-10 whitespace-nowrap px-4 text-right font-medium first:text-left",
                    i === firstSticky && "sticky left-0 z-10 bg-bg-subtle text-left",
                    i < firstSticky && "w-10 text-left",
                  )}
                >
                  <div className={cn("flex", i <= firstSticky ? "justify-start" : "justify-end")}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="group cursor-pointer border-t border-border transition-colors hover:bg-bg-muted"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a,button")) return;
                router.push(`/strategies/${row.original.slug}`);
              }}
            >
              {row.getVisibleCells().map((cell, i) => (
                <td
                  key={cell.id}
                  className={cn(
                    "h-12 px-4 py-2 text-right align-middle",
                    i === firstSticky && "sticky left-0 z-[1] bg-surface text-left group-hover:bg-bg-muted",
                    i < firstSticky && "text-left",
                  )}
                >
                  <div className={cn("flex items-center", i <= firstSticky ? "justify-start" : "justify-end")}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
