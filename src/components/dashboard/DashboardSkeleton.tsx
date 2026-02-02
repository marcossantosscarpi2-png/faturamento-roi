export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="h-10 w-48 rounded-lg bg-muted" />
        <div className="h-10 w-32 rounded-lg bg-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-2 h-8 w-28 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
      </div>

      <div>
        <div className="mb-4 h-6 w-48 rounded bg-muted" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="mt-2 h-4 w-full rounded bg-muted" />
              <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
