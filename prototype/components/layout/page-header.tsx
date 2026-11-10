import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  crumbs,
  title,
  badges,
  description,
  actions,
  className,
}: {
  crumbs?: { label: string; href?: string }[];
  title: React.ReactNode;
  badges?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pb-6 pt-6 md:pt-8", className)}>
      {crumbs?.length ? (
        <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-caption text-tertiary">
          {crumbs.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {c.href ? (
                <Link href={c.href} className="hover:text-text">
                  {c.label}
                </Link>
              ) : (
                <span className="text-secondary">{c.label}</span>
              )}
              {i < crumbs.length - 1 ? <ChevronRight className="size-3" /> : null}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-h1">{title}</h1>
            {badges ? <div className="flex flex-wrap items-center gap-1.5">{badges}</div> : null}
          </div>
          {description ? <div className="mt-2 text-secondary">{description}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
