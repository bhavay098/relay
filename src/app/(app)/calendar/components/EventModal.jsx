"use client";

import { useEffect, useState } from "react";
import { getEventRange, toLocalInputValue } from "../utils";
import { EventModalHeader } from "./EventModalHeader";
import { EventAttendeesList } from "./EventAttendeesList";
import { EventRsvpSection } from "./EventRsvpSection";

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
  const [startValue, setStartValue] = useState(() =>
    toLocalInputValue(initialRange?.start ?? initialStart),
  );
  const [endValue, setEndValue] = useState(() =>
    toLocalInputValue(initialRange?.end ?? initialEnd),
  );
  const [guestsInput, setGuestsInput] = useState(() =>
    Array.isArray(initialEvent?.attendees)
      ? initialEvent.attendees
          .flatMap((attendee) => (attendee.email ? [attendee.email] : []))
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
    if (saving || deleting || responding) return;
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
    if (deleting || saving || responding) return;
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
    } finally {
      setDeleting(false);
    }
  }

  async function handleRespond(status) {
    if (responding || saving || deleting) return;
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
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-y-auto rounded-[24px] border border-[var(--color-app-border)] bg-[var(--color-app-panel-strong)] shadow-2xl">
        <EventModalHeader isEditing={isEditing} onClose={onClose} />
        <div className="space-y-4 px-5 py-5">
          <label htmlFor="event-title-input" className="sr-only">
            Event title
          </label>
          <input
            id="event-title-input"
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
          {isEditing ? (
            <EventAttendeesList attendees={initialEvent.attendees} />
          ) : null}
          {error ? (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          ) : null}
        </div>
        {isEditing ? (
          <EventRsvpSection
            selfAttendee={selfAttendee}
            responding={responding || saving || deleting}
            onRespond={handleRespond}
          />
        ) : null}
        <div className="flex items-center justify-between border-t border-[var(--color-app-border)] px-5 py-4">
          {isEditing ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving || responding}
              className="text-sm font-medium text-[var(--color-error)] transition hover:opacity-80 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:bg-[var(--color-app-surface)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || deleting || responding}
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
