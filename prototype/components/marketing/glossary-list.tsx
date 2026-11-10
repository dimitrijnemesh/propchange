"use client";
import { Link2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function GlossaryList({ items }: { items: { term: string; id: string; def: string }[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => items.filter((i) => `${i.term} ${i.def}`.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );
  const letters = [...new Set(items.map((i) => i.term[0].toUpperCase()))];
  const groups = letters
    .map((l) => ({ l, list: filtered.filter((i) => i.term[0].toUpperCase() === l) }))
    .filter((g) => g.list.length);
  return (
    <div>
      <div className="sticky top-14 z-10 -mx-4 space-y-3 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur md:top-16 md:mx-0 md:px-0">
        <Input icon={<Search />} placeholder="Search terms" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search glossary" className="max-w-md" />
        <nav aria-label="Alphabet" className="flex flex-wrap gap-1">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => {
            const has = groups.some((g) => g.l === l);
            return has ? (
              <a key={l} href={`#letter-${l}`} className="flex size-8 items-center justify-center rounded-md text-[13px] font-semibold hover:bg-bg-subtle">
                {l}
              </a>
            ) : (
              <span key={l} className="flex size-8 items-center justify-center text-[13px] text-disabled">
                {l}
              </span>
            );
          })}
        </nav>
      </div>
      {groups.length === 0 ? (
        <EmptyState icon={<Search />} title="No terms found" body={`Nothing matches “${q}”.`} />
      ) : (
        groups.map((g) => (
          <section key={g.l} id={`letter-${g.l}`} className="scroll-mt-40 pt-8">
            <h2 className="text-h2 text-primary-text">{g.l}</h2>
            <dl className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
              {g.list.map((i) => (
                <div key={i.id} id={i.id} className={cn("group scroll-mt-40 px-5 py-4 target:bg-primary-soft")}>
                  <dt className="flex items-center gap-2 text-[15px] font-semibold">
                    {i.term}
                    <a href={`#${i.id}`} aria-label={`Link to ${i.term}`} className="text-tertiary opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
                      <Link2 className="size-4" />
                    </a>
                  </dt>
                  <dd className="mt-1 text-secondary">{i.def}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))
      )}
    </div>
  );
}
