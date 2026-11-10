"use client";
import { Bell, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SeatPanel, type SeatStrategy } from "@/components/seat/buy-seat";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { fmtNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExchangeAccount } from "@/types/domain";

type Tab = "take" | "seatlist" | "mine";

/** v2 (Platform) action panel: Take Seat · Seatlist · My Seat. No resale — Seats are released back to the Seatlist. */
export function V2ActionPanel({
  s,
  accounts,
  owned,
  daysLeft,
  initial,
}: {
  s: SeatStrategy;
  accounts: ExchangeAccount[];
  owned: number;
  daysLeft: number;
  initial?: string;
}) {
  const full = s.seatsTaken >= s.seatsTotal;
  const [tab, setTab] = useState<Tab>(initial === "bid" || (full && initial !== "take") ? "seatlist" : "take");
  const tabs: { key: Tab; label: string }[] = [
    { key: "take", label: "Take Seat" },
    { key: "seatlist", label: "Seatlist" },
    ...(owned ? [{ key: "mine" as Tab, label: "My Seat" }] : []),
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-1 rounded-lg border border-border bg-surface p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }} role="tablist" aria-label="Seat actions">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn("h-9 rounded-md text-[13.5px] font-semibold transition-colors", tab === t.key ? "bg-primary text-on-primary" : "text-secondary hover:bg-bg-subtle hover:text-text")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "take" ? <SeatPanel s={s} accounts={accounts} /> : null}
      {tab === "seatlist" ? <SeatlistPanel s={s} daysLeft={daysLeft} /> : null}
      {tab === "mine" ? <MySeatPanel s={s} owned={owned} daysLeft={daysLeft} /> : null}
      <Protection />
      <LockedMarket />
    </div>
  );
}

/** Pledge bids: charged only if a Seat is allocated (instant allocation to the highest bids). */
function SeatlistPanel({ s, daysLeft }: { s: SeatStrategy; daysLeft: number }) {
  const toast = useToast();
  const top = Math.round(s.basePriceUsdc * 1.35 * 100) / 100;
  const [bid, setBid] = useState(Math.round(top * 0.95 * 100) / 100);
  const [notify, setNotify] = useState(true);
  const expiring = Math.max(1, Math.round(s.seatsTotal * 0.04));
  // Rank among mock bids spread below the top bid.
  const rank = Math.max(1, Math.min(s.waitlist + 1, Math.round(((top - bid) / top) * 40) + 1));
  return (
    <section className="rounded-xl border border-border bg-surface p-5" aria-label="Seatlist">
      <dl className="grid grid-cols-2 gap-3 text-[12.5px]">
        <div>
          <dt className="text-tertiary">Highest bid</dt>
          <dd className="tnum font-mono text-[15px] font-semibold">{fmtNumber(top)} USDC</dd>
        </div>
        <div>
          <dt className="text-tertiary">Bids</dt>
          <dd className="tnum font-mono text-[15px] font-semibold">{s.waitlist}</dd>
        </div>
        <div>
          <dt className="text-tertiary">Seats expiring</dt>
          <dd className="tnum font-mono text-[15px] font-semibold">{expiring}</dd>
        </div>
        <div>
          <dt className="text-tertiary">Epoch ends in</dt>
          <dd className="tnum font-mono text-[15px] font-semibold">{daysLeft}d</dd>
        </div>
      </dl>
      <label className="mt-4 block">
        <span className="text-[12.5px] font-semibold text-secondary">Your bid per Seat</span>
        <div className="mt-1 flex h-10 items-center rounded-md border border-border-strong px-3 focus-within:border-primary">
          <input
            type="number"
            min={1}
            step={0.5}
            value={bid}
            onChange={(e) => setBid(Number(e.target.value))}
            className="tnum w-full bg-transparent font-mono text-[15px] font-semibold outline-none"
          />
          <span className="text-[12px] text-tertiary">USDC</span>
        </div>
      </label>
      <p className="tnum mt-2 text-[12.5px] text-secondary">
        You would be <b className="text-text">#{rank}</b> of {s.waitlist + 1}
        {rank <= expiring ? " · inside the Seats expiring this Epoch" : ""}
      </p>
      <label className="mt-3 flex items-center justify-between gap-3 text-[12.5px]">
        <span className="inline-flex items-center gap-1.5 text-secondary">
          <Bell className="size-3.5" /> Notify me if outbid
        </span>
        <Switch checked={notify} onCheckedChange={setNotify} label="Notify me if outbid" />
      </label>
      <button
        onClick={() => toast({ kind: "success", title: "You joined the Seatlist", body: `Bid ${fmtNumber(bid)} USDC · #${rank} for ${s.name}. Charged only if you get a Seat.` })}
        className="mt-4 h-11 w-full rounded-md bg-primary text-[14px] font-semibold text-on-primary hover:bg-primary-hover"
      >
        Join Seatlist
      </button>
      <p className="mt-2 text-center text-[11.5px] text-tertiary">A pledge: you are charged only if you get a Seat.</p>
    </section>
  );
}

function MySeatPanel({ s, owned, daysLeft }: { s: SeatStrategy; owned: number; daysLeft: number }) {
  const toast = useToast();
  return (
    <section className="rounded-xl border border-border bg-surface p-5" aria-label="My Seat">
      <dl className="grid grid-cols-2 gap-3 text-[12.5px]">
        <div>
          <dt className="text-tertiary">Your Seats</dt>
          <dd className="tnum font-mono text-[15px] font-semibold">{owned}</dd>
        </div>
        <div>
          <dt className="text-tertiary">Days left</dt>
          <dd className="tnum font-mono text-[15px] font-semibold">{daysLeft}</dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-2">
        <button
          onClick={() => toast({ kind: "success", title: "Seat released", body: `The next bid on the Seatlist gets it. Pro-rata refund for ${daysLeft} unused days, minus x%.` })}
          className="h-10 rounded-md border border-border-strong text-[13.5px] font-semibold hover:bg-bg-subtle"
        >
          Release Seat
        </button>
        <button onClick={() => toast({ kind: "success", title: "Renewal bid placed", body: `${s.name} · next Epoch` })} className="h-10 rounded-md bg-primary text-[13.5px] font-semibold text-on-primary hover:bg-primary-hover">
          Bid to renew
        </button>
        <Link href="/app/seats" className="text-center text-[12.5px] font-semibold text-primary-text hover:underline">
          Manage in My Seats
        </Link>
      </div>
    </section>
  );
}

export function Protection() {
  return (
    <details className="group rounded-xl border border-border bg-surface px-4 py-3 text-[12.5px]">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold">
        <ShieldCheck className="size-4 text-primary-text" /> My protection
        <span className="ml-auto text-tertiary group-open:hidden">Show</span>
      </summary>
      <dl className="mt-3 space-y-1.5 text-secondary">
        {[
          ["Max loss on allocation", "x%"],
          ["Daily loss limit", "x%"],
          ["Max leverage copied", "xx"],
          ["Close positions on limit", "On"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <dt>{k}</dt>
            <dd className="tnum font-mono text-text">{v}</dd>
          </div>
        ))}
      </dl>
      <Link href="/app/risk" className="mt-2 inline-block font-semibold text-primary-text hover:underline">
        Risk settings
      </Link>
    </details>
  );
}

/** v2 shows the v3 market as a subtle locked card. */
function LockedMarket() {
  const toast = useToast();
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-border-strong p-4 text-[12.5px]">
      <Lock className="mt-0.5 size-4 shrink-0 text-tertiary" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Seat Market — coming soon</p>
        <p className="text-tertiary">Seats become tradable tokens after licensing.</p>
      </div>
      <button onClick={() => toast({ kind: "success", title: "We'll let you know", body: "You'll get a notification when the Seat Market opens." })} className="shrink-0 font-semibold text-primary-text hover:underline">
        Notify me
      </button>
    </div>
  );
}
