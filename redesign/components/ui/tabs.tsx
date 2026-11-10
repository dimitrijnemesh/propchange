import Link from "next/link";
import { cn } from "@/lib/utils";

/** Underline tabs driven by URL (SSR-friendly). */
export function LinkTabs({
  items,
  active,
  className,
}: {
  items: { key: string; label: React.ReactNode; href: string }[];
  active: string;
  className?: string;
}) {
  return (
    <div className={cn("scroll-thin -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0", className)}>
      <nav className="flex min-w-max gap-6 border-b border-border" aria-label="Tabs">
        {items.map((it) => {
          const on = it.key === active;
          return (
            <Link
              key={it.key}
              href={it.href}
              scroll={false}
              aria-current={on ? "page" : undefined}
              className={cn(
                "-mb-px border-b-2 pb-3 pt-1 text-sm font-semibold transition-colors",
                on ? "border-primary text-text" : "border-transparent text-secondary hover:text-text",
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Pill-style option buttons (filters, period switchers). */
export function Pills<T extends string | number>({
  options,
  value,
  onChange,
  size = "md",
  className,
  ariaLabel,
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            role="radio"
            aria-checked={on}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full font-semibold transition-colors duration-150",
              size === "sm" ? "h-7 px-3 text-xs" : "h-8 px-3.5 text-[13px]",
              on ? "bg-primary-soft text-primary-soft-text" : "text-secondary hover:bg-bg-subtle hover:text-text",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
