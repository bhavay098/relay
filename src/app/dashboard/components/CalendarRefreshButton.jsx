"use client";

import { useState } from "react";

export function CalendarRefreshButton() {
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
        setError(data.error ?? "Failed to refresh Google Calendar");
        return;
      }

      setStatus(
        `Fetched ${data.count ?? 0} event${data.count === 1 ? "" : "s"}.`,
      );
    } catch (err) {
      setError("Failed to refresh Google Calendar");
      console.error(err);
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
        className="inline-flex min-h-12 w-full items-center justify-center rounded-[18px] bg-[var(--color-app-accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(217,119,6,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
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
