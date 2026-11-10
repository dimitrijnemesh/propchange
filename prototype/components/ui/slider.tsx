"use client";
import * as S from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  format = (v: number) => String(v),
  label,
  className,
  showBubble = true,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  label: string;
  className?: string;
  showBubble?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("w-full", className)}>
      <div className="relative pt-7">
        {showBubble ? (
          <span
            className="tnum absolute top-0 -translate-x-1/2 rounded-sm bg-primary px-1.5 py-0.5 text-caption text-on-primary"
            style={{ left: `calc(${pct}% + ${8 - pct * 0.16}px)` }}
          >
            {format(value)}
          </span>
        ) : null}
        <S.Root
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(v) => onChange(v[0])}
          className="relative flex h-5 w-full touch-none select-none items-center"
          aria-label={label}
        >
          <S.Track className="relative h-1.5 grow rounded-full bg-bg-muted">
            <S.Range className="absolute h-full rounded-full bg-primary" />
          </S.Track>
          <S.Thumb className="block size-4 rounded-full border-2 border-primary bg-white shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)]" />
        </S.Root>
      </div>
      <div className="tnum mt-1 flex justify-between text-caption text-tertiary">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
