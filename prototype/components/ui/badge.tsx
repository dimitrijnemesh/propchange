import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-sm px-2 text-caption [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        neutral: "bg-bg-muted text-secondary",
        primary: "bg-primary-soft text-primary-soft-text",
        success: "bg-success-soft text-success",
        danger: "bg-danger-soft text-danger",
        warning: "bg-warning-soft text-warning",
        outline: "border border-border-strong text-secondary",
        solid: "bg-primary text-on-primary",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
