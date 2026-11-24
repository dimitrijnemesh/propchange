"use client";
import * as C from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({ checked, onCheckedChange, id, className }: { checked: boolean; onCheckedChange: (v: boolean) => void; id?: string; className?: string }) {
  return (
    <C.Root
      id={id}
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className={cn(
        "inline-flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[5px] border-[1.5px] border-border-strong bg-transparent transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)] data-[state=checked]:border-primary data-[state=checked]:bg-primary",
        className,
      )}
    >
      <C.Indicator>
        <Check className="size-3 text-on-primary" strokeWidth={3} />
      </C.Indicator>
    </C.Root>
  );
}
