"use client";

import Link from "next/link";
import { addDays, formatWeekRangeLabel, startOfWeek } from "../utils";

export function CalendarHeader({
  weekStart,
  refreshing,
  onWeekStartChange,
  onPrevWeek,
  onNextWeek,
  onToday,
  onRefresh,
  onCreate,
  onNewEvent,
}) {
  const handleToday = onToday || (() => onWeekStartChange?.(startOfWeek(new Date())));
  const handlePrev = onPrevWeek || (() => onWeekStartChange?.((date) => addDays(date, -7)));
  const handleNext = onNextWeek || (() => onWeekStartChange?.((date) => addDays(date, 7)));
  const handleCreate = onNewEvent || onCreate;

  return (
    <section className="home-panel home-panel-strong shrink-0 rounded-[24px] p-3.5 sm:rounded-[28px] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center justify-between gap-3 sm:block">
          <div className="flex items-center gap-3">
            <h2 className="min-w-0 truncate font-[family:var(--font-inter)] text-[15px] font-semibold tracking-[-0.02em] text-[var(--color-app-text)] sm:text-xl">
              {weekStart ? formatWeekRangeLabel(weekStart) : ""}
            </h2>
            <span className="hidden sm:inline-flex rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-app-text-soft)]">
              Week View
            </span>
          </div>
          <button
            type="button"
            onClick={handleToday}
            className="shrink-0 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1.5 text-xs font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] sm:hidden"
          >
            Today
          </button>
        </div>

        <div className="grid grid-cols-[auto_auto_auto_minmax(0,1fr)] items-center gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={handleToday}
            className="hidden items-center gap-1.5 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1.5 text-xs font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] sm:inline-flex"
          >
            <span>Today</span>
            <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-1 py-0.2 font-[family:var(--font-mono)] text-[9px]">T</kbd>
          </button>

          <div className="flex items-center overflow-hidden rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)]">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous week"
              className="flex h-8 w-8 items-center justify-center text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="h-4 w-px bg-[var(--color-app-border)]" />
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next week"
              className="flex h-8 w-8 items-center justify-center text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Refresh events"
          >
            <svg
              width="13"
              height="13"
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
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-app-accent)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-app-accent-fg)] transition hover:brightness-110 sm:text-xs"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3 w-3">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <span>New event</span>
            <kbd className="hidden rounded bg-[var(--color-app-bg)]/20 px-1 py-0.2 font-[family:var(--font-mono)] text-[9px] sm:inline">C</kbd>
          </button>

          <Link
            href="/dashboard"
            className="hidden rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] sm:inline-flex"
          >
            Back to brief
          </Link>
        </div>
      </div>
    </section>
  );
}
