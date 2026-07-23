"use client";

export function CalendarActionReview({ action }) {
  if (action.kind === "calendar_delete") {
    return (
      <p className="break-words text-sm leading-6 text-[var(--color-app-text-muted)]">
        Delete {action.summary ? `"${action.summary}"` : "the selected event"}?
        This cannot be undone from Relay.
      </p>
    );
  }

  const fields = [
    ["Title", action.summary],
    ["Start", action.start],
    ["End", action.end],
    ["Attendees", action.attendees?.join(", ")],
  ].filter(([, value]) => value);

  return (
    <dl className="space-y-2 text-sm">
      {fields.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
          <dt className="shrink-0 text-[var(--color-app-text-soft)] sm:w-20">
            {label}
          </dt>
          <dd className="min-w-0 break-words text-[var(--color-app-text)]">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
