import Image from "next/image";
import { Bell, Check, CircleUserRound, Grid2x2, Landmark, RotateCcw, Search, Users } from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import { fmtPct } from "@/lib/format";
import type { SeatRow } from "@/lib/mock-api";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./landing-sections";

function MiniLine({ data, up, className }: { data: number[]; up: boolean; className?: string }) {
  const w = 60;
  const h = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const d = data.map((v, i) => `${i ? "L" : "M"}${((i / (data.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / (max - min || 1)) * (h - 4)).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke={up ? "var(--up)" : "var(--down)"} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Portfolio curve for the mock app screen (fixed shape, decoration only). */
const CURVE = [38, 40, 37, 42, 41, 45, 43, 47, 46, 52, 50, 55, 53, 58, 61, 59, 64, 66, 63, 68];

function SeatList({ title, rows }: { title: string; rows: SeatRow[] }) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-surface p-2.5">
      <div className="mb-1 text-[10px] font-semibold">{title}</div>
      {rows.map((r) => (
        <div key={r.id} className="flex items-center gap-2 py-1.5">
          <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{r.name}</span>
          <MiniLine data={r.priceHistory} up={r.seatPrice7dChange >= 0} className="h-3.5 w-10" />
          <span className="tnum w-11 text-right font-mono text-[10px]">${r.price.toFixed(2)}</span>
          <span className={cn("tnum w-10 text-right text-[9.5px] font-semibold", r.seatPrice7dChange >= 0 ? "text-up" : "text-down")}>
            {fmtPct(r.seatPrice7dChange, { sign: true })}
          </span>
        </div>
      ))}
    </div>
  );
}

/** A PropChange "app" screen drawn in HTML (theme-aware), auto-scrolling like a screen recording. */
function PhoneScreen({ hot, gainers }: { hot: SeatRow[]; gainers: SeatRow[] }) {
  const max = Math.max(...CURVE);
  const min = Math.min(...CURVE);
  const pts = CURVE.map((v, i) => `${((i / (CURVE.length - 1)) * 200).toFixed(1)},${(60 - ((v - min) / (max - min)) * 52).toFixed(1)}`).join(" ");
  const tiles = [
    { I: SeatIcon, label: "Seats" },
    { I: Users, label: "Traders" },
    { I: Landmark, label: "Escrow" },
    { I: RotateCcw, label: "Refunds" },
    { I: Grid2x2, label: "More" },
  ];
  return (
    <div className="app-scroll px-3.5 pb-6 text-text">
      <div className="flex items-center gap-2 pt-1">
        <CircleUserRound className="size-4 text-secondary" strokeWidth={1.75} />
        <div className="flex h-6 flex-1 items-center gap-1.5 rounded-full bg-bg-muted px-2.5 text-[9.5px] text-tertiary">
          <Search className="size-3" /> BTC Basis Arb
        </div>
        <Bell className="size-4 text-secondary" strokeWidth={1.75} />
      </div>

      <div className="mt-4 text-[9.5px] text-tertiary">Seats value</div>
      <div className="tnum mt-0.5 text-[22px] font-semibold tracking-tight">
        1,248.60 <span className="text-[10px] font-medium text-secondary">USDC</span>
      </div>
      <div className="text-[9.5px] font-semibold text-up">+4.2% · 7d</div>
      <svg viewBox="0 0 200 62" className="mt-2 h-14 w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="app-curve" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,62 ${pts} 200,62`} fill="url(#app-curve)" />
        <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <span className="rounded-full bg-bg-muted py-1.5 text-center text-[10px] font-semibold">Deposit</span>
        <span className="rounded-full bg-primary py-1.5 text-center text-[10px] font-semibold text-on-primary">Get a seat</span>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1 text-center">
        {tiles.map(({ I, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-bg-muted">
              <I className="size-3.5" strokeWidth={1.75} />
            </span>
            <span className="text-[8.5px] text-secondary">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary-soft px-2.5 py-2">
        <RotateCcw className="size-3.5 shrink-0 text-primary-text" />
        <span className="text-[9.5px] leading-snug">
          <b>Refund available.</b> Rules were broken, so 38.15 USDC is back in your wallet.
        </span>
      </div>

      <SeatList title="Hot Seats" rows={hot} />
      <SeatList title="Top gainers" rows={gainers} />
    </div>
  );
}

/**
 * MEXC-style "take it anywhere" card: a phone breaking out of the top of a wide card, showing a
 * PropChange app screen that scrolls by itself, with a QR on the right.
 */
export function AppShowcase({ hot, gainers }: { hot: SeatRow[]; gainers: SeatRow[] }) {
  return (
    <section aria-label="PropChange on any device" className="container-market pb-16 pt-10 md:pb-24">
      <Eyebrow>Web app</Eyebrow>
      <h2 className="mt-4 text-center text-[28px] font-semibold tracking-[-0.03em] md:text-[40px]">Take your Seat anywhere</h2>
      <div className="glow-border relative mx-auto mt-24 grid max-w-[1140px] items-center rounded-[28px] bg-gradient-to-br from-surface to-bg md:mt-28 md:min-h-[440px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* card backdrop: grid + glow behind the phone */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
          <div className="hero-bg-grid absolute inset-0 opacity-80" />
          <div className="absolute left-[8%] top-1/2 size-[420px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--hero-glow-a),transparent_65%)]" />
        </div>
        {/* phone: a full iPhone (19.5:9) that pokes a little above the card */}
        <div className="relative -mt-16 flex justify-center py-0 md:-mt-20 md:mb-10">
          <Image src="/brand/hero/coin.png" alt="" width={120} height={120} className="hero-item absolute left-[6%] top-[22%] z-10 hidden h-auto w-16 md:block" style={{ animationDuration: "5.2s" }} />
          <Image src="/brand/hero/shield.png" alt="" width={120} height={120} className="hero-item absolute right-[4%] top-[58%] z-10 hidden h-auto w-[72px] md:block" style={{ animationDelay: "-3s", animationDuration: "6.4s" }} />
          <div className="relative h-[520px] w-[254px] shrink-0 rounded-[46px] bg-[#1d1f25] p-[10px] shadow-[0_30px_70px_-25px_rgba(59,99,255,0.35),inset_0_0_0_1.5px_#3a3d46]">
            {/* side buttons */}
            <span aria-hidden className="absolute -left-[3px] top-[96px] h-7 w-[3px] rounded-l bg-[#2c2f37]" />
            <span aria-hidden className="absolute -left-[3px] top-[140px] h-12 w-[3px] rounded-l bg-[#2c2f37]" />
            <span aria-hidden className="absolute -left-[3px] top-[198px] h-12 w-[3px] rounded-l bg-[#2c2f37]" />
            <span aria-hidden className="absolute -right-[3px] top-[160px] h-16 w-[3px] rounded-r bg-[#2c2f37]" />
            <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[37px] bg-bg">
              <div className="relative flex h-9 shrink-0 items-center justify-between px-6 pt-1 text-[11px] font-semibold text-text">
                <span>9:41</span>
                <span className="absolute left-1/2 top-2 h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-black" />
                <span className="flex items-center gap-1">
                  <span className="tracking-tight">5G</span>
                  <span className="inline-block h-[9px] w-[18px] rounded-[3px] border border-current p-[1px]"><span className="block h-full w-3/4 rounded-[1px] bg-current" /></span>
                </span>
              </div>
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <PhoneScreen hot={hot} gainers={gainers} />
              </div>
              {/* home indicator */}
              <span aria-hidden className="absolute bottom-2 left-1/2 h-[4px] w-24 -translate-x-1/2 rounded-full bg-text/80" />
            </div>
          </div>
        </div>

        {/* QR */}
        <div className="flex flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-center md:justify-start md:py-12">
          <div className="shrink-0 rounded-2xl bg-white p-3 ring-1 ring-black/10 dark:ring-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/qr-web.svg" alt="QR code to open PropChange" className="size-[150px]" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[16px] text-tertiary">Scan to open on your phone</p>
            <p className="mt-1 text-[28px] font-semibold leading-tight tracking-[-0.02em] md:text-[34px]">
              Any browser.
              <br />
              No install.
            </p>
            <ul className="mt-5 space-y-2 text-left text-[14px] text-secondary">
              {["Live Seat prices", "Refund alerts", "Phantom wallet on Solana"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--up)]/15 text-up">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
