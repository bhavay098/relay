export function RowSkeleton() {
  return <div className="flex items-center gap-3 border-b border-[var(--color-app-border)] px-4 py-3 last:border-b-0 sm:px-5"><div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[var(--color-app-surface-strong)]" /><div className="min-w-0 flex-1 space-y-2"><div className="h-3 w-1/4 animate-pulse rounded bg-[var(--color-app-surface-strong)]" /><div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-app-surface-strong)]" /></div><div className="h-3 w-10 shrink-0 animate-pulse rounded bg-[var(--color-app-surface-strong)]" /></div>;
}
