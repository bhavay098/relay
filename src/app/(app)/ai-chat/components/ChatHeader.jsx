import { ThemeToggle } from "../../../components/ThemeToggle";

export function ChatHeader({ sidebarOpen, onOpenSidebar }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center gap-3">
        {!sidebarOpen ? (
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Show chats"
            className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M9 6l6 6-6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)]">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="4"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M9 4v16M15 4v16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <h1 className="font-[family:var(--font-inter)] text-base font-semibold tracking-[-0.03em] text-[var(--color-app-text)] sm:text-[18px]">
          Chat
        </h1>
      </div>

      <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-app-text-muted)]">
        <ThemeToggle />
      </div>
    </div>
  );
}
