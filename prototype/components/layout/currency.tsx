"use client";
import { Check } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownTrigger } from "@/components/ui/dropdown";
import { CURRENCIES, CURRENCY_COOKIE, type CurrencyCode, fmtPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

const Ctx = createContext<{ code: CurrencyCode; set: (c: CurrencyCode) => void }>({ code: "USD", set: () => {} });

export function CurrencyProvider({ initial, children }: { initial: CurrencyCode; children: React.ReactNode }) {
  const [code, setCode] = useState<CurrencyCode>(initial);
  const set = (c: CurrencyCode) => {
    document.cookie = `${CURRENCY_COOKIE}=${c}; path=/; max-age=31536000; samesite=lax`;
    setCode(c);
  };
  return <Ctx.Provider value={{ code, set }}>{children}</Ctx.Provider>;
}

export const useCurrency = () => useContext(Ctx).code;

/** A Seat price in the user's preferred currency. */
export function Price({ value, digits, className }: { value: number; digits?: number; className?: string }) {
  const code = useCurrency();
  return <span className={cn("tnum", className)}>{fmtPrice(value, code, digits)}</span>;
}

export function CurrencySwitcher({ className }: { className?: string }) {
  const { code, set } = useContext(Ctx);
  return (
    <Dropdown>
      <DropdownTrigger
        aria-label={`Currency: ${code}`}
        className={cn("inline-flex size-9 items-center justify-center rounded-full text-[17px] font-medium text-text transition-colors hover:bg-bg-muted dark:text-white dark:hover:bg-white/10", className)}
      >
        {CURRENCIES.find((c) => c.code === code)?.symbol ?? code}
      </DropdownTrigger>
      <DropdownContent className="w-[220px]">
        <DropdownLabel>Currency</DropdownLabel>
        {CURRENCIES.map((c) => (
          <DropdownItem key={c.code} onSelect={() => set(c.code)} className={cn(c.code === code && "text-primary-text")}>
            <span className="w-8 text-caption text-tertiary">{c.symbol}</span>
            <span className="flex-1">
              {c.code} · {c.label}
            </span>
            {c.code === code ? <Check className="text-primary-text" /> : null}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
