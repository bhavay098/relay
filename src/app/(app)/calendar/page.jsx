"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const CALENDAR_PAGE_ERROR = "Could not load events right now.";
const HOUR_HEIGHT = 56; // px per hour row in the time grid
const START_HOUR = 0;
const END_HOUR = 24;

// ─────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toLocalInputValue(date) {
  // Formats a Date as "YYYY-MM-DDTHH:mm" for <input type="datetime-local">,
  // using local time (not UTC, which .toISOString() would give us).
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Reads the start/end of a Google Calendar event, which may be a timed
// event (dateTime) or an all-day event (date only).
function getEventRange(event) {
  const startRaw = event.start?.dateTime ?? event.start?.date;
  const endRaw = event.end?.dateTime ?? event.end?.date;
  const isAllDay = Boolean(event.start?.date && !event.start?.dateTime);

  return {
    start: startRaw ? new Date(startRaw) : null,
    end: endRaw ? new Date(endRaw) : null,
    isAllDay,
  };
}

// All date/time formatting below is pinned to a fixed locale ("en-US")
// instead of passing `undefined` (which means "use the runtime's default
// locale"). Node's default locale on the server and the browser's locale
// on the client aren't guaranteed to match, and when they don't, React
// throws a hydration mismatch because the server-rendered text differs
// from what the client re-renders. Pinning the locale makes the output
// identical everywhere, regardless of the visitor's or server's system
// settings.
const CALENDAR_LOCALE = "en-US";

// Builds a simple, unambiguous week range label like "Jul 19 – 25" (same
// month) or "Jul 29 – Aug 4" (spanning two months). Each piece is formatted
// on its own and joined manually — rather than passing `month: undefined`
// to toLocaleDateString to try to "omit" it — since Intl's handling of an
// explicitly-undefined option isn't reliable across environments and
// previously produced garbled output like "Jul 19 – 2026 (day: 25)".
function formatWeekRangeLabel(weekStart) {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();

  const startMonth = weekStart.toLocaleDateString(CALENDAR_LOCALE, {
    month: "short",
  });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString(CALENDAR_LOCALE, {
    month: "short",
  });
  const endDay = weekEnd.getDate();

  if (sameMonth) {
    return `${startMonth} ${startDay} – ${endDay}`;
  }

  if (sameYear) {
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
  }

  // Rare: a week spanning New Year's Eve/Day — include both years for clarity.
  return `${startMonth} ${startDay}, ${weekStart.getFullYear()} – ${endMonth} ${endDay}, ${weekEnd.getFullYear()}`;
}

function formatHourLabel(hour) {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

// Deterministic accent color per event, based on its Google event ID, so
// the same event always renders in the same color across renders.
const EVENT_HUES = [217, 142, 291, 12, 199, 45, 340];
function getEventHue(seed) {
  if (!seed) return EVENT_HUES[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return EVENT_HUES[Math.abs(hash) % EVENT_HUES.length];
}

// Converts Google Calendar's responseStatus values into short readable
// labels for the attendee list.
function rsvpStatusLabel(responseStatus) {
  switch (responseStatus) {
    case "accepted":
      return "Yes";
    case "declined":
      return "No";
    case "tentative":
      return "Maybe";
    case "needsAction":
      return "Not responded";
    default:
      return "";
  }
}

// ─────────────────────────────────────────────
// Event edit / create modal
// ─────────────────────────────────────────────

function EventModal({
  initialEvent,
  initialStart,
  initialEnd,
  onClose,
  onSaved,
  onDeleted,
}) {
  const isEditing = Boolean(initialEvent);

  const [summary, setSummary] = useState(initialEvent?.summary ?? "");
  const [description, setDescription] = useState(
    initialEvent?.description ?? "",
  );
  const [startValue, setStartValue] = useState(
    toLocalInputValue(
      initialEvent
        ? (getEventRange(initialEvent).start ?? initialStart)
        : initialStart,
    ),
  );
  const [endValue, setEndValue] = useState(
    toLocalInputValue(
      initialEvent
        ? (getEventRange(initialEvent).end ?? initialEnd)
        : initialEnd,
    ),
  );
  // Guests are edited as a plain comma-separated string (like typing into
  // Google Calendar's "Add guests" box) and only parsed into the
  // {email}[] shape the API expects right before saving.
  const [guestsInput, setGuestsInput] = useState(
    Array.isArray(initialEvent?.attendees)
      ? initialEvent.attendees
          .map((a) => a.email)
          .filter(Boolean)
          .join(", ")
      : "",
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState("");

  // The signed-in user's own attendee record, if this event has one — used
  // to show their current RSVP status and the accept/decline/maybe buttons.
  // Only trusts the `self` flag Google sets, since that's the exact same
  // check the /respond API route uses server-side to find "your" record —
  // guessing by any other attendee with a responseStatus would risk
  // showing or changing someone else's RSVP.
  const selfAttendee = Array.isArray(initialEvent?.attendees)
    ? initialEvent.attendees.find((a) => a.self === true)
    : null;

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function parseGuestEmails() {
    return guestsInput
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
  }

  async function handleSave() {
    if (!summary.trim()) {
      setError("Give the event a title.");
      return;
    }
    if (new Date(endValue) <= new Date(startValue)) {
      setError("End time must be after the start time.");
      return;
    }

    const guestEmails = parseGuestEmails();
    const invalidEmail = guestEmails.find(
      (email) => !EMAIL_PATTERN.test(email),
    );
    if (invalidEmail) {
      setError(`"${invalidEmail}" doesn't look like a valid email address.`);
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      summary: summary.trim(),
      description: description.trim(),
      start: new Date(startValue).toISOString(),
      end: new Date(endValue).toISOString(),
      attendees: guestEmails,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    try {
      const res = await fetch(
        isEditing ? `/api/calendar/${initialEvent.id}` : "/api/calendar",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save this event.");
      }
      onSaved(data.event);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Could not save this event.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEditing) return;
    if (!window.confirm("Delete this event? This cannot be undone.")) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/calendar/${initialEvent.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not delete this event.");
      }
      onDeleted(initialEvent.id);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Could not delete this event.",
      );
      setDeleting(false);
    }
  }

  async function handleRespond(status) {
    if (!isEditing) return;
    setResponding(true);
    setError("");

    try {
      const res = await fetch(`/api/calendar/${initialEvent.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save your response.");
      }
      onSaved(data.event);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Could not save your response.",
      );
    } finally {
      setResponding(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative flex w-full max-w-md flex-col rounded-[24px] border border-[var(--color-app-border)] bg-[var(--color-app-panel-strong)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-app-border)] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
            {isEditing ? "Edit event" : "New event"}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface-soft)] hover:text-[var(--color-app-text)]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <input
            autoFocus
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Add title"
            className="w-full border-b border-[var(--color-app-border)] bg-transparent pb-2 text-lg font-medium text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-soft)] focus:border-[var(--color-app-accent)] focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--color-app-text-soft)]">
                Starts
              </span>
              <input
                type="datetime-local"
                value={startValue}
                onChange={(e) => setStartValue(e.target.value)}
                className="w-full rounded-[10px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-sm text-[var(--color-app-text)] focus:border-[var(--color-app-accent)] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--color-app-text-soft)]">
                Ends
              </span>
              <input
                type="datetime-local"
                value={endValue}
                onChange={(e) => setEndValue(e.target.value)}
                className="w-full rounded-[10px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-sm text-[var(--color-app-text)] focus:border-[var(--color-app-accent)] focus:outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--color-app-text-soft)]">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add description"
              className="w-full resize-none rounded-[10px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-sm text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-soft)] focus:border-[var(--color-app-accent)] focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[var(--color-app-text-soft)]">
              Guests
            </span>
            <input
              type="text"
              value={guestsInput}
              onChange={(e) => setGuestsInput(e.target.value)}
              placeholder="Add guests by email, separated by commas"
              className="w-full rounded-[10px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-sm text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-soft)] focus:border-[var(--color-app-accent)] focus:outline-none"
            />
          </label>

          {isEditing &&
          Array.isArray(initialEvent.attendees) &&
          initialEvent.attendees.length > 0 ? (
            <div className="rounded-[10px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2.5">
              <p className="mb-1.5 text-xs font-medium text-[var(--color-app-text-soft)]">
                {initialEvent.attendees.length} guest
                {initialEvent.attendees.length === 1 ? "" : "s"}
              </p>
              <ul className="space-y-1">
                {initialEvent.attendees.map((attendee) => (
                  <li
                    key={attendee.email}
                    className="flex items-center justify-between gap-2 text-sm text-[var(--color-app-text)]"
                  >
                    <span className="truncate">{attendee.email}</span>
                    <span className="shrink-0 text-xs text-[var(--color-app-text-soft)]">
                      {rsvpStatusLabel(attendee.responseStatus)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          ) : null}
        </div>

        {isEditing && selfAttendee ? (
          <div className="border-t border-[var(--color-app-border)] px-5 py-3">
            <p className="mb-2 text-xs font-medium text-[var(--color-app-text-soft)]">
              Going?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRespond("accepted")}
                disabled={responding}
                className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                  selfAttendee.responseStatus === "accepted"
                    ? "border-transparent bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)]"
                    : "border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] hover:bg-[var(--color-app-surface)]"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleRespond("tentative")}
                disabled={responding}
                className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                  selfAttendee.responseStatus === "tentative"
                    ? "border-transparent bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)]"
                    : "border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] hover:bg-[var(--color-app-surface)]"
                }`}
              >
                Maybe
              </button>
              <button
                onClick={() => handleRespond("declined")}
                disabled={responding}
                className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                  selfAttendee.responseStatus === "declined"
                    ? "border-transparent bg-[var(--color-error)] text-white"
                    : "border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] hover:bg-[var(--color-app-surface)]"
                }`}
              >
                No
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-[var(--color-app-border)] px-5 py-4">
          {isEditing ? (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              className="text-sm font-medium text-[var(--color-error)] transition hover:opacity-80 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:bg-[var(--color-app-surface)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || deleting}
              className="rounded-full bg-[var(--color-app-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-app-accent-fg)] transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  // Starts as null on purpose: `new Date()` evaluated during the server
  // render and again during client hydration can land on a different
  // instant (or even a different calendar day near midnight, or a
  // different week if the server and the visitor's browser are in
  // different timezones), which causes a React hydration mismatch. Wait
  // until we're definitely running on the client (see the effect below)
  // before computing "this week," then render the loading state briefly
  // instead.
  const [weekStart, setWeekStart] = useState(null);
  const [modalState, setModalState] = useState(null); // { event? , start, end } | null
  const gridScrollRef = useRef(null);
  const hasScrolledToNowRef = useRef(false);

  useEffect(() => {
    setWeekStart(startOfWeek(new Date()));
  }, []);

  async function loadEvents() {
    try {
      const res = await fetch("/api/calendar");
      const data = await res.json();
      if (!res.ok) {
        console.error("Calendar page error response:", data);
        setError(CALENDAR_PAGE_ERROR);
        return;
      }
      setEvents(data.events ?? []);
    } catch (err) {
      console.error(err);
      setError(CALENDAR_PAGE_ERROR);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? CALENDAR_PAGE_ERROR);
        return;
      }
      setEvents(data.events ?? []);
    } catch (err) {
      console.error(err);
      setError(CALENDAR_PAGE_ERROR);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // Scroll the time grid to roughly 7 AM on first load, like Google
  // Calendar does, instead of dumping the user at midnight.
  useEffect(() => {
    if (hasScrolledToNowRef.current || loading) return;
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
      hasScrolledToNowRef.current = true;
    }
  }, [loading]);

  const days = useMemo(
    () =>
      weekStart
        ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
        : [],
    [weekStart],
  );

  // Splits events into all-day vs timed, and further buckets timed events
  // per day-of-week for fast lookup while rendering the grid.
  const { allDayByDay, timedByDay } = useMemo(() => {
    const allDay = Array.from({ length: 7 }, () => []);
    const timed = Array.from({ length: 7 }, () => []);

    for (const event of events) {
      const { start, end, isAllDay } = getEventRange(event);
      if (!start) continue;

      for (let i = 0; i < 7; i++) {
        const day = days[i];
        if (!isSameDay(start, day)) continue;

        if (isAllDay) {
          allDay[i].push(event);
        } else {
          timed[i].push({ event, start, end: end ?? start });
        }
        break;
      }
    }

    return { allDayByDay: allDay, timedByDay: timed };
  }, [events, days]);

  function eventTopAndHeight(start, end) {
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = Math.max(
      startHour + 0.25,
      end.getHours() + end.getMinutes() / 60,
    );
    const top = (startHour - START_HOUR) * HOUR_HEIGHT;
    const height = (endHour - startHour) * HOUR_HEIGHT;
    return { top, height };
  }

  function openCreateModal(day, hour) {
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    setModalState({ event: null, start, end });
  }

  function openEditModal(event) {
    setModalState({ event, start: null, end: null });
  }

  function handleSaved(savedEvent) {
    setEvents((current) => {
      const exists = current.some((e) => e.id === savedEvent.id);
      return exists
        ? current.map((e) => (e.id === savedEvent.id ? savedEvent : e))
        : [...current, savedEvent];
    });
    setModalState(null);
  }

  function handleDeleted(eventId) {
    setEvents((current) => current.filter((e) => e.id !== eventId));
    setModalState(null);
  }

  const today = weekStart ? new Date() : null;
  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i,
  );

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="home-panel home-panel-strong shrink-0 rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-[family:var(--font-inter)] text-lg font-medium text-[var(--color-app-text)] sm:text-xl">
              {weekStart ? formatWeekRangeLabel(weekStart) : ""}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]"
            >
              Today
            </button>

            <div className="flex items-center overflow-hidden rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)]">
              <button
                onClick={() => setWeekStart((d) => addDays(d, -7))}
                aria-label="Previous week"
                className="flex h-9 w-9 items-center justify-center text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M15 6l-6 6 6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="h-5 w-px bg-[var(--color-app-border)]" />
              <button
                onClick={() => setWeekStart((d) => addDays(d, 7))}
                aria-label="Next week"
                className="flex h-9 w-9 items-center justify-center text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M9 6l6 6-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={refreshing ? "animate-spin" : ""}
              >
                <path
                  d="M4 4v5h5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 20v-5h-5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 9a8 8 0 0114-4.9M20 15a8 8 0 01-14 4.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              onClick={() => openCreateModal(new Date(), new Date().getHours())}
              className="rounded-full bg-[var(--color-app-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-app-accent-fg)] transition hover:opacity-90"
            >
              + Create
            </button>

            <Link
              href="/dashboard"
              className="hidden rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] sm:inline-flex"
            >
              Back to brief
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <div className="shrink-0 rounded-[22px] border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.08)] px-4 py-4 text-sm text-[var(--color-error)]">
          {error}
        </div>
      ) : null}

      {/* Calendar grid */}
      <section className="home-panel flex h-[calc(100vh-200px)] min-h-[480px] flex-col overflow-hidden rounded-[28px]">
        {loading || !weekStart ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--color-app-text-muted)]">
            Loading events…
          </div>
        ) : (
          <>
            {/* Day-of-week header row */}
            <div className="flex shrink-0 border-b border-[var(--color-app-border)]">
              <div className="w-14 shrink-0 sm:w-16" />
              {days.map((day, i) => {
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-1 border-l border-[var(--color-app-border)] py-2.5"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-app-text-soft)]">
                      {day.toLocaleDateString(CALENDAR_LOCALE, {
                        weekday: "short",
                      })}
                    </span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                        isToday
                          ? "bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)]"
                          : "text-[var(--color-app-text)]"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* All-day event row — only shown if at least one exists this week */}
            {allDayByDay.some((d) => d.length > 0) ? (
              <div className="flex shrink-0 border-b border-[var(--color-app-border)]">
                <div className="flex w-14 shrink-0 items-start justify-end pr-2 pt-1.5 text-[10px] text-[var(--color-app-text-soft)] sm:w-16">
                  All day
                </div>
                {allDayByDay.map((dayEvents, i) => (
                  <div
                    key={i}
                    className="flex flex-1 flex-col gap-1 border-l border-[var(--color-app-border)] p-1"
                  >
                    {dayEvents.map((event) => {
                      const hue = getEventHue(event.id);
                      return (
                        <button
                          key={event.id}
                          onClick={() => openEditModal(event)}
                          className="truncate rounded-md px-2 py-1 text-left text-xs font-medium text-white transition hover:opacity-90"
                          style={{ background: `hsl(${hue} 65% 45%)` }}
                        >
                          {event.summary ?? "(no title)"}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Scrollable time grid */}
            <div ref={gridScrollRef} className="flex-1 overflow-y-auto">
              <div
                className="flex"
                style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}
              >
                {/* Hour labels column */}
                <div className="w-14 shrink-0 sm:w-16">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      style={{ height: HOUR_HEIGHT }}
                      className="relative"
                    >
                      <span className="absolute -top-2 right-2 text-[10px] text-[var(--color-app-text-soft)]">
                        {hour === START_HOUR ? "" : formatHourLabel(hour)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {days.map((day, dayIndex) => {
                  const isToday = isSameDay(day, today);
                  return (
                    <div
                      key={dayIndex}
                      className="relative flex-1 border-l border-[var(--color-app-border)]"
                    >
                      {/* Hour grid lines — each is also a click target for creating an event */}
                      {hours.map((hour) => (
                        <button
                          key={hour}
                          onClick={() => openCreateModal(day, hour)}
                          style={{ height: HOUR_HEIGHT }}
                          className="block w-full border-b border-[var(--color-app-border)] text-left transition hover:bg-[var(--color-app-surface-soft)]"
                        />
                      ))}

                      {/* Current time indicator */}
                      {isToday ? (
                        <div
                          className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                          style={{
                            top:
                              (today.getHours() +
                                today.getMinutes() / 60 -
                                START_HOUR) *
                              HOUR_HEIGHT,
                          }}
                        >
                          <div
                            className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-error)]"
                            style={{ marginLeft: -4 }}
                          />
                          <div className="h-px flex-1 bg-[var(--color-error)]" />
                        </div>
                      ) : null}

                      {/* Timed events, absolutely positioned by hour */}
                      {timedByDay[dayIndex].map(({ event, start, end }) => {
                        const { top, height } = eventTopAndHeight(start, end);
                        const hue = getEventHue(event.id);
                        return (
                          <button
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(event);
                            }}
                            style={{
                              top,
                              height: Math.max(height, 22),
                              background: `hsl(${hue} 55% 40%)`,
                              borderLeft: `3px solid hsl(${hue} 70% 62%)`,
                            }}
                            className="absolute inset-x-1 z-[5] overflow-hidden rounded-md px-2 py-1 text-left text-xs text-white shadow-sm transition hover:brightness-110"
                          >
                            <p className="truncate font-medium leading-tight">
                              {event.summary ?? "(no title)"}
                            </p>
                            {height > 32 ? (
                              <p className="truncate text-[10px] leading-tight text-white/80">
                                {start.toLocaleTimeString(CALENDAR_LOCALE, {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </section>

      {!loading && !error && events.length === 0 ? (
        <p className="shrink-0 text-center text-sm text-[var(--color-app-text-soft)]">
          No events in cache yet. Connect Google Calendar and refresh from the
          Brief page.
        </p>
      ) : null}

      {modalState ? (
        <EventModal
          initialEvent={modalState.event}
          initialStart={modalState.start}
          initialEnd={modalState.end}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      ) : null}
    </div>
  );
}
