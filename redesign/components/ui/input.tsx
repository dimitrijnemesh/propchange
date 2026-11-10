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

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        inputBase,
        "cursor-pointer appearance-none bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-9",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7385' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-caption text-secondary", className)} {...props} />;
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-danger">{children}</p>;
}
