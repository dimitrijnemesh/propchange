import { Flame, Hourglass, ShieldCheck, Sparkles, Trophy, TrendingDown } from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

/** Polymarket-style quick topics under the navbar: one tap into a filtered market view. */
export async function TopicBar({ counts }: { counts: { all: number; free: number; waitlist: number; crypto: number; forex: number; stocks: number; futures: number } }) {
  const t = await getT();
  const topics = [
    { href: "/seats", label: t("chip.hot"), icon: Flame, live: true },
    { href: "/strategies", label: t("chip.all"), n: counts.all },
    { href: "/strategies?market=crypto", label: t("market.crypto"), n: counts.crypto },
    { href: "/strategies?market=forex", label: t("market.forex"), n: counts.forex },
    { href: "/strategies?market=stocks", label: t("market.stocks"), n: counts.stocks },
    { href: "/strategies?market=futures", label: t("market.futures"), n: counts.futures },
    { divider: true },
    { href: "/strategies?avail=free", label: t("chip.free"), icon: SeatIcon, n: counts.free },
    { href: "/strategies?avail=waitlist", label: t("chip.waitlist"), icon: Hourglass, n: counts.waitlist },
    { href: "/strategies?maxDd=10", label: t("chip.lowDd"), icon: TrendingDown },
    { href: "/strategies?state=rookie", label: t("chip.rookies"), icon: Sparkles },
    { href: "/strategies?view=leaderboard", label: t("chip.topKept"), icon: Trophy },
    { href: "/how-it-works", label: t("nav.howItWorks"), icon: ShieldCheck },
  ] as const;

  return (
    <nav aria-label="Topics" className="topic-bar sticky top-14 z-20 md:top-16 border-b border-border dark:border-white/[0.06]">
      <div className="container-market scroll-thin flex h-11 items-center gap-1.5 overflow-x-auto">
        {topics.map((tp, i) =>
          "divider" in tp ? (
            <span key={i} aria-hidden className="mx-1 h-4 w-px shrink-0 bg-border" />
          ) : (
            <Link
              key={tp.href}
              href={tp.href}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-secondary transition-colors hover:bg-bg-muted hover:text-text",
                "live" in tp && "font-semibold text-text",
              )}
            >
              {"live" in tp ? (
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
              ) : null}
              {"icon" in tp && tp.icon ? <tp.icon className={cn("size-3.5", "live" in tp ? "text-primary-text" : "text-tertiary")} strokeWidth={1.75} /> : null}
              {tp.label}
              {"n" in tp && tp.n != null ? <span className="tnum text-[11.5px] text-tertiary">{tp.n}</span> : null}
            </Link>
          ),
        )}
      </div>
    </nav>
  );
}
