"use client";

import { useEffect, useState } from "react";
import { Avatar } from "../../components/Avatar";
import {
  formatFullDate,
  formatSender,
  formatSenderEmail,
  toPlainText,
} from "../utils";

export function EmailReadingPane({
  messageId,
  listItem,
  mailbox,
  onClose,
  showCloseButton,
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);

    async function load() {
      try {
        const response = await fetch(`/api/gmail/${messageId}`);
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setError(data.error ?? "Could not load this email.");
          return;
        }
        setDetail(data.message ?? null);
      } catch (caughtError) {
        if (!cancelled) {
          console.error(caughtError);
          setError("Could not load this email.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [messageId]);

  const isSent = mailbox === "sent";
  const from = detail?.from ?? listItem?.from;
  const to = detail?.to ?? listItem?.to;
  const participant = isSent ? to : from;
  const subject = detail?.subject ?? listItem?.subject ?? "(no subject)";
  const date = detail?.internalDate ?? listItem?.internalDate;
  const participantName = formatSender(participant);
  const participantEmail = formatSenderEmail(participant);
  const bodyText = toPlainText(detail?.body ?? "");
  const participantLabel = participantName || participantEmail || (isSent ? "Unknown recipient" : "Unknown sender");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--color-app-border)] px-5 py-4 sm:px-6">
        {showCloseButton ? (
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface-soft)] hover:text-[var(--color-app-text)]"
            aria-label="Back to mailbox"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
        <h1 className="min-w-0 flex-1 truncate font-[family:var(--font-inter)] text-[15px] font-medium text-[var(--color-app-text)]">
          {subject}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <Avatar name={participantName} email={participantEmail} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="truncate text-sm font-semibold text-[var(--color-app-text)]">
                {isSent ? `To: ${participantLabel}` : participantLabel}
              </p>
              {date ? (
                <p className="shrink-0 text-xs text-[var(--color-app-text-soft)]">
                  {formatFullDate(date)}
                </p>
              ) : null}
            </div>
            {participantEmail && participantName ? (
              <p className="truncate text-xs text-[var(--color-app-text-soft)]">
                {participantEmail}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--color-app-border)] pt-5">
          {loading ? (
            <div className="space-y-2.5">
              {["w-full", "w-11/12", "w-4/5", "w-full", "w-2/3"].map((width, index) => (
                <div key={index} className={`h-3 ${width} animate-pulse rounded bg-[var(--color-app-surface-strong)]`} />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          ) : bodyText ? (
            <p className="whitespace-pre-wrap text-[15px] leading-7 text-[var(--color-app-text-muted)]">
              {bodyText}
            </p>
          ) : (
            <p className="text-sm text-[var(--color-app-text-soft)]">
              {listItem?.snippet || "No preview available for this message."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
