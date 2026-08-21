const RSVP_OPTIONS = [
  ["accepted", "Yes"],
  ["tentative", "Maybe"],
  ["declined", "No"],
];

export function EventRsvpSection({ selfAttendee, responding, onRespond }) {
  if (!selfAttendee) return null;

  return (
    <div className="border-t border-[var(--color-app-border)] px-5 py-3">
      <p className="mb-2 text-xs font-medium text-[var(--color-app-text-soft)]">
        Going?
      </p>
      <div className="flex items-center gap-2">
        {RSVP_OPTIONS.map(([status, label]) => {
          const isSelected = selfAttendee.responseStatus === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => onRespond(status)}
              disabled={responding}
              className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                isSelected
                  ? status === "declined"
                    ? "border-transparent bg-[var(--color-error)] text-white"
                    : "border-transparent bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)]"
                  : "border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] hover:bg-[var(--color-app-surface)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
