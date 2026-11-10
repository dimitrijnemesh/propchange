"use client";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import type { FaqCategory } from "@/mock/faq";
import { cn } from "@/lib/utils";

/** Searchable, categorised FAQ (help-center style). */
export function FaqBrowser({ data }: { data: FaqCategory[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data
      .filter((c) => cat === "all" || c.id === cat)
      .map((c) => ({ ...c, items: c.items.filter((i) => !term || (i.q + " " + i.a).toLowerCase().includes(term)) }))
      .filter((c) => c.items.length);
  }, [data, q, cat]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="FAQ categories" className="lg:sticky lg:top-24 lg:h-fit">
        <div className="scroll-thin -mx-4 flex gap-1 overflow-x-auto px-4 [mask-image:linear-gradient(90deg,#000_85%,transparent)] lg:mx-0 lg:flex-col lg:px-0 lg:[mask-image:none]">
          {[{ id: "all", title: "All questions" }, ...data].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              aria-pressed={cat === c.id}
              className={cn(
                "h-9 shrink-0 rounded-md px-3 text-left text-[14px] font-medium transition-colors",
                cat === c.id ? "bg-primary-soft text-primary-soft-text" : "text-secondary hover:bg-bg-subtle hover:text-text",
              )}
            >
              {c.title}
            </button>
          ))}
        </div>
      </nav>
      <div className="min-w-0">
        <label className="relative block">
          <span className="sr-only">Search questions</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-tertiary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions…"
            className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-[15px] outline-none transition-colors placeholder:text-tertiary focus:border-primary"
          />
        </label>
        {list.length === 0 ? (
          <p className="mt-10 text-center text-secondary">No questions match “{q}”. Try the Help Center.</p>
        ) : (
          list.map((c) => (
            <section key={c.id} id={c.id} className="mt-8 scroll-mt-28">
              <h2 className="mb-3 text-[18px] font-semibold">{c.title}</h2>
              <Accordion items={c.items} />
            </section>
          ))
        )}
      </div>
    </div>
  );
}
