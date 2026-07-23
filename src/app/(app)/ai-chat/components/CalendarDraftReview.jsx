"use client";

import {
  toDateTimeLocalValue,
  toIsoDateTime,
  attendeesToInputValue,
  attendeesFromInputValue,
} from "../utils";

export function CalendarDraftReview({ draft, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...draft, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="calendar-draft-title"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
        >
          Title
        </label>
        <input
          id="calendar-draft-title"
          value={draft.summary ?? ""}
          onChange={(event) => updateField("summary", event.target.value)}
          className="mt-2 w-full rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none focus:border-[var(--color-app-accent)]"
        />
      </div>
      <div>
        <label
          htmlFor="calendar-draft-description"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
        >
          Description
        </label>
        <textarea
          id="calendar-draft-description"
          value={draft.description ?? ""}
          onChange={(event) => updateField("description", event.target.value)}
          rows={4}
          className="mt-2 min-h-28 w-full resize-y rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm leading-6 text-[var(--color-app-text)] outline-none focus:border-[var(--color-app-accent)]"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="calendar-draft-start"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
          >
            Start
          </label>
          <input
            id="calendar-draft-start"
            type="datetime-local"
            value={toDateTimeLocalValue(draft.start)}
            onChange={(event) =>
              updateField("start", toIsoDateTime(event.target.value))
            }
            className="mt-2 w-full rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none focus:border-[var(--color-app-accent)]"
          />
        </div>
        <div>
          <label
            htmlFor="calendar-draft-end"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
          >
            End
          </label>
          <input
            id="calendar-draft-end"
            type="datetime-local"
            value={toDateTimeLocalValue(draft.end)}
            onChange={(event) =>
              updateField("end", toIsoDateTime(event.target.value))
            }
            className="mt-2 w-full rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none focus:border-[var(--color-app-accent)]"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="calendar-draft-attendees"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
        >
          Attendees
        </label>
        <input
          id="calendar-draft-attendees"
          value={attendeesToInputValue(draft.attendees)}
          onChange={(event) =>
            updateField(
              "attendees",
              attendeesFromInputValue(event.target.value),
            )
          }
          placeholder="name@example.com, teammate@example.com"
          className="mt-2 w-full rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none placeholder:text-[var(--color-app-text-soft)] focus:border-[var(--color-app-accent)]"
        />
      </div>
    </div>
  );
}
