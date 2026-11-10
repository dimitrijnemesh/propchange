"use client";
import { Check, Globe } from "lucide-react";
import { useState } from "react";
import { Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownTrigger } from "@/components/ui/dropdown";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { useI18n } from "./i18n-provider";

export function LanguageSwitcher({ onBlue, className, full }: { onBlue?: boolean; className?: string; full?: boolean }) {
  const { locale, t } = useI18n();
  const [pending, setPending] = useState(false);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const choose = (code: Locale) => {
    if (code === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
    // Full reload: every server-rendered string, client component and <html lang> updates together.
    setPending(true);
    window.location.reload();
  };

  return (
    <Dropdown>
      <DropdownTrigger
        aria-label={`${t("nav.language")}: ${current.label}`}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-[13px] font-semibold transition-colors",
          onBlue ? "text-text hover:bg-bg-muted dark:text-white dark:hover:bg-white/10" : "text-secondary hover:bg-bg-subtle hover:text-text",
          pending && "opacity-60",
          className,
        )}
      >
        <Globe className="size-[18px]" strokeWidth={1.75} />
        <span className="tnum">{full ? current.label : current.short}</span>
      </DropdownTrigger>
      <DropdownContent className="max-h-[min(70vh,460px)] w-[220px] overflow-y-auto">
        <DropdownLabel>{t("nav.language")}</DropdownLabel>
        {LOCALES.map((l) => (
          <DropdownItem key={l.code} onSelect={() => choose(l.code)} lang={l.code} className={cn(l.code === locale && "text-primary-text")}>
            <span className="w-8 text-caption text-tertiary">{l.short}</span>
            <span className="flex-1">{l.label}</span>
            {l.code === locale ? <Check className="text-primary-text" /> : null}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
