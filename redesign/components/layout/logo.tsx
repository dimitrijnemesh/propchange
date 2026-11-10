import Link from "next/link";
import { cn } from "@/lib/utils";

/** Brand mark (provided by the user) + wordmark. Never recolored: blue on light, white on dark. */
export function LogoMark({ size = 24, className, white }: { size?: number; className?: string; white?: boolean }) {
  const w = Math.round((size * 401) / 253);
  if (white)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/brand/mark-white.svg" alt="" width={w} height={size} className={cn("shrink-0", className)} />
    );
  return (
    <span className={cn("relative inline-block shrink-0", className)} style={{ width: w, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/mark.svg" alt="" width={w} height={size} className="absolute inset-0 dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/mark-white.svg" alt="" width={w} height={size} className="absolute inset-0 hidden dark:block" />
    </span>
  );
}

/** `onBlue` (navbar variant): Space Grotesk wordmark; blue mark + two-tone text in light, all white in dark. */
export function Logo({
  className,
  href = "/",
  compact,
  onBlue,
  introTarget,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
  onBlue?: boolean;
  introTarget?: boolean;
}) {
  if (onBlue)
    return (
      <Link
        href={href}
        data-intro-target={introTarget ? "" : undefined}
        className={cn("inline-flex items-center gap-2 text-text dark:text-white", className)}
        aria-label="PropChange home"
      >
        <LogoMark size={19} />
        <span className="font-display text-[18px] font-medium leading-5 tracking-[-0.01em] min-[380px]:text-[20px]">
          <span className="text-primary-text dark:text-white">Prop</span>Change
        </span>
      </Link>
    );
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)} aria-label="PropChange home">
      <LogoMark size={compact ? 17 : 19} />
      <span className={cn("font-bold tracking-[-0.01em]", compact ? "text-[18px]" : "text-[20px]")}>
        <span className="text-primary-text">Prop</span>
        <span className="text-text">Change</span>
      </span>
    </Link>
  );
}
