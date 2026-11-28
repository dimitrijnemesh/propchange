"use client";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/common";
import { AreaSpark } from "@/components/common/area-spark";
import { Price } from "@/components/layout/currency";
import { fmtPct } from "@/lib/format";
import type { SeatRow } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

type Risk = "calm" | "balanced" | "bold";
type Market = "any" | "crypto" | "forex" | "stocks";
type Budget = 30 | 60 | 999;

const Q = {
  risk: [
    { v: "calm" as Risk, label: "Calm", hint: "small swings" },
    { v: "balanced" as Risk, label: "Balanced", hint: "some swings" },
    { v: "bold" as Risk, label: "Bold", hint: "bigger swings" },
  ],
  market: [
    { v: "any" as Market, label: "Any" },
    { v: "crypto" as Market, label: "Crypto" },
    { v: "forex" as Market, label: "Forex" },
    { v: "stocks" as Market, label: "Stocks" },
  ],
  budget: [
    { v: 30 as Budget, label: "≤ $30" },
    { v: 60 as Budget, label: "≤ $60" },
    { v: 999 as Budget, label: "Any" },
  ],
};

// risk score bands (0–100) behind each answer
const BAND: Record<Risk, [number, number]> = { calm: [0, 35], balanced: [25, 60], bold: [50, 100] };

function Pills<T extends string | number>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; hint?: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[14px] font-semibold transition-colors",
            value === o.v ? "border-primary bg-primary text-on-primary" : "border-border text-secondary hover:border-border-strong hover:text-text",
          )}
        >
          {o.label}
          {o.hint ? <span className={cn("text-[12px] font-normal", value === o.v ? "text-white/75" : "text-tertiary")}>{o.hint}</span> : null}
        </button>
      ))}
    </div>
  );
}

/**
 * "Find your Seat in 3 questions": risk, market and budget pick three matching strategies, shown side by side so
 * they can be compared at a glance (return, risk, price, Seats left).
 */
export function SeatFinder({ rows }: { rows: SeatRow[] }) {
  const [risk, setRisk] = useState<Risk>("balanced");
  const [market, setMarket] = useState<Market>("any");
  const [budget, setBudget] = useState<Budget>(60);

  const picks = useMemo(() => {
    const [lo, hi] = BAND[risk];
    const ok = (r: SeatRow) => r.state !== "paused" && r.seatsTaken < r.seatsTotal && (market === "any" || r.markets.includes(market)) && r.price <= budget;
    let list = rows.filter((r) => ok(r) && r.riskScore >= lo && r.riskScore <= hi);
    if (list.length < 3) list = rows.filter(ok); // relax risk before showing nothing
    return [...list].sort((a, b) => b.ret - a.ret).slice(0, 3);
  }, [rows, risk, market, budget]);

  return (
    <section aria-label="Find your Seat" className="py-16 md:py-24">
      <div className="container-market">
        <div className="mx-auto max-w-[1140px]">
          <h2 data-reveal className="text-[36px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
            Find your Seat
            <br />
            in 3 questions
          </h2>

          <div data-reveal="1" className="mt-10 grid gap-6 md:grid-cols-3">
            <div>
              <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-tertiary">1 · Risk</div>
              <Pills label="Risk" value={risk} onChange={setRisk} options={Q.risk} />
            </div>
            <div>
              <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-tertiary">2 · Market</div>
              <Pills label="Market" value={market} onChange={setMarket} options={Q.market} />
            </div>
            <div>
              <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-tertiary">3 · Seat price</div>
              <Pills label="Seat price" value={budget} onChange={setBudget} options={Q.budget} />
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {picks.map((r, i) => {
              const up = r.ret >= 0;
              const left = r.seatsTotal - r.seatsTaken;
              return (
                <Link
                  key={r.id}
                  prefetch={false}
                  href={`/strategies/${r.slug}`}
                  className="lift flex flex-col rounded-[28px] bg-surface p-6 ring-1 ring-border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={r.traderHandle} size={40} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[17px] font-semibold tracking-[-0.02em]">{r.name}</div>
                      <div className="truncate text-[13px] text-tertiary">
                        {r.traderHandle} · {r.venue}
                      </div>
                    </div>
                    {i === 0 ? <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary-text">Best match</span> : null}
                  </div>
                  <AreaSpark data={r.priceHistory} up={r.priceHistory[r.priceHistory.length - 1] >= r.priceHistory[0]} id={`sf-${r.id}`} className="mt-5 h-16 w-full" />
                  <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-[12px]">
                    <div>
                      <dt className="text-tertiary">Return</dt>
                      <dd className={cn("mt-1 text-[16px] font-semibold", up ? "text-up" : "text-down")}>{fmtPct(r.ret, { sign: true })}</dd>
                    </div>
                    <div className="text-center">
                      <dt className="text-tertiary">Seats left</dt>
                      <dd className="mt-1 text-[16px] font-semibold">{left}</dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-tertiary">Seat</dt>
                      <dd className="mt-1">
                        <Price value={r.price} className="text-[16px] font-semibold" />
                      </dd>
                    </div>
                  </dl>
                  <span className="mt-5 inline-flex items-center gap-1.5 self-start border-b border-text pb-0.5 text-[14px] font-medium">
                    View strategy <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              );
            })}
            {!picks.length ? <p className="text-secondary">No free Seats match — try a higher Seat price or “Any” market.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
