"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const INBOX_PREVIEW_ERROR = "Could not load inbox messages right now.";

export function InboxPreview({ refreshKey }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEmails() {
      setLoading(true);
      try {
        const res = await fetch("/api/gmail");
        const data = await res.json();

        if (!res.ok) {
          console.error("Inbox preview error response:", data);
          setError(INBOX_PREVIEW_ERROR);
          return;
        }

        setMessages(data.messages ?? []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(INBOX_PREVIEW_ERROR);
      } finally {
        setLoading(false);
      }
    }

    loadEmails();
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
            Loading emails...
          </p>
        )}

        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

        {!loading && !error && preview.length === 0 && (
          <p className="text-sm text-[var(--color-app-text-muted)]">
            No emails are in the local cache yet. Gmail may not have been
            provisioned or refreshed for this account.
            <span className="block mt-2">
              Connect Gmail, then refresh from Integration health below.
            </span>
          </p>
        )}

        {preview.map((message) => (
          <div
            key={message.id}
            className="w-full min-w-0 max-w-full overflow-hidden rounded-[16px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 transition hover:border-[var(--color-app-border-strong)]"
          >
            <p className="truncate text-sm font-medium text-[var(--color-app-text)]">
              {message.subject ?? "(no subject)"}
            </p>
            <p className="mt-1 truncate text-xs text-[var(--color-app-text-soft)]">
              {message.snippet ?? ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
