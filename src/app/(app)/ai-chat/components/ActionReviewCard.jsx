"use client";

import { actionTitle, confirmButtonLabel } from "../utils";
import { EmailDraftReview } from "./EmailDraftReview";
import { CalendarDraftReview } from "./CalendarDraftReview";
import { CalendarActionReview } from "./CalendarActionReview";

export function ActionReviewCard({
  pendingAction,
  actionError,
  actionSending,
  onConfirm,
  onDiscard,
  onChangePendingAction,
}) {
  return (
    <section
      aria-labelledby="review-action-title"
      className="rounded-[26px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-chip)] p-4 sm:p-5"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
        Approval required
      </p>
      <h3
        id="review-action-title"
        className="mt-2 text-lg font-medium text-[var(--color-app-text)]"
      >
        {actionTitle(pendingAction)}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-app-text-muted)]">
        Review the details below. Nothing happens until you confirm.
      </p>
      <div className="mt-5">
        {pendingAction.kind === "email" ? (
          <EmailDraftReview
            draft={pendingAction}
            onChange={onChangePendingAction}
          />
        ) : pendingAction.kind === "calendar_delete" ? (
          <CalendarActionReview action={pendingAction} />
        ) : (
          <CalendarDraftReview
            draft={pendingAction}
            onChange={onChangePendingAction}
          />
        )}
      </div>
      {actionError ? (
        <p className="mt-4 text-sm text-[var(--color-error)]">{actionError}</p>
      ) : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onConfirm}
          disabled={actionSending}
          className="w-full rounded-[16px] bg-[var(--color-app-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-app-accent-fg)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {actionSending ? "Working..." : confirmButtonLabel(pendingAction)}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={actionSending}
          className="w-full rounded-[16px] border border-[var(--color-app-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-app-text-muted)] transition hover:border-[var(--color-app-border-strong)] hover:text-[var(--color-app-text)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Discard
        </button>
      </div>
    </section>
  );
}
