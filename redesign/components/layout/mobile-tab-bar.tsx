"use client";
import { ArrowLeftRight, Briefcase, Home, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SeatIcon } from "@/components/common/seat-icon";
import { useT } from "@/components/layout/i18n-provider";
import { cn } from "@/lib/utils";

const LAST_SEAT = "pc_last_seat";

/** Remember the last opened Seat page so the centre "Trade" tab can jump back to it. */
export function RememberSeat({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      localStorage.setItem(LAST_SEAT, slug);
    } catch {}
  }, [slug]);
  return null;
}

/** Phones/tablets: Binance-app style bottom navigation. The ticker sits right above it. */
export function MobileTabBar() {
  const path = usePathname();
  const t = useT();
  const [last, setLast] = useState<string | null>(null);
  useEffect(() => {
    try {
      setLast(localStorage.getItem(LAST_SEAT));
    } catch {}
  }, [path]);

  const items = [
    { href: "/app", label: "Home", icon: Home, on: path === "/app" },
    { href: "/", label: t("nav.seats"), icon: SeatIcon, on: path === "/" },
    { href: last ? `/seats/${last}#trade` : "/", label: "Trade", icon: ArrowLeftRight, on: path.startsWith("/seats/"), centre: true },
    { href: "/app/seats", label: t("nav.mySeats"), icon: Briefcase, on: path.startsWith("/app/seats") },
    { href: "/settings", label: "Account", icon: UserRound, on: path.startsWith("/settings") || (path.startsWith("/app/") && !path.startsWith("/app/seats")) },
  ];

  return (
    <nav aria-label="Main" className="mobile-tab-bar fixed inset-x-0 bottom-0 z-30 grid h-14 grid-cols-5 border-t border-border lg:hidden">
      {items.map((it) =>
        it.centre ? (
          <Link key="trade" href={it.href} aria-current={it.on ? "page" : undefined} className="flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold text-primary-text">
            <span className="-mt-3 flex size-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-md ring-4 ring-[var(--bg)]">
              <it.icon className="size-5" strokeWidth={2} />
            </span>
            {it.label}
          </Link>
        ) : (
          <Link
            key={it.href}
            href={it.href}
            aria-current={it.on ? "page" : undefined}
            className={cn("flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium", it.on ? "text-primary-text" : "text-tertiary")}
          >
            <it.icon className="size-5" strokeWidth={it.on ? 2 : 1.75} />
            <span className="max-w-full truncate px-1">{it.label}</span>
          </Link>
        ),
      )}
    </nav>
  );
}
