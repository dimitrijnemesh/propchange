import { cn } from "@/lib/utils";

/**
 * Solana logomark — rendered as a CSS mask (`.sol-mark` in app/globals.css) filled with the
 * brand gradient in dark mode and a single ink colour in light mode. No SVG ids, so it is safe
 * to render any number of times on server and client.
 *
 * PLACEHOLDER SHAPE: before launch, replace the mask SVG in `.sol-mark` (globals.css) with the
 * official logomark from Solana's brand kit (solana.com/branding) and follow its usage rules.
 */
export function SolanaMark({ className, tone = "auto" }: { className?: string; tone?: "auto" | "gradient" | "mono" }) {
  return <span aria-hidden className={cn("sol-mark size-4 shrink-0", tone === "gradient" && "sol-gradient", tone === "mono" && "sol-mono", className)} />;
}

/** Small "Powered by Solana" / "Built on Solana" / "Settled on Solana" attribution. */
export function SolanaBadge({
  label = "Powered by Solana",
  className,
  variant = "plain",
}: {
  label?: string;
  className?: string;
  variant?: "plain" | "chip";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium",
        variant === "chip" ? "h-6 rounded-full border border-border bg-bg-subtle px-2.5 text-secondary" : "text-tertiary",
        className,
      )}
    >
      <SolanaMark className="size-3.5" />
      {label}
    </span>
  );
}
