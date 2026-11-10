"use client";
import * as Sw from "@radix-ui/react-switch";
import * as Cb from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  id,
  label,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id?: string;
  label?: string;
}) {
  return (
    <Sw.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className="relative h-6 w-10 shrink-0 cursor-pointer rounded-full bg-border-strong transition-colors data-[state=checked]:bg-primary"
    >
      <Sw.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-150 data-[state=checked]:translate-x-[18px]" />
    </Sw.Root>
  );
}

export function Checkbox({
  checked,
  onCheckedChange,
  id,
  className,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id?: string;
  className?: string;
}) {
  return (
    <Cb.Root
      id={id}
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface data-[state=checked]:border-primary data-[state=checked]:bg-primary",
        className,
      )}
    >
      <Cb.Indicator>
        <Check className="size-3.5 text-white" strokeWidth={3} />
      </Cb.Indicator>
    </Cb.Root>
  );
}
