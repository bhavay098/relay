"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
          setError(data.error ?? "Failed to load emails");
          return;
        }

        setMessages(data.messages ?? []);
        setError(null);
      } catch (err) {
        setError("Failed to load emails");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEmails();
  }, [refreshKey]);

  const preview = messages.slice(0, 5);

  return (
    <section className="home-panel rounded-[28px] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
            Inbox
          </p>
          <h3 className="mt-1 text-lg font-medium tracking-tight text-[var(--color-app-text)]">
            Recent messages
          </h3>
        </div>
        <Link
          href="/emails"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-app-accent)] hover:opacity-80"
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
            No emails in cache. Connect Gmail and refresh from Integration
            health below.
          </p>
        )}

        {preview.map((message) => (
          <div
            key={message.id}
            className="rounded-[16px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 transition hover:border-[var(--color-app-border-strong)]"
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
