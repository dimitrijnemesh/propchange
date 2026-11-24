"use client";
import { BookOpen, ChevronDown, CircleHelp, Hourglass, LayoutList, Receipt, Sprout, TrendingDown, Trophy, Workflow } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SeatIcon } from "@/components/common/seat-icon";
import { cn } from "@/lib/utils";

type Item = { href: string; title: string; desc: string; icon: React.ElementType };
export type NavGroup = { label: string; href?: string; icon?: React.ElementType; items: Item[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Strategies",
    href: "/strategies",
    items: [
      { href: "/strategies", title: "All strategies", desc: "Every verified strategy, ranked by kept contracts", icon: LayoutList },
      { href: "/strategies?sort=compliance&view=leaderboard", title: "Leaderboard", desc: "Traders who keep their rules, epoch after epoch", icon: Trophy },
      { href: "/strategies?state=rookie", title: "Rookies", desc: "New traders building their track record", icon: Sprout },
      { href: "/strategies?maxDd=10", title: "Low drawdown", desc: "Calm strategies with max drawdown under 10%", icon: TrendingDown },
    ],
  },
  {
    label: "Seats",
    href: "/seats",
    items: [
      { href: "/seats", title: "Seat Market", desc: "Buy and sell Seats from current holders", icon: SeatIcon },
      { href: "/strategies?avail=free", title: "Free seats", desc: "Strategies with seats available today", icon: LayoutList },
      { href: "/strategies?avail=waitlist", title: "Waitlists", desc: "Full strategies — queue for the next free seat", icon: Hourglass },
    ],
  },
  {
    label: "More",
    items: [
      { href: "/how-it-works", title: "How it works", desc: "Seats, contracts, escrow and refunds in 2 minutes", icon: Workflow },
      { href: "/fees", title: "Fees", desc: "What you pay and how the fee is split", icon: Receipt },
      { href: "/faq", title: "FAQ", desc: "Answers to the most common questions", icon: CircleHelp },
      { href: "/glossary", title: "Glossary", desc: "Every term on the platform, explained", icon: BookOpen },
    ],
  },
];

/** BingX-style top-nav item: hover (or focus) opens an animated panel of rich links. */
export function NavMenu({ group, active }: { group: NavGroup; active?: boolean }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  useEffect(() => clear, []);
  const show = () => {
    clear();
    setOpen(true);
  };
  const hide = (delay = 140) => {
    clear();
    timer.current = setTimeout(() => setOpen(false), delay);
  };
  const triggerCls =
    "group relative flex h-16 items-center gap-1 whitespace-nowrap px-1 text-[15px] font-semibold text-text outline-none transition-colors dark:text-white";
  const label = (
    <>
      {group.label}
      <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} strokeWidth={2} />
      <span
        className={cn(
          "absolute inset-x-1 bottom-0 h-[3px] rounded-t-full bg-primary transition-opacity dark:bg-white",
          active ? "opacity-100" : open ? "opacity-60" : "opacity-0",
        )}
      />
    </>
  );
  return (
    <div
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && show()}
      onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
      onFocus={show}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && hide(0)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      {group.href ? (
        <Link href={group.href} className={triggerCls} aria-expanded={open} onClick={() => setOpen(false)}>
          {label}
        </Link>
      ) : (
        <button type="button" className={triggerCls} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {label}
        </button>
      )}
      {open ? (
        <div className="absolute left-0 top-full z-50 pt-1">
          <div className="nav-pop w-[380px] rounded-[22px] border border-border bg-surface p-2 shadow-lg">
            {group.items.map((it, i) => (
              <Link
                key={it.href + it.title}
                href={it.href}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${40 + i * 35}ms` }}
                className="nav-pop-item group/item flex items-start gap-3.5 rounded-2xl px-3 py-3 transition-colors hover:bg-bg-subtle focus-visible:bg-bg-subtle focus-visible:outline-none"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-text transition-colors group-hover/item:bg-primary group-hover/item:text-on-primary">
                  <it.icon className="size-[18px]" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-semibold text-text">{it.title}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-[18px] text-tertiary">{it.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
