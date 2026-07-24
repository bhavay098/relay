"use client";

import Link from "next/link";
import { addDays, formatWeekRangeLabel, startOfWeek } from "../utils";

export function CalendarHeader({ weekStart, refreshing, onWeekStartChange, onRefresh, onCreate }) {
  return (
    <section className="home-panel home-panel-strong shrink-0 rounded-[24px] p-3.5 sm:rounded-[28px] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center justify-between gap-3 sm:block">
          <h2 className="min-w-0 truncate font-[family:var(--font-inter)] text-[15px] font-medium tracking-[-0.02em] text-[var(--color-app-text)] sm:text-xl">
            {weekStart ? formatWeekRangeLabel(weekStart) : ""}
          </h2>
          <button onClick={() => onWeekStartChange(startOfWeek(new Date()))} className="shrink-0 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-[13px] font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] sm:hidden">Today</button>
        </div>

        <div className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 sm:flex sm:flex-wrap">
          <button onClick={() => onWeekStartChange(startOfWeek(new Date()))} className="hidden rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] sm:inline-flex">Today</button>
          <div className="flex items-center overflow-hidden rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)]">
            <button onClick={() => onWeekStartChange((date) => addDays(date, -7))} aria-label="Previous week" className="flex h-9 w-9 items-center justify-center text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            <div className="h-5 w-px bg-[var(--color-app-border)]" />
            <button onClick={() => onWeekStartChange((date) => addDays(date, 7))} aria-label="Next week" className="flex h-9 w-9 items-center justify-center text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </div>
          <button onClick={onRefresh} disabled={refreshing} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Refresh events"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={refreshing ? "animate-spin" : ""}><path d="M4 4v5h5" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 9a8 8 0 0114-4.9M20 15a8 8 0 01-14 4.9" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          <button onClick={onCreate} className="min-w-0 rounded-full bg-[var(--color-app-accent)] px-4 py-2 text-[13px] font-semibold text-[var(--color-app-accent-fg)] transition hover:opacity-90 sm:text-sm">Create event</button>
          <Link href="/dashboard" className="hidden rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] sm:inline-flex">Back to brief</Link>
        </div>
      </div>
    </section>
  );
}
