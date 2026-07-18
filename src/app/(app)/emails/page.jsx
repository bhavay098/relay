"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const EMAILS_ERROR = "Could not load emails right now.";

function formatSender(from) {
  if (!from) return "";
  if (typeof from === "string") return from;
  if (Array.isArray(from)) {
    const first = from[0];
    if (!first) return "";
    return first.name || first.email || "";
  }
  if (typeof from === "object") {
    return from.name || from.email || "";
  }
  return "";
}

function formatMessageDate(internalDate) {
  if (!internalDate) return "";

  const date = new Date(Number(internalDate));
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

export default function EmailsPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Reads from the local cache — fast, no Google API call
  async function loadEmails() {
    try {
      const res = await fetch("/api/gmail");
      const data = await res.json();

      if (!res.ok) {
        console.error("Emails page error response:", data);
        setError(EMAILS_ERROR);
        return;
      }

      setMessages(data.messages ?? []);
    } catch (err) {
      console.error(err);
      setError(EMAILS_ERROR);
    } finally {
      setLoading(false);
    }
  }

  // Calls Google to fetch fresh emails, stores them in cache, then shows them
  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/gmail/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? EMAILS_ERROR);
        return;
      }
      setMessages(data.messages ?? []);
    } catch (err) {
      console.error(err);
      setError(EMAILS_ERROR);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadEmails();
  }, []);

  return (
    <div className="mx-auto max-w-[1320px] space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="home-panel home-panel-strong rounded-[32px] p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
              Inbox
            </p>
            <h2 className="mt-4 text-balance font-[family:var(--font-inter)] text-[clamp(1.8rem,3.8vw,3rem)] font-normal leading-[1.04] tracking-[-0.04em] text-[var(--color-app-text)]">
              Recent messages in one clean stack.
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--color-app-text-muted)]">
              Read the latest messages from the same surface you use to draft, summarize, and act.
            </p>
          </div>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            {/* Refresh — fetches from Google and populates the cache */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>

            <Link
              href="/dashboard"
              className="inline-flex flex-1 items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] sm:flex-none"
            >
              Back to brief
            </Link>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="home-panel rounded-[28px] p-5 text-sm text-[var(--color-app-text-muted)]">
          Loading emails...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[22px] border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.08)] px-4 py-4 text-sm text-[var(--color-error)]">
          {error}
        </div>
      ) : null}

      {!loading && !error && messages.length === 0 ? (
        <div className="home-panel rounded-[28px] p-6 text-sm text-[var(--color-app-text-muted)]">
          No emails are in the local cache yet. That usually means Gmail has
          not been provisioned or refreshed for this account.
          <div className="mt-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="underline underline-offset-2 hover:text-[var(--color-app-text)] disabled:opacity-50"
            >
              {refreshing ? "Refreshing…" : "Click here to load your inbox."}
            </button>
          </div>
        </div>
      ) : null}

      <ul className="grid gap-3">
        {messages.map((message) => (
          <li
            key={message.id}
            className="home-panel home-card-hover rounded-[24px] p-4 sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  {formatSender(message.from) || "Inbox"}
                </p>
                <p className="truncate text-[15px] font-medium text-[var(--color-app-text)]">
                  {message.subject ?? "(no subject)"}
                </p>
                <p className="line-clamp-2 text-sm leading-6 text-[var(--color-app-text-muted)]">
                  {message.snippet ?? ""}
                </p>
              </div>
              {formatMessageDate(message.internalDate) ? (
                <span className="shrink-0 text-xs text-[var(--color-app-text-soft)] sm:text-right">
                  {formatMessageDate(message.internalDate)}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
