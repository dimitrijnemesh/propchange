import * as React from "react";
import { cn } from "@/lib/utils";

export const inputBase =
  "h-10 w-full rounded-md border border-transparent bg-bg-subtle px-3 text-sm text-text placeholder:text-disabled transition-colors duration-150 hover:border-border-strong focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-[var(--focus-ring)] disabled:opacity-50";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { suffix?: React.ReactNode; icon?: React.ReactNode; invalid?: boolean }
>(({ className, suffix, icon, invalid, ...props }, ref) => {
  if (!suffix && !icon)
    return <input ref={ref} className={cn(inputBase, invalid && "border-danger", className)} {...props} />;
  return (
    <div className={cn("relative", className)}>
      {icon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tertiary [&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      <input
        ref={ref}
        className={cn(inputBase, icon && "pl-9", suffix && "pr-14", invalid && "border-danger")}
        {...props}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-caption text-tertiary">
          {suffix}
        </span>
      ) : null}
    </div>
  );
});
Input.displayName = "Input";

export { Select } from "./select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-caption text-secondary", className)} {...props} />;
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-danger">{children}</p>;
}
