"use client";
import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, flagOf, type Country } from "@/lib/countries";
import { cn } from "@/lib/utils";

/** Searchable dial-code dropdown (flag + code), used in front of the phone number input. */
export function CountryCodePicker({ value, onChange }: { value: Country; onChange: (c: Country) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase().replace(/^\+/, "");
    if (!t) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(t) || c.dial.slice(1).startsWith(t) || c.iso.toLowerCase() === t);
  }, [q]);

  return (
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country code ${value.name} ${value.dial}`}
        className="inline-flex h-10 items-center gap-1.5 rounded-md border border-transparent bg-bg-subtle px-2.5 text-[14px] font-medium transition-colors hover:border-border-strong"
      >
        <span className="text-[16px] leading-none">{flagOf(value.iso)}</span>
        <span className="tnum">{value.dial}</span>
        <ChevronDown className={cn("size-3.5 text-tertiary transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="anim-fade absolute left-0 top-[calc(100%+6px)] z-50 w-[280px] overflow-hidden rounded-lg border border-border bg-surface shadow-md">
          <div className="relative border-b border-border p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-tertiary" />
            <input
              ref={search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search country or code"
              aria-label="Search country or code"
              className="h-9 w-full rounded-md bg-bg-subtle pl-8 pr-2 text-[14px] outline-none placeholder:text-tertiary"
            />
          </div>
          <ul role="listbox" aria-label="Country codes" className="scroll-thin max-h-[260px] overflow-y-auto p-1">
            {list.length === 0 ? <li className="px-3 py-6 text-center text-[13px] text-tertiary">No matches</li> : null}
            {list.map((c) => {
              const on = c.iso === value.iso;
              return (
                <li key={c.iso} role="option" aria-selected={on}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                      setQ("");
                    }}
                    className={cn("flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-[14px] hover:bg-bg-subtle", on && "bg-primary-soft text-primary-soft-text")}
                  >
                    <span className="text-[16px] leading-none">{flagOf(c.iso)}</span>
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="tnum text-tertiary">{c.dial}</span>
                    {on ? <Check className="size-3.5" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
