"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Turn a Google Calendar start object into a short readable string,
// e.g. "Jul 14, 3:00 PM" or "Jul 14" for all-day events.
function formatEventTime(start) {
  const raw = start?.dateTime ?? start?.date;
  if (!raw) return "";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  if (start?.dateTime) {
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function CalendarPreview({ refreshKey }) {
  // "upcoming" is computed inside the effect below (not during render)
  // so the impure Date.now() call never runs while React is rendering
  // the component - it only runs in response to data loading, which is
  // the correct place for "current time" logic.
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const res = await fetch("/api/calendar");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to load events");
          return;
        }

        const fetchedEvents = data.events ?? [];

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
      } catch (err) {
        setError("Failed to load events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [refreshKey]);

  return (
    <section className="home-panel rounded-[28px] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
            Calendar
          </p>
          <h3 className="mt-1 text-lg font-medium tracking-tight text-[var(--color-app-text)]">
            Upcoming events
          </h3>
        </div>
        <Link
          href="/calendar"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-app-accent)] hover:opacity-80"
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
            className="flex items-center justify-between gap-3 rounded-[16px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 transition hover:border-[var(--color-app-border-strong)]"
          >
            <p className="truncate text-sm font-medium text-[var(--color-app-text)]">
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
