"use client";

import Link from "next/link";
import { addDays, formatWeekRangeLabel, startOfWeek } from "../utils";

export function CalendarHeader({ weekStart, refreshing, onWeekStartChange, onRefresh, onCreate }) {
  return (
    <section className="home-panel home-panel-strong shrink-0 rounded-[28px] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[family:var(--font-inter)] text-lg font-medium text-[var(--color-app-text)] sm:text-xl">{weekStart ? formatWeekRangeLabel(weekStart) : ""}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => onWeekStartChange(startOfWeek(new Date()))} className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]">Today</button>
          <div className="flex items-center overflow-hidden rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)]">
            <button onClick={() => onWeekStartChange((date) => addDays(date, -7))} aria-label="Previous week" className="flex h-9 w-9 items-center justify-center text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            <div className="h-5 w-px bg-[var(--color-app-border)]" />
            <button onClick={() => onWeekStartChange((date) => addDays(date, 7))} aria-label="Next week" className="flex h-9 w-9 items-center justify-center text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          </div>
          <button onClick={onRefresh} disabled={refreshing} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Refresh events"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={refreshing ? "animate-spin" : ""}><path d="M4 4v5h5" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 9a8 8 0 0114-4.9M20 15a8 8 0 01-14 4.9" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          <button onClick={onCreate} className="rounded-full bg-[var(--color-app-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-app-accent-fg)] transition hover:opacity-90">+ Create</button>
          <Link href="/dashboard" className="hidden rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] sm:inline-flex">Back to brief</Link>
        </div>
      </div>
    </section>
  );
}
