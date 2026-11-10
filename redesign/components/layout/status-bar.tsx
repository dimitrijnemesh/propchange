"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SolanaMark } from "@/components/common/solana-mark";
import { useT } from "@/components/layout/i18n-provider";
import { fmtNumber } from "@/lib/format";
import type { SearchItem } from "@/lib/search-types";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/** Next epoch boundary (prototype: 1st of next month, 00:00 UTC). */
function epochEnd(now: Date) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
}

/**
 * Exchange-style status bar pinned to the bottom of the viewport (desktop): system status,
 * Risk Engine latency, Epoch countdown, a live Seat-price ticker and the UTC clock.
 */
export function StatusBar({ items }: { items: SearchItem[] }) {
  const t = useT();
  const [now, setNow] = useState<Date | null>(null);
  const [latency, setLatency] = useState(14);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => {
      setNow(new Date());
      setLatency((l) => Math.max(8, Math.min(24, l + Math.round((Math.random() - 0.5) * 4))));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  let countdown = "—";
  if (now) {
    const s = Math.max(0, Math.floor((epochEnd(now) - now.getTime()) / 1000));
    countdown = `${Math.floor(s / 86400)}d ${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }
  // Solana slot ≈ one every 400 ms (prototype: derived from the clock)
  const slot = now ? 312_000_000 + Math.floor((now.getTime() - Date.UTC(2026, 9, 1)) / 400) : null;
  const clock = now ? `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC` : "--:--:-- UTC";

  const ticker = (aria: boolean) =>
    items.map((it) => (
      <Link
        key={`${aria}-${it.href}`}
        href={it.href}
        tabIndex={aria ? undefined : -1}
        className="inline-flex shrink-0 items-center gap-1.5 px-3 transition-colors hover:text-text"
      >
        <span className="font-medium text-secondary">{it.label}</span>
        <span className="tnum text-text">{fmtNumber(it.price ?? 0)}</span>
        <span className={cn("tnum", (it.change ?? 0) >= 0 ? "text-up" : "text-down")}>
          {(it.change ?? 0) >= 0 ? "+" : ""}
          {((it.change ?? 0) * 100).toFixed(2)}%
        </span>
      </Link>
    ));

  return (
    <div className="status-bar fixed inset-x-0 bottom-0 z-30 flex h-8 items-center border-t border-border pb-[env(safe-area-inset-bottom)] text-[11.5px] text-tertiary">
      {/* phone: live dot only, the ticker gets the width */}
      <span className="flex shrink-0 items-center pl-3 pr-2 lg:hidden" aria-label={t("status.operational")}>
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-up" />
        </span>
      </span>
      <div className="hidden shrink-0 items-center gap-4 px-4 lg:flex">
        <span className="inline-flex items-center gap-1.5 font-medium text-up">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-up opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-up" />
          </span>
          {t("status.operational")}
        </span>
        <span aria-hidden className="h-3 w-px bg-border" />
        <span>
          {t("status.riskEngine")} <span className="tnum font-mono text-secondary">{latency}ms</span>
        </span>
        <span aria-hidden className="h-3 w-px bg-border" />
        <span>
          {t("status.epochEnds")} <span className="tnum font-mono text-secondary">{countdown}</span>
        </span>
        <span aria-hidden className="h-3 w-px bg-border" />
        <span className="inline-flex items-center gap-1.5" title="Solana mainnet · Seat tokens and escrow settle here">
          <SolanaMark className="size-3" />
          Solana
          <span className="tnum font-mono text-secondary">{slot ? `slot ${slot.toLocaleString("en-US")}` : "slot —"}</span>
          <span className="tnum font-mono text-tertiary">· 0.4s</span>
        </span>
      </div>
      <div className="status-ticker relative min-w-0 flex-1 overflow-hidden lg:border-x lg:border-border">
        <div className="status-ticker-track flex w-max">
          <div className="flex">{ticker(true)}</div>
          <div className="flex" aria-hidden>
            {ticker(false)}
          </div>
        </div>
      </div>
      <div className="hidden shrink-0 items-center gap-4 px-4 lg:flex">
        <Link href="/how-it-works" className="transition-colors hover:text-text">
          Docs
        </Link>
        <Link href="/fees" className="transition-colors hover:text-text">
          Fees
        </Link>
        <span className="tnum font-mono text-secondary">{clock}</span>
      </div>
    </div>
  );
}
