import { SOCIALS, type SocialKey } from "@/lib/site-nav";
import { cn } from "@/lib/utils";
import { InstagramIcon, XIcon } from "./social-icons";

export const SOCIAL_ICON: Record<SocialKey, React.ElementType> = {
  x: XIcon,
  instagram: InstagramIcon,
};

/** Row of round social buttons linking straight to the official accounts (new tab). */
export function SocialLinks({ className, size = "md", onNavigate }: { className?: string; size?: "sm" | "md"; onNavigate?: () => void }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {SOCIALS.map((s) => {
        const Icon = SOCIAL_ICON[s.key];
        return (
          <li key={s.key}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              aria-label={`${s.name} — ${s.handle}`}
              title={s.name}
              className={cn(
                "inline-flex items-center justify-center rounded-full border border-border text-secondary transition-colors hover:border-border-strong hover:bg-bg-muted hover:text-text",
                size === "sm" ? "size-8" : "size-9",
              )}
            >
              <Icon className={size === "sm" ? "size-4" : "size-[18px]"} strokeWidth={1.75} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
