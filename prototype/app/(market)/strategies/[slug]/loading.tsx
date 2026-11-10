import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-market py-8">
      <Skeleton className="h-4 w-56" />
      <Skeleton className="mt-4 h-9 w-72" />
      <Skeleton className="mt-3 h-5 w-96 max-w-full" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[108px] rounded-lg" />
        ))}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[380px] rounded-lg" />
          <Skeleton className="h-[260px] rounded-lg" />
        </div>
        <Skeleton className="h-[560px] rounded-xl lg:col-span-4" />
      </div>
    </div>
  );
}
