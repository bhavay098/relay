"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Turn a Google Calendar start object into a readable string.
function formatEventTime(start) {
  const raw = start?.dateTime ?? start?.date;
  if (!raw) return "";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  if (start?.dateTime) {
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/calendar");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to load events");
          return;
        }

        setEvents(data.events ?? []);
      } catch (err) {
        setError("Failed to load events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <div className="mx-auto max-w-[1320px] space-y-6">
      <section className="home-panel home-panel-strong rounded-[32px] p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
              Calendar
            </p>
            <h2 className="mt-4 text-balance font-[family:var(--font-inter)] text-[clamp(1.8rem,3.8vw,3rem)] font-normal leading-[1.04] tracking-[-0.04em] text-[var(--color-app-text)]">
              Upcoming events in a focused schedule view.
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--color-app-text-muted)]">
              Review events, timings, and reschedules without leaving the same control surface.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]"
          >
            Back to brief
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="home-panel rounded-[28px] p-5 text-sm text-[var(--color-app-text-muted)]">
          Loading events...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[22px] border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.08)] px-4 py-4 text-sm text-[var(--color-error)]">
          {error}
        </div>
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <div className="home-panel rounded-[28px] p-6 text-sm text-[var(--color-app-text-muted)]">
          No events in cache. Connect Google Calendar and refresh from the Brief page.
        </div>
      ) : null}

      <ul className="grid gap-3">
        {events.map((event) => (
          <li
            key={event.id}
            className="home-panel home-card-hover rounded-[24px] p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  Event
                </p>
                <p className="mt-2 truncate text-[15px] font-medium text-[var(--color-app-text)]">
                  {event.summary ?? "(no title)"}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 text-xs text-[var(--color-app-text-muted)]">
                {formatEventTime(event.start)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
