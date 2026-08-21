"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "../../components/Avatar";
import {
  formatFullDate,
  formatSender,
  formatSenderEmail,
  toPlainText,
  extractClientEmailContent,
} from "../utils";
import { EmailReplyComposer } from "./EmailReplyComposer";
import { RichEmailViewer } from "./RichEmailViewer";
import { useToast } from "../../../components/ToastProvider";

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
  const router = useRouter();
  const { showSuccess, showInfo } = useToast();

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
  const extracted = useMemo(() => {
    return extractClientEmailContent(detail || listItem);
  }, [detail, listItem]);

  const bodyText = detail?.text || extracted.text || toPlainText(detail?.body ?? "");
  const participantLabel = participantName || participantEmail || (isSent ? "Unknown recipient" : "Unknown sender");

  const copyEmailContent = () => {
    const textToCopy = `From: ${participantLabel}\nSubject: ${subject}\nDate: ${date ? formatFullDate(date) : ""}\n\n${bodyText || listItem?.snippet || ""}`;
    navigator.clipboard.writeText(textToCopy);
    showSuccess("Email copied to clipboard");
  };

  const openInAiChat = () => {
    const prompt = `Inspect this email thread and suggest the best next move:\n\nFrom: ${participantLabel}\nSubject: ${subject}\nSnippet: ${bodyText || listItem?.snippet || ""}`;
    showInfo("Opening in AI Agent Studio...");
    router.push(`/ai-chat?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Reading Pane Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-app-border)] px-5 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
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
          <h1 className="min-w-0 truncate font-[family:var(--font-inter)] text-[15px] font-semibold text-[var(--color-app-text)]">
            {subject}
          </h1>
        </div>

        {/* Action icons */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={copyEmailContent}
            title="Copy email text"
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[var(--color-app-text-muted)] hover:bg-[var(--color-app-surface-soft)] hover:text-[var(--color-app-text)] transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
              <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={openInAiChat}
            title="Ask AI about this thread"
            className="flex items-center gap-1.5 rounded-[10px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-app-text)] hover:border-[var(--color-app-border-strong)] transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <rect x="4" y="8" width="16" height="11" rx="3" />
              <path d="M12 8V5m-3 0h6" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* Email Body & Participant Info */}
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
          ) : (
            <RichEmailViewer
              html={detail?.html || extracted.html}
              text={detail?.text || extracted.text || bodyText}
              snippet={listItem?.snippet}
            />
          )}
        </div>

        {/* Embedded Inline AI Reply Composer */}
        {!loading && !error && (
          <EmailReplyComposer message={detail || listItem} />
        )}
      </div>
    </div>
  );
}
