"use client";

export function ToolExecutionBadge({ status = "Thinking..." }) {
  return (
    <div className="my-2 flex items-center gap-2.5 rounded-[14px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-surface)] px-3 py-2 text-xs font-medium text-[var(--color-app-text-muted)] shadow-sm animate-fadeIn">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-[var(--color-app-accent)] animate-ping" />
      </span>
      <span className="truncate">{status}</span>
    </div>
  );
}
