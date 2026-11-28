"use client";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const usd = (v: number) => `${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;

/**
 * "Where does my fee go?" — pick a Seat fee and an outcome; see the trader's share, PropChange's share and what
 * comes back to you. Uses the real split: kept → 75% trader / 25% PropChange; broken → 100% back to the follower.
 */
export function RefundCalculator() {
  const [fee, setFee] = useState(30);
  const [kept, setKept] = useState(true);
  const rows = kept
    ? [
        { k: "Trader", v: fee * 0.75, tone: "bg-primary" },
        { k: "PropChange", v: fee * 0.25, tone: "bg-primary/45" },
        { k: "Back to you", v: 0, tone: "bg-[var(--up)]" },
      ]
    : [
        { k: "Trader", v: 0, tone: "bg-primary" },
        { k: "PropChange", v: 0, tone: "bg-primary/45" },
        { k: "Back to you", v: fee, tone: "bg-[var(--up)]" },
      ];
  return (
    <section aria-label="Fee calculator" className="py-16 md:py-24">
      <div className="container-market">
        <div className="mx-auto grid max-w-[1140px] items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] md:gap-14">
          <div>
            <h2 data-reveal className="text-[36px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
              Where does
              <br />
              your fee go?
            </h2>
            <p data-reveal="1" className="mt-5 max-w-[380px] text-[17px] leading-7 text-secondary">
              Pick a Seat fee and an outcome. The trader only gets paid when the rules are kept.
            </p>
          </div>

          <div data-reveal="2" className="lift rounded-[28px] bg-surface p-6 ring-1 ring-border md:p-8">
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] text-secondary">Seat fee · 30-day Epoch</span>
              <span className="text-[28px] font-semibold tracking-[-0.025em]">{usd(fee)}</span>
            </div>
            <Slider className="mt-4" label="Seat fee" value={fee} onChange={setFee} min={10} max={200} step={1} format={(v) => `${v} USDC`} showBubble={false} />

            <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-bg-muted p-1" role="radiogroup" aria-label="Epoch outcome">
              {[
                { v: true, label: "Rules kept" },
                { v: false, label: "Rules broken" },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={kept === o.v}
                  onClick={() => setKept(o.v)}
                  className={cn(
                    "h-10 rounded-full text-[14px] font-semibold transition-colors",
                    kept === o.v ? (o.v ? "bg-primary text-on-primary" : "bg-[var(--down)] text-white") : "text-tertiary hover:text-text",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <ul className="mt-6 space-y-4">
              {rows.map((r) => (
                <li key={r.k}>
                  <div className="flex items-baseline justify-between text-[15px]">
                    <span className="text-secondary">{r.k}</span>
                    <span className={cn("font-semibold tracking-[-0.02em]", r.k === "Back to you" && r.v > 0 && "text-up")}>{usd(r.v)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-muted">
                    <div className={cn("h-full rounded-full transition-[width] duration-500 ease-out", r.tone)} style={{ width: `${(r.v / fee) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[13px] text-tertiary">Resell your Seat any time — 2% platform fee on the resale.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
