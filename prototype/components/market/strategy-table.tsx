"use client";
import { Price } from "@/components/layout/currency";
import { createColumnHelper, getCoreRowModel, useReactTable, type CellContext, type HeaderContext } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useMemo } from "react";
import { Avatar, Delta, Pct } from "@/components/common";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { PERIODS, priceFrom, type StrategyWithSpark } from "@/lib/domain";

import { cn } from "@/lib/utils";



const col = createColumnHelper<StrategyWithSpark & { rank: number }>();

type Row = StrategyWithSpark & { rank: number };

/**
 * Render a header/cell definition by calling it as a plain function. `flexRender` mounts inline
 * functions as components, so every re-render created new component types and React re-mounted
 * every cell (Links, tooltips) — which re-triggered router updates and looped forever.
 */
function render<C>(def: unknown, ctx: C): React.ReactNode {
  return typeof def === "function" ? (def as (c: C) => React.ReactNode)(ctx) : (def as React.ReactNode);
}

export const StrategyTable = memo(function StrategyTable({ rows, leaderboard }: { rows: StrategyWithSpark[]; leaderboard?: boolean }) {
  const periodLabel = PERIODS.find((p) => p.value === (rows[0]?.period ?? "1y"))?.label ?? "1Y";
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const sort = sp.get("sort") ?? "compliance";
  const dir = sp.get("dir");

  const columns = useMemo(() => {
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

  return [
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
          <Avatar name={s.traderHandle} size={38} />
          <div className="min-w-0">
            <Link prefetch={false} href={`/strategies/${s.slug}`} className="font-semibold hover:text-primary-text">
              {s.name}
            </Link>
            <div className="mt-0.5 truncate text-caption text-tertiary">
              {s.traderHandle} · <span className="capitalize">{s.markets.join(", ")}</span>
            </div>
          </div>
        </div>
      ),
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
      id: "seats",
      header: () => sortHeader("occupancy", "Seats"),
      cell: ({ row: { original: s } }) => {
        const free = Math.max(0, s.seatsTotal - s.seatsTaken);
        return <span className="tnum whitespace-nowrap">{free > 0 ? <span className="text-secondary">{free} free</span> : <span className="text-tertiary">Full</span>}</span>;
      },
    }),
    col.display({
      id: "price",
      header: () => sortHeader("price", "Price from"),
      cell: ({ row: { original: s } }) => (
        <span className="tnum whitespace-nowrap">
          <Price value={priceFrom(s)} className="font-mono font-semibold" />
        </span>
      ),
    }),
    col.display({
      id: "action",
      header: () => <span className="sr-only">Action</span>,
      cell: ({ row: { original: s } }) => (
        <Link
          prefetch={false}
          href={`/strategies/${s.slug}`}
          className={cn(
            "inline-flex h-9 w-[100px] items-center justify-center rounded-full text-[13px] font-semibold transition-colors",
            s.state === "paused"
              ? "pointer-events-none bg-bg-muted text-tertiary"
              : s.seatsTaken >= s.seatsTotal
                ? "border border-border-strong text-text hover:bg-bg-muted"
                : "bg-primary text-on-primary hover:bg-primary-hover",
          )}
        >
          {s.state === "paused" ? "Paused" : s.seatsTaken >= s.seatsTotal ? "Waitlist" : "Get seat"}
        </Link>
      ),
    }),
  ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderboard, periodLabel, sort, dir, path, sp.toString(), rows[0]?.period]);

  const data = useMemo(() => rows.map((r, i) => ({ ...r, rank: i + 1 })), [rows]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const firstSticky = leaderboard ? 1 : 0;

  return (
    <div className="scroll-thin overflow-x-auto rounded-[22px] border border-border bg-surface">
      <table className="w-full min-w-[760px] border-collapse text-[14px]">
        <thead className="sticky top-0 z-10">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border text-[12.5px] text-tertiary">
              {hg.headers.map((h, i) => (
                <th
                  key={h.id}
                  className={cn(
                    "h-11 whitespace-nowrap px-4 text-right font-medium first:pl-5 first:text-left last:pr-5",
                    i === firstSticky && "sticky left-0 z-10 bg-surface text-left",
                    i < firstSticky && "w-10 text-left",
                  )}
                >
                  <div className={cn("flex", i <= firstSticky ? "justify-start" : "justify-end")}>
                    {render<HeaderContext<Row, unknown>>(h.column.columnDef.header, h.getContext())}
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
              className="group cursor-pointer transition-colors hover:bg-bg-subtle"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a,button")) return;
                router.push(`/strategies/${row.original.slug}`);
              }}
            >
              {row.getVisibleCells().map((cell, i) => (
                <td
                  key={cell.id}
                  className={cn(
                    "h-[72px] px-4 text-right align-middle first:pl-5 last:pr-5",
                    i === firstSticky && "sticky left-0 z-[1] bg-surface text-left group-hover:bg-bg-subtle",
                    i < firstSticky && "text-left",
                  )}
                >
                  <div className={cn("flex items-center", i <= firstSticky ? "justify-start" : "justify-end")}>
                    {render<CellContext<Row, unknown>>(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
