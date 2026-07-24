"use client";

import Link from "next/link";

const MAILBOX_OPTIONS = [
  { id: "inbox", label: "Inbox" },
  { id: "sent", label: "Sent" },
];

export function EmailsHeader({
  loading,
  error,
  messagesCount,
  filteredCount,
  mailbox,
  onMailboxChange,
  query,
  onQueryChange,
  onRefresh,
  refreshing,
  hasMessages,
}) {
  const mailboxLabel = mailbox === "sent" ? "Sent" : "Inbox";

  return (
    <section className="home-panel home-panel-strong min-w-0 overflow-hidden rounded-[24px] p-4 sm:rounded-[28px] sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h2 className="mt-3 text-balance font-[family:var(--font-inter)] text-[clamp(1.35rem,6vw,2.2rem)] font-normal leading-[1.08] tracking-[-0.03em] text-[var(--color-app-text)]">
            Recent messages in one clean stack.
          </h2>
          <div
            role="group"
            aria-label="Mailbox"
            className="mt-4 inline-flex rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] p-1"
          >
            {MAILBOX_OPTIONS.map((option) => {
              const isActive = mailbox === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onMailboxChange(option.id)}
                  aria-pressed={isActive}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)]"
                      : "text-[var(--color-app-text-muted)] hover:text-[var(--color-app-text)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {!loading && !error ? (
            <p className="mt-2 text-sm text-[var(--color-app-text-soft)]">
              {messagesCount} {mailboxLabel.toLowerCase()} message
              {messagesCount === 1 ? "" : "s"}
              {query.trim() ? ` · ${filteredCount} matching` : ""}
            </p>
          ) : null}
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={refreshing ? "animate-spin" : ""}
            >
              <path d="M4 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 9a8 8 0 0114-4.9M20 15a8 8 0 01-14 4.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <Link
            href="/dashboard"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] sm:flex-none"
          >
            Back to brief
          </Link>
        </div>
      </div>

      {hasMessages ? (
        <div className="mt-5 flex items-center gap-2 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-app-text-soft)]">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={`Search ${mailboxLabel.toLowerCase()} by sender, subject, or snippet…`}
            className="w-full bg-transparent text-sm text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-soft)] focus:outline-none"
          />
          {query ? (
            <button onClick={() => onQueryChange("")} className="shrink-0 text-xs text-[var(--color-app-text-soft)] transition hover:text-[var(--color-app-text)]">
              Clear
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
