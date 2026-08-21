"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";

const CALENDAR_PREVIEW_ERROR = "Could not load upcoming events right now.";
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Turn a Google Calendar start object into a short readable string,
// e.g. "Jul 14, 3:00 PM" or "Jul 14" for all-day events.
function formatEventTime(start) {
  const raw = start?.dateTime ?? start?.date;
  if (!raw) return "";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();

  if (start?.dateTime) {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${month} ${day}, ${displayHour}:${minutes} ${period}`;
  }

  return `${month} ${day}`;
}

export function CalendarPreview({ refreshKey }) {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    apiFetch("/api/calendar", { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        const fetchedEvents = data?.events ?? [];

        const nowMs = Date.now();
        const nextUpcoming = fetchedEvents
          .filter((event) => {
            const raw = event.start?.dateTime ?? event.start?.date;
            if (!raw) return false;
            return new Date(raw).getTime() >= nowMs - 1000 * 60 * 60; // small grace window
          })
          .sort((a, b) => {
            const aTime = new Date(
              a.start?.dateTime ?? a.start?.date,
            ).getTime();
            const bTime = new Date(
              b.start?.dateTime ?? b.start?.date,
            ).getTime();
            return aTime - bTime;
          })
          .slice(0, 5);

        setUpcoming(nextUpcoming);
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === "AbortError") return;
        console.error(err);
        setError(CALENDAR_PREVIEW_ERROR);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  return (
    <section className="home-panel w-full min-w-0 max-w-full overflow-hidden rounded-[28px] p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
            Calendar
          </p>
          <h3 className="mt-1 text-lg font-medium tracking-tight text-[var(--color-app-text)]">
            Upcoming events
          </h3>
        </div>
        <Link
          href="/calendar"
          className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-app-accent)] hover:opacity-80 sm:text-[11px] sm:tracking-[0.16em]"
        >
          View all
        </Link>
      </div>

      <div className="mt-5 space-y-2">
        {loading && (
          <p className="text-sm text-[var(--color-app-text-muted)]">
            Loading events...
          </p>
        )}

        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

        {!loading && !error && upcoming.length === 0 && (
          <p className="text-sm text-[var(--color-app-text-muted)]">
            Nothing upcoming. Connect Calendar and refresh from Integration
            health below.
          </p>
        )}

        {upcoming.map((event) => (
          <div
            key={event.id}
            className="flex min-w-0 max-w-full items-center justify-between gap-3 overflow-hidden rounded-[16px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 transition hover:border-[var(--color-app-border-strong)]"
          >
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-app-text)]">
              {event.summary ?? "(untitled event)"}
            </p>
            <span className="shrink-0 text-xs text-[var(--color-app-text-soft)]">
              {formatEventTime(event.start)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
