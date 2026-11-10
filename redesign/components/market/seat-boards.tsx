import Link from "next/link";
import { Clock, Gauge, TrendingUp } from "lucide-react";
import { Avatar, Delta } from "@/components/common";
import { fmtNumber } from "@/lib/format";
import type { SeatRow } from "@/lib/mock-api";

function Board({
  title,
  icon: I,
  rows,
  metric,
}: {
  title: string;
  icon: React.ElementType;
  rows: SeatRow[];
  metric: (r: SeatRow) => React.ReactNode;
}) {
  return (
    <section className="lift min-w-0 rounded-lg border border-border bg-surface p-4 shadow-sm transition-[box-shadow,transform] duration-200">
      <h3 className="flex items-center gap-2 font-semibold">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-primary-soft-text">
          <I className="size-3.5" strokeWidth={2} />
        </span>
        {title}
      </h3>
      <ol className="mt-3 space-y-1">
        {rows.map((r, i) => (
          <li key={r.id}>
            <Link href={`/seats/${r.slug}`} className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 transition-colors hover:bg-bg-subtle">
              <span className="tnum w-4 text-center text-caption font-semibold text-tertiary">{i + 1}</span>
              <Avatar name={r.traderHandle} size={24} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{r.name}</span>
              <span className="tnum shrink-0 text-right text-[13px]">{metric(r)}</span>
            </Link>
          </li>
        ))}
        {!rows.length ? <li className="py-4 text-center text-caption text-tertiary">Nothing here right now</li> : null}
      </ol>
    </section>
  );
}

export function SeatBoards({
  hot,
  filling,
  waitlist,
  titles = { hot: "Most in demand", filling: "Filling fast", waitlist: "Longest waitlists" },
}: {
  hot: SeatRow[];
  filling: SeatRow[];
  waitlist: SeatRow[];
  titles?: { hot: string; filling: string; waitlist: string };
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Board
        title={titles.hot}
        icon={TrendingUp}
        rows={hot}
        metric={(r) => (
          <span className="flex flex-col items-end leading-4">
            <b>{fmtNumber(r.price)}</b>
            <Delta value={r.seatPrice7dChange} className="text-[11px]" />
          </span>
        )}
      />
      <Board
        title={titles.filling}
        icon={Gauge}
        rows={filling}
        metric={(r) => (
          <span className="flex flex-col items-end leading-4">
            <b>{Math.round((r.seatsTaken / r.seatsTotal) * 100)}%</b>
            <span className="text-[11px] text-tertiary">{r.seatsTotal - r.seatsTaken} left</span>
          </span>
        )}
      />
      <Board
        title={titles.waitlist}
        icon={Clock}
        rows={waitlist}
        metric={(r) => (
          <span className="flex flex-col items-end leading-4">
            <b>{r.waitlist}</b>
            <span className="text-[11px] text-tertiary">waiting</span>
          </span>
        )}
      />
    </div>
  );
}
