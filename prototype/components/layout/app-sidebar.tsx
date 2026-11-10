"use client";
import * as D from "@radix-ui/react-dialog";
import {
  Activity,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  Coins,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  Link2,
  ListOrdered,
  MoreHorizontal,
  PlusCircle,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SheetContent } from "@/components/ui/dialog";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo";
import { ThemeToggle } from "./theme-toggle";

type Item = { href: string; label: string; icon: React.ElementType; exact?: boolean };

const follower: Item[] = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/app/seats", label: "My Seats", icon: SeatIcon },
  { href: "/app/risk", label: "Risk settings", icon: ShieldCheck },
  { href: "/app/connections", label: "Connections", icon: Link2 },
  { href: "/app/wallet", label: "Wallet & Escrow", icon: Wallet },
  { href: "/app/activity", label: "Activity", icon: Activity },
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  { href: "/app/referral", label: "Referral", icon: UserPlus },
];

const trader: Item[] = [
  { href: "/trader", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/trader/strategies", label: "Strategies", icon: ListOrdered },
  { href: "/trader/create", label: "Create strategy", icon: PlusCircle },
  { href: "/trader/earnings", label: "Earnings", icon: Coins },
  { href: "/trader/bond", label: "Bond", icon: Landmark },
  { href: "/trader/followers", label: "Followers", icon: Users },
];

const isOn = (path: string, it: Item) => (it.exact ? path === it.href : path.startsWith(it.href));

export function RoleSwitch({ role, collapsed }: { role: "follower" | "trader"; collapsed?: boolean }) {
  if (collapsed) return null;
  return (
    <div className="grid grid-cols-2 rounded-md bg-bg-subtle p-1" role="tablist" aria-label="Role">
      {(["follower", "trader"] as const).map((r) => (
        <Link
          key={r}
          href={r === "follower" ? "/app" : "/trader"}
          role="tab"
          aria-selected={role === r}
          className={cn(
            "flex h-8 items-center justify-center rounded-[6px] text-[13px] font-semibold transition-colors",
            role === r ? "bg-surface text-text shadow-sm dark:bg-bg-muted" : "text-secondary hover:text-text",
          )}
        >
          {r === "follower" ? "Follower" : "Trader"}
        </Link>
      ))}
    </div>
  );
}

export function AppSidebar({ role }: { role: "follower" | "trader" | "settings" }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const effectiveRole = role === "settings" ? "follower" : role;
  const items = effectiveRole === "trader" ? trader : follower;

  const link = (it: Item) => {
    const on = isOn(path, it);
    const el = (
      <Link
        key={it.href}
        href={it.href}
        aria-current={on ? "page" : undefined}
        className={cn(
          "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
          on ? "bg-primary-soft font-semibold text-primary-soft-text" : "text-secondary hover:bg-bg-subtle hover:text-text",
          collapsed && "justify-center px-0",
        )}
      >
        <it.icon className="size-[18px] shrink-0" strokeWidth={1.75} />
        {!collapsed ? <span className="truncate">{it.label}</span> : <span className="sr-only">{it.label}</span>}
      </Link>
    );
    return collapsed ? (
      <Tooltip key={it.href} content={it.label} side="right" asChild>
        {el}
      </Tooltip>
    ) : (
      el
    );
  };

  return (
    <>
      <aside
        className={cn(
          "sticky top-16 hidden h-[calc(100dvh-64px)] shrink-0 flex-col border-r border-border bg-bg transition-[width] duration-200 md:flex",
          collapsed ? "w-[72px]" : "w-[248px]",
        )}
      >
        <div className={cn("p-3", collapsed && "flex justify-center")}>
          {collapsed ? <LogoMark size={16} className="my-2" /> : <RoleSwitch role={effectiveRole} />}
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="App">
          {items.map(link)}
        </nav>
        <div className="space-y-0.5 border-t border-border p-3">
          {link({ href: "/settings", label: "Settings", icon: Settings })}
          {link({ href: "/how-it-works", label: "Help", icon: HelpCircle })}
          <div className={cn("flex items-center", collapsed ? "flex-col gap-1" : "justify-between")}>
            <ThemeToggle />
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="inline-flex size-9 items-center justify-center rounded-md text-secondary hover:bg-bg-subtle hover:text-text"
            >
              {collapsed ? <ChevronsRight className="size-[18px]" /> : <ChevronsLeft className="size-[18px]" />}
            </button>
          </div>
        </div>
      </aside>
      <MobileTabBar items={items} role={effectiveRole} />
    </>
  );
}

function MobileTabBar({ items, role }: { items: Item[]; role: "follower" | "trader" }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const main = items.slice(0, 4);
  const more = [...items.slice(4), { href: "/settings", label: "Settings", icon: Settings }];
  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {main.map((it) => {
        const on = isOn(path, it);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn("flex flex-col items-center justify-center gap-1 text-[11px] font-medium", on ? "text-primary-text" : "text-tertiary")}
          >
            <it.icon className="size-5" strokeWidth={1.75} />
            <span className="max-w-full truncate px-1">{it.label}</span>
          </Link>
        );
      })}
      <D.Root open={open} onOpenChange={setOpen}>
        <D.Trigger className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-tertiary">
          <MoreHorizontal className="size-5" strokeWidth={1.75} />
          More
        </D.Trigger>
        <SheetContent title="More" side="bottom">
          <div className="space-y-3 p-4 pb-8">
            <RoleSwitch role={role} />
            <div className="space-y-0.5">
              {more.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center gap-3 rounded-md px-3 font-medium hover:bg-bg-subtle"
                >
                  <it.icon className="size-5 text-secondary" strokeWidth={1.75} />
                  {it.label}
                </Link>
              ))}
            </div>
          </div>
        </SheetContent>
      </D.Root>
    </nav>
  );
}
