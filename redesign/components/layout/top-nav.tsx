"use client";
import { Bell, Briefcase, ChevronDown, Wallet } from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Address } from "@/components/common/address";
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
import { DEMO_WALLET, useApp } from "./providers";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu, GuestMenu } from "./account-menu";
import { SiteMenu } from "./site-menu";
import { useT } from "./i18n-provider";
import { LanguageSwitcher } from "./language-switcher";
import { EditionSwitch } from "./edition-provider";
import type { MessageKey } from "@/lib/i18n/messages";

type NavItem = { href: string; label: MessageKey };
const MAIN: (NavItem & { icon: React.ElementType; live?: boolean })[] = [
  { href: "/", label: "nav.seats", icon: SeatIcon, live: true },
  { href: "/app/seats", label: "nav.mySeats", icon: Briefcase },
];
/** Dropdown groups (spec: Traders ▾ · Learn ▾ · More ▾). */
const GROUPS: { label: MessageKey; items: NavItem[] }[] = [
  {
    label: "nav.traders",
    items: [
      { href: "/strategies?sort=compliance&view=leaderboard", label: "nav.leaderboard" },
      { href: "/signup?role=trader", label: "footer.becomeTrader" },
      { href: "/trader", label: "menu.traders" },
    ],
  },
  {
    label: "menu.learn",
    items: [
      { href: "/how-it-works", label: "nav.howItWorks" },
      { href: "/how-it-works#contract", label: "footer.riskContracts" },
      { href: "/how-it-works#risk-engine", label: "nav.riskEngine" },
      { href: "/fees", label: "nav.fees" },
      { href: "/faq", label: "menu.faq" },
      { href: "/glossary", label: "footer.glossary" },
    ],
  },
  {
    label: "nav.more",
    items: [
      { href: "/about", label: "footer.about" },
      { href: "/community", label: "menu.communityHub" },
      { href: "/support", label: "menu.help" },
      { href: "/status", label: "footer.status" },
      { href: "/legal/terms", label: "footer.terms" },
    ],
  },
];

function useActive() {
  const path = usePathname();
  const sp = useSearchParams();
  return (href: string) => {
    const [p, q] = href.split("?");
    if (p === "/") return path === "/" || (path.startsWith("/seats") && !path.startsWith("/seats/"));
    if (q?.includes("view=leaderboard")) return path === "/strategies" && sp.get("view") === "leaderboard";
    return path.startsWith(p.split("#")[0]) && p !== "/how-it-works#contract" && p !== "/how-it-works#risk-engine";
  };
}

const underline = (on: boolean) =>
  cn(
    "absolute inset-x-1 bottom-0 h-[3px] rounded-t-full bg-primary transition-opacity dark:bg-white",
    on ? "opacity-100" : "opacity-0 group-hover:opacity-40 group-focus-visible:opacity-70 group-data-[state=open]:opacity-70",
  );

function NavLinks() {
  const isActive = useActive();
  const t = useT();
  return (
    <>
      {MAIN.map((l) => {
        const on = isActive(l.href);
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={on ? "page" : undefined}
            className="group relative flex h-14 items-center whitespace-nowrap px-1 text-[14px] font-semibold text-text transition-colors dark:text-white"
          >
            <Icon className="mr-1.5 size-4 shrink-0" strokeWidth={2} />
            {t(l.label)}
            {l.live ? (
              <span className="relative ml-1.5 flex size-1.5" aria-label="live">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70 dark:bg-white" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary dark:bg-white" />
              </span>
            ) : null}
            <span className={underline(on)} />
          </Link>
        );
      })}
      <span aria-hidden className="mx-0.5 h-5 w-px self-center bg-border-strong dark:bg-white/25" />
      {GROUPS.map((g) => (
        <NavGroup key={g.label} group={g} />
      ))}
    </>
  );
}

/** Desktop dropdown that opens on hover (Binance-style) and on click/keyboard. */
function NavGroup({ group }: { group: (typeof GROUPS)[number] }) {
  const t = useT();
  const router = useRouter();
  const isActive = useActive();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hover = (v: boolean) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(v), v ? 60 : 160);
  };
  const anyOn = group.items.some((l) => isActive(l.href));
  return (
    <Dropdown open={open} onOpenChange={setOpen} modal={false}>
      <DropdownTrigger
        onPointerEnter={() => hover(true)}
        onPointerLeave={() => hover(false)}
        className="group relative flex h-14 items-center gap-1 whitespace-nowrap px-1 text-[14px] font-medium text-text outline-none dark:text-white"
      >
        {t(group.label)}
        <ChevronDown className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" strokeWidth={2} />
        <span className={underline(anyOn)} />
      </DropdownTrigger>
      <DropdownContent
        align="start"
        sideOffset={0}
        className="min-w-[200px] font-sans"
        onPointerEnter={() => hover(true)}
        onPointerLeave={() => hover(false)}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {group.items.map((l) => (
          <DropdownItem key={l.href} onSelect={() => router.push(l.href)} className={cn(isActive(l.href) && "text-primary-text")}>
            {t(l.label)}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
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
        scrolled && "shadow-[0_4px_16px_rgba(15,23,41,0.18)]",
        className,
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 sm:gap-4 xl:gap-6", compact ? "px-4 md:px-6" : "container-market")}>
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
          <EditionSwitch className="mr-1" />
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
      {app.walletConnected ? (
        <span className="hidden h-8 items-center gap-2 rounded-md border border-border-strong px-2.5 text-text xl:inline-flex dark:border-white/30 dark:text-white dark:[&_button]:text-white/80 dark:[&_button:hover]:text-white">
          <span className="size-2 rounded-full bg-success" aria-hidden />
          <Address value={DEMO_WALLET} />
        </span>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="hidden bg-transparent font-medium xl:inline-flex dark:border-white/40 dark:text-white dark:hover:bg-white/10"
          loading={connecting}
          onClick={async () => {
            setConnecting(true);
            await app.connectWallet();
            setConnecting(false);
            toast({ kind: "success", title: "Wallet connected", body: "Mock Solana wallet 7xKX…9fQa" });
          }}
        >
          {!connecting ? <Wallet strokeWidth={1.75} /> : null}
          {t("nav.connectWallet")}
        </Button>
      )}
      <Dropdown>
        <DropdownTrigger
          aria-label={`Notifications (${unread} unread)`}
          className="relative inline-flex size-9 items-center justify-center rounded-md text-text hover:bg-bg-muted dark:text-white dark:hover:bg-white/10"
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
