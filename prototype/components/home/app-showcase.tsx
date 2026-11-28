import { Bell, CircleUserRound, Grid2x2, Landmark, RotateCcw, Search, Users } from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import { fmtPct } from "@/lib/format";
import type { SeatRow } from "@/lib/mock-api";
import { cn } from "@/lib/utils";

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
 * Real iPhone 17 Pro frame (Apple Product Bezels, Deep Blue) with our screen placed in its transparent
 * display area: 1206×2622 px inside a 1350×2760 px frame (72 px sides, 69 px top/bottom).
 */
function Phone({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("absolute aspect-[1350/2760] w-[250px] drop-shadow-[0_40px_50px_rgba(0,0,0,0.55)]", className)} style={style}>
      <div className="absolute overflow-hidden bg-bg" style={{ left: "5.33%", top: "2.5%", width: "89.33%", height: "95%", borderRadius: "13.5% / 6.2%" }}>
        {/* status bar: time left, battery right; the Dynamic Island comes from the frame */}
        <div className="flex h-9 shrink-0 items-center justify-between px-6 pt-1.5 text-[11px] font-semibold text-text">
          <span>9:41</span>
          <span className="inline-block h-[9px] w-[18px] rounded-[3px] border border-current p-[1px]">
            <span className="block h-full w-3/4 rounded-[1px] bg-current" />
          </span>
        </div>
        <div className="relative h-[calc(100%-2.25rem)] overflow-hidden">{children}</div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/iphone-17-pro-frame.png" alt="" className="pointer-events-none absolute inset-0 h-full w-full select-none" draggable={false} />
    </div>
  );
}

/** Front phone: a "Take this Seat" sheet (like a collect sheet), with the seats left shown as dots. */
function BuyScreen({ seat }: { seat: SeatRow }) {
  const total = Math.max(1, seat.seatsTotal);
  const taken = Math.min(total, seat.seatsTaken);
  const dots = Math.min(total, 40);
  const filled = Math.round((taken / total) * dots);
  return (
    <div className="flex h-full flex-col px-4 pb-6 pt-2 text-text">
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-strong" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[15px] font-semibold tracking-[-0.01em]">Take this Seat</div>
          <div className="text-[9.5px] text-tertiary">Fee held in escrow · refunded if rules break</div>
        </div>
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-bg-muted text-[10px] text-secondary">✕</span>
      </div>
      <div className="mx-auto mt-4 w-[78%] rounded-2xl bg-gradient-to-br from-[#2848e6] to-[#5a7dff] p-3 text-white shadow-[0_18px_30px_-14px_rgba(59,99,255,0.7)]">
        <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-white/80">
          <span>{seat.symbol}</span>
          <span>Epoch seat</span>
        </div>
        <div className="mt-6 text-[13px] font-semibold leading-tight">{seat.name}</div>
        <div className="mt-0.5 text-[9.5px] text-white/75">by {seat.traderHandle}</div>
        <div className="mt-3 flex items-end justify-between">
          <span className="tnum font-mono text-[18px] font-semibold">${seat.price.toFixed(2)}</span>
          <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-semibold">
            #{Math.min(total, taken + 1)} / {total}
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-[3px] px-2">
        {Array.from({ length: dots }, (_, i) => (
          <span key={i} className={cn("size-[5px] rounded-full", i < filled ? "bg-primary" : "bg-border-strong")} />
        ))}
      </div>
      <div className="mt-2 text-center text-[11px] font-semibold">{total - taken} left</div>
      <div className="mt-2 flex justify-center gap-1.5">
        <span className="rounded-full border border-border px-2 py-0.5 text-[8.5px] text-secondary">1 Seat = 1 token</span>
        <span className="rounded-full border border-border px-2 py-0.5 text-[8.5px] text-secondary">USDC on Solana</span>
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-full border border-border bg-bg-subtle p-1">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-[14px] text-on-primary">›</span>
        <span className="text-[10.5px] text-tertiary">Swipe to take a Seat</span>
      </div>
    </div>
  );
}

const ALSO = [
  { I: RotateCcw, t: "Refund alerts the moment a contract breaks" },
  { I: Landmark, t: "Escrow balance and Epoch payouts in one place" },
  { I: Users, t: "Follow traders and their kept contracts" },
];

/**
 * NextVibe-style product block: two tilted iPhones (an auto-scrolling portfolio behind, a "Take this Seat"
 * sheet in front) next to a big headline, an "Also in the app" list and a QR to open it on a phone.
 */
export function AppShowcase({ hot, gainers }: { hot: SeatRow[]; gainers: SeatRow[] }) {
  const featured = hot[0];
  return (
    <section aria-label="PropChange on any device" className="relative overflow-hidden py-16 md:py-24">
      <div className="container-market">
        <div className="mx-auto grid max-w-[1140px] items-center gap-12 md:grid-cols-2 md:gap-10">
          {/* tilted phone pair */}
          <div data-reveal className="relative mx-auto h-[560px] w-full max-w-[460px] [perspective:1400px] md:h-[620px]">
            <div aria-hidden className="absolute left-1/2 top-1/2 size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--hero-glow-a),transparent_65%)]" />
            <Phone className="left-[2%] top-[2%]" style={{ transform: "rotateY(16deg) rotateZ(-4deg)" }}>
              <PhoneScreen hot={hot} gainers={gainers} />
            </Phone>
            {featured ? (
              <Phone className="right-[2%] top-[14%] z-10" style={{ transform: "rotateY(-10deg) rotateZ(3deg)" }}>
                <BuyScreen seat={featured} />
              </Phone>
            ) : null}
          </div>

          {/* copy */}
          <div>
            <h2 data-reveal className="text-[44px] leading-[0.98] font-semibold tracking-[-0.03em] md:text-[68px]">
              Seats worth
              <br />
              holding
            </h2>
            <p data-reveal="1" className="mt-5 max-w-[480px] text-[18px] leading-8 text-secondary">
              Take a Seat in seconds. Your fee waits in escrow for 30 days: rules kept, the trader is paid; rules broken, it comes back to you.
            </p>
            <div data-reveal="2" className="mt-8 border-t border-border pt-6">
              <div className="text-[15px] font-semibold">Also in the app</div>
              <ul className="mt-3 space-y-3">
                {ALSO.map(({ I, t }) => (
                  <li key={t} className="flex items-center gap-3 text-[15px] text-secondary">
                    <I className="size-[18px] shrink-0 text-primary-text" strokeWidth={1.75} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div data-reveal="3" className="mt-8 flex items-center gap-4">
              <div className="shrink-0 rounded-xl bg-white p-2 ring-1 ring-black/10 dark:ring-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/qr-web.svg" alt="QR code to open PropChange" className="size-[84px]" />
              </div>
              <div>
                <p className="text-[14px] text-tertiary">Scan to open on your phone</p>
                <p className="text-[18px] font-semibold">Any browser · No install</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
