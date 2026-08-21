"use client";

import { useState } from "react";
import { useToast } from "../../../components/ToastProvider";

const CALENDAR_REFRESH_ERROR = "Could not refresh Google Calendar right now.";
const CALENDAR_RECONNECT_ERROR =
  "Google Calendar access has expired or been revoked. Reconnect Google Calendar and try again.";

export function CalendarRefreshButton({ onRefreshed }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useToast();

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
        const errMsg =
          data?.error === CALENDAR_RECONNECT_ERROR
            ? CALENDAR_RECONNECT_ERROR
            : CALENDAR_REFRESH_ERROR;
        setError(errMsg);
        showError(errMsg);
        return;
      }

      const msg = `Fetched ${data.count ?? 0} event${data.count === 1 ? "" : "s"} from Calendar.`;
      setStatus(msg);
      showSuccess(msg);
      onRefreshed?.();
    } catch (err) {
      console.error(err);
      setError(CALENDAR_REFRESH_ERROR);
      showError(CALENDAR_REFRESH_ERROR);
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
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[var(--color-app-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-app-accent-fg)] shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}>
          <path d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-4.9M20 15a8 8 0 01-14 4.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{loading ? "Refreshing Calendar..." : "Refresh Calendar"}</span>
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
