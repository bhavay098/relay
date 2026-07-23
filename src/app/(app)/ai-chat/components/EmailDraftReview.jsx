"use client";

export function EmailDraftReview({ draft, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="email-draft-to"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
        >
          To
        </label>
        <input
          id="email-draft-to"
          value={draft.to}
          onChange={(event) => onChange({ ...draft, to: event.target.value })}
          className="mt-2 w-full rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none focus:border-[var(--color-app-accent)]"
        />
      </div>
      <div>
        <label
          htmlFor="email-draft-subject"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
        >
          Subject
        </label>
        <input
          id="email-draft-subject"
          value={draft.subject}
          onChange={(event) =>
            onChange({ ...draft, subject: event.target.value })
          }
          className="mt-2 w-full rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none focus:border-[var(--color-app-accent)]"
        />
      </div>
      <div>
        <label
          htmlFor="email-draft-body"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
        >
          Message
        </label>
        <textarea
          id="email-draft-body"
          value={draft.body}
          onChange={(event) => onChange({ ...draft, body: event.target.value })}
          rows={7}
          className="mt-2 min-h-36 w-full resize-y rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm leading-6 text-[var(--color-app-text)] outline-none focus:border-[var(--color-app-accent)]"
        />
      </div>
    </div>
  );
}
