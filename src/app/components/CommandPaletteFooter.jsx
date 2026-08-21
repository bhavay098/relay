export function CommandPaletteFooter() {
  return (
    <div className="flex items-center justify-between border-t border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-2 text-[10px] text-[var(--color-app-text-soft)] sm:px-5">
      <div className="flex items-center gap-3">
        <span>
          <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1 py-0.5 font-[family:var(--font-mono)] font-semibold">
            ↑
          </kbd>{" "}
          <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1 py-0.5 font-[family:var(--font-mono)] font-semibold">
            ↓
          </kbd>{" "}
          navigate
        </span>
        <span>
          <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1 py-0.5 font-[family:var(--font-mono)] font-semibold">
            ↵
          </kbd>{" "}
          select
        </span>
      </div>
      <span className="hidden sm:inline">Relay Command v1.0</span>
    </div>
  );
}
