"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { fmtPct, monthNames } from "@/lib/format";
import { dayStats } from "@/lib/series-stats";
import { cn } from "@/lib/utils";
import type { NavPoint } from "@/types/domain";
import { StatStrip } from "./charts";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function cellStyle(r: number) {
  const k = Math.min(1, Math.abs(r) / 0.03); // clamp at ±3%
  const pct = Math.round(10 + k * 55);
  const tone = r >= 0 ? "var(--up)" : "var(--down)";
  return { background: `color-mix(in srgb, ${tone} ${pct}%, var(--surface))` };
}

const signed = (r: number, digits = 2) => fmtPct(r, { sign: true, digits });

/** Calendar of daily P&L (time-weighted daily returns), month by month. */
export function DailyCalendar({ data }: { data: NavPoint[] }) {
  const { byDate, months, overall } = useMemo(() => {
    const byDate = new Map<string, number>();
    for (let i = 1; i < data.length; i++) byDate.set(data[i].date, data[i].nav / data[i - 1].nav - 1);
    const months = [...new Set(data.slice(1).map((p) => p.date.slice(0, 7)))];
    return { byDate, months, overall: dayStats(data) };
  }, [data]);
  // Open on the latest month that has at least 15 days of data.
  const [idx, setIdx] = useState(() => {
    for (let i = months.length - 1; i >= 0; i--) {
      if ([...byDate.keys()].filter((d) => d.startsWith(months[i])).length >= 15) return i;
    }
    return months.length - 1;
  });
  const month = months[idx];
  const [y, m] = month.split("-").map(Number);

  const { weeks, summary } = useMemo(() => {
    const first = new Date(Date.UTC(y, m - 1, 1));
    const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const lead = (first.getUTCDay() + 6) % 7;
    const cells: ({ day: number; date: string; r?: number } | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= daysIn; d++) {
      const date = `${month}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, date, r: byDate.get(date) });
    }
    while (cells.length % 7) cells.push(null);
    const weeks: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const rs = cells.filter((c): c is { day: number; date: string; r: number } => !!c && c.r !== undefined).map((c) => c.r);
    const total = rs.reduce((a, r) => a * (1 + r), 1) - 1;
    return {
      weeks,
      summary: {
        total,
        days: rs.length,
        up: rs.filter((r) => r > 0).length,
        best: rs.length ? Math.max(...rs) : 0,
        worst: rs.length ? Math.min(...rs) : 0,
        avg: rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0,
      },
    };
  }, [y, m, month, byDate]);

  return (
    <div>
      <StatStrip
        items={[
          { label: "Profitable days", value: fmtPct(overall.upDays, { digits: 0 }) },
          { label: "Avg up / down day", value: `${signed(overall.avgUp)} / ${signed(overall.avgDown)}` },
          { label: "Best / worst day", value: `${signed(overall.bestDay)} / ${signed(overall.worstDay)}` },
          { label: "Longest up / down streak", value: `${overall.maxUpStreak} / ${overall.maxDownStreak} days` },
        ]}
      />
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            aria-label="Previous month"
            className="inline-flex size-8 items-center justify-center rounded-md text-secondary hover:bg-bg-subtle disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[120px] text-center font-semibold">
            {monthNames[m - 1]} {y}
          </span>
          <button
            onClick={() => setIdx((i) => Math.min(months.length - 1, i + 1))}
            disabled={idx === months.length - 1}
            aria-label="Next month"
            className="inline-flex size-8 items-center justify-center rounded-md text-secondary hover:bg-bg-subtle disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="tnum flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-caption text-secondary">
          <span>
            Month <b className={summary.total >= 0 ? "text-up" : "text-down"}>{signed(summary.total, 1)}</b>
          </span>
          <span>
            {summary.up}/{summary.days} up days
          </span>
          <span className="hidden sm:inline">Avg {signed(summary.avg)}</span>
        </div>
      </div>
      <div>
        <table className="w-full table-fixed border-separate border-spacing-[3px] md:border-spacing-1">
          <thead>
            <tr className="text-caption text-tertiary">
              {DOW.map((d) => (
                <th key={d} className="font-medium">
                  <span className="md:hidden">{d.slice(0, 2)}</span>
                  <span className="hidden md:inline">{d}</span>
                </th>
              ))}
              <th className="w-[46px] font-semibold text-secondary md:w-[72px]">Wk</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w, wi) => {
              const rs = w.filter((c) => c?.r !== undefined).map((c) => c!.r!);
              const wk = rs.reduce((a, r) => a * (1 + r), 1) - 1;
              return (
                <tr key={wi}>
                  {w.map((c, ci) =>
                    !c ? (
                      <td key={ci} />
                    ) : c.r === undefined ? (
                      <td key={ci} className="h-11 rounded-md bg-bg-subtle p-1 align-top text-[10px] text-disabled md:h-14 md:p-1.5 md:text-[11px]">
                        {c.day}
                      </td>
                    ) : (
                      <td key={ci} className="p-0">
                        <Tooltip asChild content={`${c.date}: ${signed(c.r)} on the day`}>
                          <div tabIndex={0} className="h-11 w-full rounded-md p-1 text-left md:h-14 md:p-1.5" style={cellStyle(c.r)}>
                            <div className="text-[10px] font-medium text-secondary md:text-[11px]">{c.day}</div>
                            <div className="tnum mt-0.5 text-[10px] font-semibold tracking-[-0.02em] md:mt-1 md:text-[12px] md:tracking-normal">
                              {signed(c.r, 1).replace("%", "")}
                              <span className="hidden md:inline">%</span>
                            </div>
                          </div>
                        </Tooltip>
                      </td>
                    ),
                  )}
                  <td className={cn("tnum h-11 rounded-md bg-bg-subtle text-center text-[10px] font-bold md:h-14 md:text-[12px]", rs.length ? (wk >= 0 ? "text-up" : "text-down") : "text-disabled")}>
                    {rs.length ? signed(wk, 1) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-caption text-tertiary">Daily time-weighted returns in %. Color intensity clamped at ±3%. Days with no data are greyed out.</p>
    </div>
  );
}
