"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";

const INBOX_PREVIEW_ERROR = "Could not load inbox messages right now.";
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatPreviewDate(rawDate) {
  if (!rawDate) return "";
  const num = Number(rawDate);
  const date = Number.isFinite(num) ? new Date(num) : new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "";
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

export function InboxPreview({ refreshKey }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    apiFetch("/api/gmail", { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setMessages(data?.messages ?? []);
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === "AbortError") return;
        console.error(err);
        setError(INBOX_PREVIEW_ERROR);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  const preview = messages.slice(0, 5);

  return (
    <section className="home-panel w-full min-w-0 max-w-full overflow-hidden rounded-[28px] p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
            Inbox
          </p>
          <h3 className="mt-1 text-lg font-medium tracking-tight text-[var(--color-app-text)]">
            Recent messages
          </h3>
        </div>
        <Link
          href="/emails"
          className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-app-accent)] hover:opacity-80 sm:text-[11px] sm:tracking-[0.16em]"
        >
          View all
        </Link>
      </div>

      <div className="mt-5 space-y-2">
        {loading && (
          <p className="text-sm text-[var(--color-app-text-muted)]">
            Loading messages...
          </p>
        )}

        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

        {!loading && !error && preview.length === 0 && (
          <p className="text-sm text-[var(--color-app-text-muted)]">
            No emails loaded yet. Connect Gmail and refresh from Integration
            health below.
          </p>
        )}

        {preview.map((message) => (
          <Link
            key={message.id}
            href={`/emails?id=${message.id}`}
            className="flex min-w-0 max-w-full items-center justify-between gap-3 overflow-hidden rounded-[16px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 transition hover:border-[var(--color-app-border-strong)]"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-app-text)]">
                {message.from || "Unknown sender"}
              </p>
              <p className="truncate text-xs text-[var(--color-app-text-muted)]">
                {message.subject || "(no subject)"}
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-[var(--color-app-text-soft)]">
              {formatPreviewDate(message.date)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
