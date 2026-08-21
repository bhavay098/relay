export function CommandPaletteItem({ item, isSelected, onSelect, onHover }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`flex w-full items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-left transition ${
        isSelected
          ? "border border-[var(--color-app-border-strong)] bg-[var(--color-app-surface-strong)] text-[var(--color-app-text)]"
          : "border border-transparent text-[var(--color-app-text-muted)] hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] ${
          isSelected
            ? "bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)]"
            : "bg-[var(--color-app-surface)] text-[var(--color-app-text-soft)]"
        }`}
      >
        {item.icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-xs font-semibold text-[var(--color-app-text)]">
            {item.title}
          </span>
          <span className="rounded-full bg-[var(--color-app-surface)] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[var(--color-app-text-soft)]">
            {item.category}
          </span>
        </div>
        <p className="truncate text-[11px] text-[var(--color-app-text-muted)]">
          {item.subtitle}
        </p>
      </div>

      {item.shortcut ? (
        <span className="shrink-0 rounded-[6px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1.5 py-0.5 font-[family:var(--font-mono)] text-[10px] font-semibold text-[var(--color-app-text-soft)]">
          {item.shortcut}
        </span>
      ) : null}
    </button>
  );
}
