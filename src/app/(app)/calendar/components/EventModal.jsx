"use client";

import { useEffect, useState } from "react";
import { getEventRange, rsvpStatusLabel, toLocalInputValue } from "../utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EventModal({
  initialEvent,
  initialStart,
  initialEnd,
  onClose,
  onSaved,
  onDeleted,
}) {
  const isEditing = Boolean(initialEvent);
  const initialRange = initialEvent ? getEventRange(initialEvent) : null;
  const [summary, setSummary] = useState(initialEvent?.summary ?? "");
  const [description, setDescription] = useState(
    initialEvent?.description ?? "",
  );
  const [startValue, setStartValue] = useState(
    toLocalInputValue(initialRange?.start ?? initialStart),
  );
  const [endValue, setEndValue] = useState(
    toLocalInputValue(initialRange?.end ?? initialEnd),
  );
  const [guestsInput, setGuestsInput] = useState(
    Array.isArray(initialEvent?.attendees)
      ? initialEvent.attendees
          .map((attendee) => attendee.email)
          .filter(Boolean)
          .join(", ")
      : "",
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState("");
  const selfAttendee = Array.isArray(initialEvent?.attendees)
    ? initialEvent.attendees.find((attendee) => attendee.self === true)
    : null;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSave() {
    if (!summary.trim()) return setError("Give the event a title.");
    if (new Date(endValue) <= new Date(startValue))
      return setError("End time must be after the start time.");
    const attendees = guestsInput
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    const invalidEmail = attendees.find((email) => !EMAIL_PATTERN.test(email));
    if (invalidEmail)
      return setError(
        `"${invalidEmail}" doesn't look like a valid email address.`,
      );
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        isEditing ? `/api/calendar/${initialEvent.id}` : "/api/calendar",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: summary.trim(),
            description: description.trim(),
            start: new Date(startValue).toISOString(),
            end: new Date(endValue).toISOString(),
            attendees,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Could not save this event.");
      onSaved(data.event);
    } catch (caughtError) {
      console.error(caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save this event.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !isEditing ||
      !window.confirm("Delete this event? This cannot be undone.")
    )
      return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/calendar/${initialEvent.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Could not delete this event.");
      onDeleted(initialEvent.id);
    } catch (caughtError) {
      console.error(caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete this event.",
      );
      setDeleting(false);
    }
  }

  async function handleRespond(status) {
    setResponding(true);
    setError("");
    try {
      const response = await fetch(`/api/calendar/${initialEvent.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Could not save your response.");
      onSaved(data.event);
    } catch (caughtError) {
      console.error(caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save your response.",
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
      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-y-auto rounded-[24px] border border-[var(--color-app-border)] bg-[var(--color-app-panel-strong)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-app-border)] bg-[var(--color-app-panel-strong)] px-5 py-4">
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
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Add title"
            className="w-full border-b border-[var(--color-app-border)] bg-transparent pb-2 text-lg font-medium text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-soft)] focus:border-[var(--color-app-accent)] focus:outline-none"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--color-app-text-soft)]">
                Starts
              </span>
              <input
                type="datetime-local"
                value={startValue}
                onChange={(event) => setStartValue(event.target.value)}
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
                onChange={(event) => setEndValue(event.target.value)}
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
              onChange={(event) => setDescription(event.target.value)}
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
              onChange={(event) => setGuestsInput(event.target.value)}
              placeholder="Add guests by email, separated by commas"
              className="w-full rounded-[10px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-sm text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-soft)] focus:border-[var(--color-app-accent)] focus:outline-none"
            />
          </label>
          {isEditing && initialEvent.attendees?.length ? (
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
              {[
                ["accepted", "Yes"],
                ["tentative", "Maybe"],
                ["declined", "No"],
              ].map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => handleRespond(status)}
                  disabled={responding}
                  className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${selfAttendee.responseStatus === status ? (status === "declined" ? "border-transparent bg-[var(--color-error)] text-white" : "border-transparent bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)]") : "border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] hover:bg-[var(--color-app-surface)]"}`}
                >
                  {label}
                </button>
              ))}
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
