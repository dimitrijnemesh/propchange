"use client";
import * as D from "@radix-ui/react-dialog";
import { ChevronRight, LineChart, Menu } from "lucide-react";
import { SeatIcon } from "@/components/common/seat-icon";
import type { MessageKey } from "@/lib/i18n/messages";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/common";
import { SocialLinks } from "@/components/common/social-links";
import { buttonVariants } from "@/components/ui/button";
import { SheetContent } from "@/components/ui/dialog";
import { SITE_NAV } from "@/lib/site-nav";
import { cn } from "@/lib/utils";
import { useT } from "./i18n-provider";
import { LanguageSwitcher } from "./language-switcher";
import { ACCOUNT_LINKS, DEMO_USER } from "./account-menu";
import { useApp } from "./providers";
import { ThemeToggle } from "./theme-toggle";

/**
 * Burger menu, on every screen size (Binance-style). Desktop: everything that isn't in the
 * navbar (Learn, Traders, Support, Company, Community). Mobile: the navbar items and account
 * links too, so the phone menu holds the whole site.
 */
export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const app = useApp();
  const t = useT();
  const close = () => setOpen(false);
  const item = "flex h-10 items-center justify-between rounded-md px-3 text-[14px] font-medium text-secondary transition-colors hover:bg-bg-subtle hover:text-text";

  return (
    <D.Root open={open} onOpenChange={setOpen}>
      <D.Trigger
        aria-label="Open menu"
        className="inline-flex size-9 items-center justify-center rounded-md text-text hover:bg-bg-muted dark:text-white dark:hover:bg-white/10"
      >
        <Menu className="size-5" strokeWidth={1.75} />
      </D.Trigger>
      <SheetContent title={t("nav.menu")} className="max-w-[380px] font-sans">
        <div className="scroll-thin flex-1 overflow-y-auto px-3 pb-6 pt-3">
          {/* account summary / auth — mobile only (desktop has them in the navbar) */}
          <div className="lg:hidden">
            {app.loggedIn ? (
              <Link href="/app" onClick={close} className="flex items-center gap-3 rounded-lg bg-bg-subtle p-3">
                <Avatar name={DEMO_USER.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-text">{DEMO_USER.name}</div>
                  <div className="tnum text-[12px] text-tertiary">
                    {t("acct.id")}: {DEMO_USER.id}
                  </div>
                </div>
                <ChevronRight className="size-4 text-tertiary" />
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={close} className={buttonVariants({ variant: "outline" })}>
                  {t("nav.login")}
                </Link>
                <Link href="/signup" onClick={close} className={buttonVariants({ variant: "primary" })}>
                  {t("nav.signup")}
                </Link>
              </div>
            )}
          </div>

          {SITE_NAV.map((sec) =>
            sec.highlight ? (
              <section key={sec.title} className="mt-5 first:mt-0">
                <h3 className="px-3 pb-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-tertiary">{t(sec.title)}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sec.links.map((l, i) => {
                    const Icon = i === 0 ? SeatIcon : LineChart;
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={close}
                        className={cn(
                          "group relative flex flex-col gap-2 rounded-xl border p-3 transition-colors",
                          i === 0
                            ? "border-primary/30 bg-primary-soft hover:border-primary/60"
                            : "border-border bg-bg-subtle hover:border-border-strong",
                        )}
                      >
                        <span className="flex items-center justify-between">
                          <span
                            className={cn(
                              "flex size-8 items-center justify-center rounded-lg",
                              i === 0 ? "bg-primary text-on-primary" : "bg-bg-muted text-text",
                            )}
                          >
                            <Icon className="size-4" strokeWidth={1.75} />
                          </span>
                          {i === 0 ? (
                            <span className="relative flex size-2" aria-label="live">
                              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                              <span className="relative inline-flex size-2 rounded-full bg-primary" />
                            </span>
                          ) : null}
                        </span>
                        <span>
                          <span className={cn("block text-[14px] font-semibold", i === 0 ? "text-primary-soft-text" : "text-text")}>{t(l.label)}</span>
                          <span className="block text-[11.5px] leading-4 text-tertiary">{t(i === 0 ? "menu.seatMarketDesc" : "menu.strategiesDesc")}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(["crypto", "forex", "stocks", "futures"] as const).map((m) => (
                    <Link
                      key={m}
                      href={`/strategies?market=${m}`}
                      onClick={close}
                      className="inline-flex h-7 items-center rounded-full border border-border px-2.5 text-[12px] font-medium text-secondary transition-colors hover:border-border-strong hover:text-text"
                    >
                      {t(`market.${m}` as MessageKey)}
                    </Link>
                  ))}
                </div>
              </section>
            ) : (
            <section key={sec.title} className={cn("mt-5 first:mt-0", sec.mobileOnly && "lg:hidden")}>
              <h3 className="px-3 pb-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-tertiary">{t(sec.title)}</h3>
              <ul>
                {sec.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={close} className={item}>
                      {t(l.label)}
                      <ChevronRight className="size-3.5 opacity-40" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            ),
          )}

          {app.loggedIn ? (
            <section className="mt-5 lg:hidden">
              <h3 className="px-3 pb-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-tertiary">{t("menu.account")}</h3>
              <ul>
                {ACCOUNT_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={close} className={cn(item, "justify-start gap-2.5")}>
                      <l.icon className="size-4 text-tertiary" strokeWidth={1.75} />
                      {t(l.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-5">
            <h3 className="px-3 pb-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-tertiary">{t("menu.community")}</h3>
            <SocialLinks size="sm" className="px-3" onNavigate={close} />
          </section>

          <section className="mt-6 space-y-2">
            <h3 className="px-3 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-tertiary">{t("menu.preferences")}</h3>
            <div className="flex items-center justify-between rounded-md bg-bg-subtle px-3 py-2">
              <span className="text-[14px] text-secondary">{t("nav.language")}</span>
              <LanguageSwitcher full />
            </div>
            <div className="flex items-center justify-between rounded-md bg-bg-subtle px-3 py-2">
              <span className="text-[14px] text-secondary">{t("nav.theme")}</span>
              <ThemeToggle />
            </div>
          </section>
        </div>
      </SheetContent>
    </D.Root>
  );
}
