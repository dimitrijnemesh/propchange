"use client";
import { Bell, ChevronDown, LineChart, Wallet } from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import { fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/domain";
import { NavSearch } from "./nav-search";
import { Logo } from "./logo";
import { getPhantom, shortAddress, useApp } from "./providers";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu, GuestMenu } from "./account-menu";
import { SiteMenu } from "./site-menu";
import { NAV_GROUPS, NavMenu } from "./nav-menu";
import { useT } from "./i18n-provider";
import { LanguageSwitcher } from "./language-switcher";
import { CurrencySwitcher } from "./currency";
import type { MessageKey } from "@/lib/i18n/messages";

const links: { href: string; label: MessageKey; primary?: boolean; icon?: React.ElementType; live?: boolean }[] = [
  { href: "/strategies", label: "nav.strategies", primary: true, icon: LineChart },
  { href: "/seats", label: "nav.seatMarket", primary: true, icon: SeatIcon, live: true },
  { href: "/strategies?sort=compliance&view=leaderboard", label: "nav.leaderboard" },
  { href: "/how-it-works", label: "nav.howItWorks" },
  { href: "/fees", label: "nav.fees" },
];

function useActive() {
  const path = usePathname();
  const sp = useSearchParams();
  return (href: string) => {
    const [p, q] = href.split("?");
    if (q?.includes("view=leaderboard")) return path === "/strategies" && sp.get("view") === "leaderboard";
    // filtered shortcuts (e.g. /strategies?avail=free) are active only when their filters are set
    if (q) return path === p && [...new URLSearchParams(q)].every(([k, v]) => sp.get(k) === v);
    if (p === "/strategies") return path.startsWith("/strategies") && sp.get("view") !== "leaderboard";
    return path.startsWith(p);
  };
}

function NavLinks({ onNavigate, vertical }: { onNavigate?: () => void; vertical?: boolean }) {
  const isActive = useActive();
  const t = useT();
  if (!vertical) {
    return (
      <>
        {NAV_GROUPS.map((g, i) => (
          <span key={g.label} className="contents">
            {i === 2 ? <span aria-hidden className="mx-1 h-5 w-px self-center bg-border-strong dark:bg-white/25" /> : null}
            <NavMenu group={g} active={g.items.some((it) => isActive(it.href))} />
          </span>
        ))}
      </>
    );
  }
  return (
    <>
      {links.map((l) => {
        const on = isActive(l.href);
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex h-12 items-center rounded-full px-4 text-[15px] font-semibold transition-colors hover:bg-bg-subtle",
              on ? "bg-primary-soft text-primary-soft-text" : "text-secondary hover:text-text",
            )}
          >
            {Icon && l.primary ? <Icon className="mr-2.5 size-[18px] shrink-0" strokeWidth={2} /> : null}
            {t(l.label)}
          </Link>
        );
      })}
    </>
  );
}


export function TopNav({
  notifications,
  compact,
  className,
}: {
  notifications: Notification[];
  compact?: boolean;
  className?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const app = useApp();
  const t = useT();
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={cn(
        "site-header sticky top-0 z-30 font-display font-medium text-text transition-shadow duration-150 dark:text-white",
        scrolled && "border-b border-border",
        className,
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 sm:gap-4 md:h-16 xl:gap-6", compact ? "px-4 md:px-6" : "container-market")}>
        <Logo onBlue introTarget />
        <nav className="hidden items-center gap-4 lg:flex xl:gap-5" aria-label="Primary">
          <Suspense>
            <NavLinks />
          </Suspense>
        </nav>
        <div className="flex-1" />
        {/* Full search bar shrinks to the space left (long languages, logged-in controls); icon below 1440px. */}
        <div className="hidden min-w-[180px] max-w-[420px] flex-[3] xl:block">
          <NavSearch variant="field" />
        </div>
        <div className="nav-actions flex shrink-0 items-center gap-0.5 sm:gap-1 md:gap-2">
          <div className="xl:hidden">
            <NavSearch variant="icon" />
          </div>
          <CurrencySwitcher className="hidden sm:inline-flex" />
          <LanguageSwitcher onBlue className="hidden md:inline-flex" />
          <ThemeToggle onBlue className="hidden md:inline-flex" />
          {app.loggedIn ? (
            <LoggedIn notifications={notifications} />
          ) : (
            <>
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "font-medium text-text hover:bg-bg-muted dark:text-white dark:hover:bg-white/10")}>
                {t("nav.login")}
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: "sm" }), "font-medium dark:bg-white dark:text-primary dark:hover:bg-blue-50 dark:active:bg-blue-100")}>
                {t("nav.signup")}
              </Link>
            </div>
            <GuestMenu />
            </>
          )}
          <SiteMenu />
        </div>
      </div>
    </header>
  );
}

function LoggedIn({ notifications }: { notifications: Notification[] }) {
  const app = useApp();
  const router = useRouter();
  const toast = useToast();
  const [connecting, setConnecting] = useState(false);
  const t = useT();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <>
      {/* Wallet: its own button (not inside the profile menu) */}
      {app.walletConnected ? (
        <Link
          href="/app/wallet"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden bg-transparent font-medium md:inline-flex dark:border-white/30 dark:text-white dark:hover:bg-white/10")}
        >
          <Wallet strokeWidth={1.75} />
          <span className="font-mono text-[12.5px]">{shortAddress(app.walletAddress)}</span>
        </Link>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="hidden bg-transparent font-medium md:inline-flex dark:border-white/30 dark:text-white dark:hover:bg-white/10"
          loading={connecting}
          onClick={async () => {
            setConnecting(true);
            const addr = await app.connectWallet();
            setConnecting(false);
            if (addr) toast({ kind: "success", title: "Wallet connected", body: `${getPhantom() ? "Phantom" : "Demo wallet"} · ${shortAddress(addr)}` });
          }}
        >
          {!connecting ? <Wallet strokeWidth={1.75} /> : null}
          {t("nav.connectWallet")}
        </Button>
      )}
      <Dropdown>
        <DropdownTrigger
          aria-label={`Notifications (${unread} unread)`}
          className="relative inline-flex size-9 items-center justify-center rounded-full text-text hover:bg-bg-muted dark:text-white dark:hover:bg-white/10"
        >
          <Bell className="size-[18px]" strokeWidth={1.75} />
          {unread ? (
            <span className="tnum absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-sans text-[10px] font-bold text-white ring-2 ring-[var(--header-ring)]">
              {unread}
            </span>
          ) : null}
        </DropdownTrigger>
        <DropdownContent className="w-[340px] p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-semibold">{t("nav.notifications")}</span>
            <span className="text-caption text-tertiary">{unread} unread</span>
          </div>
          <div className="max-h-[360px] overflow-y-auto p-1">
            {notifications.slice(0, 6).map((n) => (
              <DropdownItem
                key={n.id}
                onSelect={() => n.href && router.push(n.href)}
                className="h-auto flex-col items-start gap-0.5 px-3 py-2.5"
              >
                <span className="flex w-full items-center gap-2 font-semibold">
                  {!n.read ? <span className="size-1.5 shrink-0 rounded-full bg-primary" /> : null}
                  <span className="truncate">{n.title}</span>
                </span>
                <span className="line-clamp-2 text-caption font-normal text-secondary">{n.body}</span>
                <span className="text-[11px] text-tertiary">{fmtDateTime(n.at)}</span>
              </DropdownItem>
            ))}
          </div>
          <div className="border-t border-border p-1">
            <DropdownItem onSelect={() => router.push("/app/notifications")} className="justify-center font-semibold text-primary-text">
              {t("nav.viewAll")}
            </DropdownItem>
          </div>
        </DropdownContent>
      </Dropdown>
      <AccountMenu />
    </>
  );
}
