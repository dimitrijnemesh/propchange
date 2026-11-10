"use client";
import * as M from "@radix-ui/react-dropdown-menu";
import { Activity, Check, ChevronRight, BookOpen, CircleHelp, Copy, LayoutDashboard, LineChart, LogOut, Plug, Settings, ShieldCheck, User, UserPlus, Users, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/common";
import { SeatIcon } from "@/components/common/seat-icon";
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger, useHoverMenu } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import type { MessageKey } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";
import { useT } from "./i18n-provider";
import { useApp } from "./providers";

export const DEMO_USER = { name: "Sam Rivera", id: "205338571" };

export const ACCOUNT_LINKS: { href: string; label: MessageKey; icon: React.ElementType }[] = [
  { href: "/app", label: "nav.dashboard", icon: LayoutDashboard },
  { href: "/app/seats", label: "acct.mySeats", icon: SeatIcon },
  { href: "/app/wallet", label: "acct.wallet", icon: Wallet },
  { href: "/app/activity", label: "acct.activity", icon: Activity },
  { href: "/app/connections", label: "acct.connections", icon: Plug },
  { href: "/app/risk", label: "acct.risk", icon: ShieldCheck },
  { href: "/app/referral", label: "menu.referral", icon: UserPlus },
  { href: "/trader", label: "nav.traderArea", icon: LineChart },
  { href: "/settings", label: "nav.settings", icon: Settings },
];

/** Binance-style account dropdown: identity card with ID + status chips, then account links. */
export function AccountMenu() {
  const app = useApp();
  const router = useRouter();
  const toast = useToast();
  const t = useT();
  const [copied, setCopied] = useState(false);
  const hover = useHoverMenu();

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_USER.id);
    } catch {}
    setCopied(true);
    toast({ kind: "success", title: t("acct.copied"), body: `${t("acct.id")}: ${DEMO_USER.id}` });
    setTimeout(() => setCopied(false), 1500);
  };

  const chip = "inline-flex h-6 items-center gap-1 rounded-md px-2 text-[12px] font-medium";

  return (
    <Dropdown {...hover.root}>
      <DropdownTrigger aria-label="Account menu" className="rounded-full" {...hover.trigger}>
        <Avatar name={DEMO_USER.name} size={32} className="font-sans ring-2 ring-border dark:bg-white dark:text-primary dark:ring-white/30" />
      </DropdownTrigger>
      <DropdownContent className="w-[300px] p-2 font-sans" {...hover.content}>
        <div className="px-2 pb-3 pt-2">
          <div className="flex items-center gap-3">
            <Avatar name={DEMO_USER.name} size={48} />
            <div className="min-w-0">
              <div className="truncate text-[17px] font-semibold">{DEMO_USER.name}</div>
              <button
                type="button"
                onClick={copyId}
                className="tnum mt-0.5 inline-flex items-center gap-1.5 text-[12.5px] text-tertiary transition-colors hover:text-text"
                aria-label={`Copy ID ${DEMO_USER.id}`}
              >
                {t("acct.id")}: {DEMO_USER.id}
                {copied ? <Check className="size-3.5 text-up" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className={cn(chip, "bg-bg-muted text-secondary")}>{t("acct.follower")}</span>
            {app.walletConnected ? (
              <span className={cn(chip, "bg-primary-soft text-primary-soft-text")}>
                <Check className="size-3.5" /> {t("acct.walletLinked")}
              </span>
            ) : (
              <M.Item
                onSelect={async (e) => {
                  e.preventDefault();
                  await app.connectWallet();
                  toast({ kind: "success", title: "Wallet connected", body: "Mock Solana wallet 7xKX…9fQa" });
                }}
                className={cn(chip, "cursor-pointer bg-primary text-on-primary outline-none data-[highlighted]:bg-primary-hover")}
              >
                {t("acct.linkWallet")} <ChevronRight className="size-3.5" />
              </M.Item>
            )}
            <M.Item
              onSelect={() => router.push("/trader")}
              className={cn(chip, "cursor-pointer bg-bg-muted text-secondary outline-none data-[highlighted]:text-text")}
            >
              {t("acct.trader")} <ChevronRight className="size-3.5" />
            </M.Item>
          </div>
        </div>
        <DropdownSeparator />
        {ACCOUNT_LINKS.map((l) => (
          <DropdownItem key={l.href} onSelect={() => router.push(l.href)} className="h-10 text-[14px]">
            <l.icon strokeWidth={1.75} /> {t(l.label)}
          </DropdownItem>
        ))}
        <DropdownSeparator />
        <DropdownItem
          onSelect={() => {
            app.logOut();
            router.push("/");
          }}
          className="h-10 text-[14px]"
        >
          <LogOut strokeWidth={1.75} /> {t("nav.logout")}
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}

/** Logged-out profile dropdown: welcome card, Log in / Sign up and quick links. */
export function GuestMenu() {
  const router = useRouter();
  const t = useT();
  const hover = useHoverMenu();
  const links: { href: string; label: MessageKey; icon: React.ElementType }[] = [
    { href: "/support", label: "menu.help", icon: CircleHelp },
    { href: "/faq", label: "menu.faq", icon: BookOpen },
    { href: "/community", label: "menu.communityHub", icon: Users },
    { href: "/status", label: "footer.status", icon: Activity },
  ];
  return (
    <Dropdown {...hover.root}>
      <DropdownTrigger
        {...hover.trigger}
        aria-label="Profile menu"
        className="inline-flex size-9 items-center justify-center rounded-full text-text outline-none hover:bg-bg-muted dark:text-white dark:hover:bg-white/10"
      >
        <User className="size-[19px]" strokeWidth={1.75} />
      </DropdownTrigger>
      <DropdownContent className="w-[280px] p-2 font-sans" {...hover.content}>
        <div className="px-2 pb-3 pt-2">
          <div className="text-[16px] font-semibold">Welcome to PropChange</div>
          <p className="mt-0.5 text-[12.5px] text-tertiary">Log in to buy Seats, track copies and get breach alerts.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <M.Item
              onSelect={() => router.push("/login")}
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-border-strong text-[13px] font-semibold outline-none data-[highlighted]:bg-bg-subtle"
            >
              {t("nav.login")}
            </M.Item>
            <M.Item
              onSelect={() => router.push("/signup")}
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-on-primary outline-none data-[highlighted]:bg-primary-hover"
            >
              {t("nav.signup")}
            </M.Item>
          </div>
        </div>
        <DropdownSeparator />
        {links.map((l) => (
          <DropdownItem key={l.href} onSelect={() => router.push(l.href)} className="h-10 text-[14px]">
            <l.icon strokeWidth={1.75} /> {t(l.label)}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
