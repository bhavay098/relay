import { rsvpStatusLabel } from "../utils";

export function EventAttendeesList({ attendees }) {
  if (!Array.isArray(attendees) || attendees.length === 0) return null;

  return (
    <div className="rounded-[10px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2.5">
      <p className="mb-1.5 text-xs font-medium text-[var(--color-app-text-soft)]">
        {attendees.length} guest{attendees.length === 1 ? "" : "s"}
      </p>
      <ul className="space-y-1">
        {attendees.map((attendee) => (
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
  );
}
