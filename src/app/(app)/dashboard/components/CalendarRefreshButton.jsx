"use client";

import { useState } from "react";

const CALENDAR_REFRESH_ERROR = "Could not refresh Google Calendar right now.";

export function CalendarRefreshButton({ onRefreshed }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function refreshCalendar() {
    setLoading(true);
    setStatus(null);
    setError(null);

    try {
      const res = await fetch("/api/calendar/refresh", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Calendar refresh error response:", data);
        setError(CALENDAR_REFRESH_ERROR);
        return;
      }

      setStatus(
        `Fetched ${data.count ?? 0} event${data.count === 1 ? "" : "s"}.`,
      );
      onRefreshed?.();
    } catch (err) {
      console.error(err);
      setError(CALENDAR_REFRESH_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={refreshCalendar}
        disabled={loading}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-[18px] bg-[var(--color-app-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-app-accent-fg)] shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Refreshing Calendar..." : "Refresh Calendar"}
      </button>

      <div className="min-h-5 text-sm">
        {status ? (
          <p className="text-[var(--color-success)]">{status}</p>
        ) : null}
        {error ? <p className="text-[var(--color-error)]">{error}</p> : null}
      </div>
    </div>
  );
}
