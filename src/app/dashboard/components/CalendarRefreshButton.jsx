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
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Refreshing Calendar..." : "Refresh Calendar"}
      </button>

      <div className="text-sm min-h-5">
        {status && <p className="text-green-600">{status}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
}
