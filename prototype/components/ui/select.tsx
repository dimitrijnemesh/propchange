"use client";
import * as M from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type Opt = { value: string; label: React.ReactNode; disabled?: boolean };

/** Read `<option>` children (incl. arrays from .map) into a flat list. */
function readOptions(children: React.ReactNode): Opt[] {
  const out: Opt[] = [];
  React.Children.toArray(children).forEach((c) => {
    if (!React.isValidElement(c)) return;
    const p = c.props as { value?: string | number; children?: React.ReactNode; disabled?: boolean };
    if (c.type === "option") {
      const label = p.children;
      out.push({ value: p.value != null ? String(p.value) : String(label ?? ""), label, disabled: p.disabled });
    } else if (p.children) out.push(...readOptions(p.children));
  });
  return out;
}

/**
 * Exchange-style select. Same API as a native <select> (value, onChange(e) with e.target.value,
 * <option> children) so call sites don't change, but the menu is our own instead of the OS list.
 */
export const Select = React.forwardRef<
  HTMLButtonElement,
  {
    id?: string;
    value?: string | number;
    defaultValue?: string;
    onChange?: (e: { target: { value: string } }) => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    "aria-label"?: string;
  }
>(({ id, value, defaultValue, onChange, children, className, disabled, ...rest }, ref) => {
  const opts = readOptions(children);
  const [inner, setInner] = React.useState(defaultValue ?? opts[0]?.value ?? "");
  const cur = value != null ? String(value) : inner;
  const sel = opts.find((o) => o.value === cur) ?? opts[0];
  const pick = (v: string) => {
    if (value == null) setInner(v);
    onChange?.({ target: { value: v } });
  };
  return (
    <M.Root modal={false}>
      <M.Trigger
        ref={ref}
        id={id}
        disabled={disabled}
        aria-label={rest["aria-label"]}
        className={cn(
          "group flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-transparent bg-bg-subtle px-3 text-left text-sm text-text outline-none transition-colors hover:border-border-strong focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-primary",
          className,
        )}
      >
        <span className="truncate">{sel?.label}</span>
        <ChevronDown className="size-4 shrink-0 text-tertiary transition-transform group-data-[state=open]:rotate-180" />
      </M.Trigger>
      <M.Portal>
        <M.Content
          align="start"
          sideOffset={6}
          className="anim-fade z-50 max-h-[320px] min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-md"
        >
          <M.RadioGroup value={cur} onValueChange={pick}>
            {opts.map((o) => (
              <M.RadioItem
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className="flex h-9 cursor-pointer select-none items-center justify-between gap-3 rounded-md px-2.5 text-sm text-secondary outline-none data-[disabled]:opacity-40 data-[highlighted]:bg-bg-subtle data-[state=checked]:font-semibold data-[state=checked]:text-text"
              >
                <span className="truncate">{o.label}</span>
                <M.ItemIndicator>
                  <Check className="size-4 text-primary-text" />
                </M.ItemIndicator>
              </M.RadioItem>
            ))}
          </M.RadioGroup>
        </M.Content>
      </M.Portal>
    </M.Root>
  );
});
Select.displayName = "Select";
