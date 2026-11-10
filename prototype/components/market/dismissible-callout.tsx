"use client";
import { Info, X } from "lucide-react";
import { useState } from "react";

export function DismissibleCallout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary-soft px-4 py-3 text-primary-soft-text">
      <Info className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      <p className="flex-1 text-[13px] font-medium">{children}</p>
      <button aria-label="Dismiss" onClick={() => setOpen(false)} className="opacity-70 hover:opacity-100">
        <X className="size-4" />
      </button>
    </div>
  );
}
