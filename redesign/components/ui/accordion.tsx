"use client";
import * as A from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

export function Accordion({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <A.Root type="single" collapsible className="divide-y divide-border rounded-lg border border-border bg-surface">
      {items.map((it, i) => (
        <A.Item key={i} value={`i${i}`}>
          <A.Header>
            <A.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold hover:bg-bg-subtle">
              {it.q}
              <ChevronDown
                className="size-5 shrink-0 text-tertiary transition-transform duration-200 group-data-[state=open]:rotate-180"
                strokeWidth={1.75}
              />
            </A.Trigger>
          </A.Header>
          <A.Content className="px-5 pb-5 text-secondary">{it.a}</A.Content>
        </A.Item>
      ))}
    </A.Root>
  );
}
