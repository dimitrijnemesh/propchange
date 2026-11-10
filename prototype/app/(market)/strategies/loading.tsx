import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-market py-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-4 h-9 w-56" />
      <Skeleton className="mt-6 h-12 w-full" />
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <div className="h-10 bg-bg-subtle" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex h-14 items-center gap-4 border-t border-border px-4">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
