import { Price } from "@/components/layout/currency";
import Link from "next/link";
import { Clock, Gauge, TrendingUp } from "lucide-react";
import { Avatar } from "@/components/common";
import { ChangePill } from "@/components/common/area-spark";
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
    <section className="min-w-0 rounded-[28px] border border-border bg-surface p-6">
      <h3 className="flex items-center gap-3 text-[19px] font-semibold">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary-text">
          <I className="size-[18px]" strokeWidth={2} />
        </span>
        {title}
      </h3>
      <ol className="mt-3">
        {rows.map((r) => (
          <li key={r.id} className="border-b border-border last:border-b-0">
            <Link prefetch={false} href={`/seats/${r.slug}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-bg-subtle">
              <Avatar name={r.traderHandle} size={36} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{r.name}</span>
              <span className="tnum shrink-0 text-right text-[14px]">{metric(r)}</span>
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
    <div className="grid gap-5 md:grid-cols-3">
      <Board
        title={titles.hot}
        icon={TrendingUp}
        rows={hot}
        metric={(r) => (
          <span className="flex flex-col items-end gap-1">
            <Price value={r.price} className="font-mono text-[15px]" />
            <ChangePill v={r.seatPrice7dChange} />
          </span>
        )}
      />
      <Board
        title={titles.filling}
        icon={Gauge}
        rows={filling}
        metric={(r) => (
          <span className="flex flex-col items-end gap-0.5 leading-5">
            <b>{Math.round((r.seatsTaken / r.seatsTotal) * 100)}%</b>
            <span className="text-[12px] text-tertiary">{r.seatsTotal - r.seatsTaken} left</span>
          </span>
        )}
      />
      <Board
        title={titles.waitlist}
        icon={Clock}
        rows={waitlist}
        metric={(r) => (
          <span className="flex flex-col items-end gap-0.5 leading-5">
            <b>{r.waitlist}</b>
            <span className="text-[12px] text-tertiary">waiting</span>
          </span>
        )}
      />
    </div>
  );
}
