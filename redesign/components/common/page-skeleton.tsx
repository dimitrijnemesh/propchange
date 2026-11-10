/** Lightweight route-transition placeholder: header block + a few content rows. */
export function PageSkeleton() {
  return (
    <div className="container-market py-8" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-8 w-56 rounded-md" />
      <div className="skeleton mt-3 h-4 w-80 max-w-full rounded" />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
      <div className="mt-6 space-y-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
