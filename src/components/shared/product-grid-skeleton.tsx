export function ProductGridSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="h-7 bg-muted animate-pulse rounded w-2/5" />
            <div className="h-4 bg-muted animate-pulse rounded w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-11/12" />
            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
