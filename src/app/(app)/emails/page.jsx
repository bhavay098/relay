"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const EMAILS_ERROR = "Could not load emails right now.";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

// Splits a raw header string like `"Jane Doe <jane@acme.com>"` into its parts.
// Also handles bare "jane@acme.com" (no angle brackets) and already-clean names.
function parseFromString(raw) {
  if (!raw) return { name: "", email: "" };
  const match = raw.match(/^(.*?)<([^>]+)>\s*$/);
  if (match) {
    // Strip any wrapping quotes Gmail sometimes leaves around the name, e.g. "Jane Doe"
    const name = match[1].trim().replace(/^"(.*)"$/, "$1").trim();
    const email = match[2].trim();
    return { name, email };
  }
  // No angle brackets — treat the whole thing as an email if it looks like one,
  // otherwise as a plain name
  if (raw.includes("@") && !raw.includes(" ")) {
    return { name: "", email: raw.trim() };
  }
  return { name: raw.trim(), email: "" };
}

function formatSender(from) {
  if (!from) return "";
  if (typeof from === "string") return parseFromString(from).name || parseFromString(from).email;
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

function formatSenderEmail(from) {
  if (!from) return "";
  if (typeof from === "string") return parseFromString(from).email;
  if (Array.isArray(from)) return from[0]?.email || "";
  if (typeof from === "object") return from.email || "";
  return "";
}

// Returns just the first letter of the sender's name (or email if no name)
function getInitials(name) {
  if (!name) return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed[0].toUpperCase();
}

// Deterministic color for an avatar so the same sender always gets the same hue
const AVATAR_HUES = [210, 260, 320, 20, 160, 190, 280, 40];
function getAvatarHue(seed) {
  if (!seed) return AVATAR_HUES[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length];
}

function formatMessageDate(internalDate) {
  if (!internalDate) return "";
  const date = new Date(Number(internalDate));
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  const isThisYear = date.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: isThisYear ? undefined : "numeric",
  }).format(date);
}

function formatFullDate(internalDate) {
  if (!internalDate) return "";
  const date = new Date(Number(internalDate));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

// Strips basic HTML tags for a plain-text body preview inside the reading pane
function toPlainText(html) {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

// ─────────────────────────────────────────────
// Small components
// ─────────────────────────────────────────────

function Avatar({ name, email, size = 36 }) {
  const label = name || email;
  const hue = getAvatarHue(email || name || "");
  const initials = getInitials(name || email);

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-[family:var(--font-inter)] font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${hue + 24} 70% 38%))`,
      }}
      aria-hidden="true"
      title={label}
    >
      {initials}
    </div>
  );
}

function EmptyState({ onRefresh, refreshing }) {
  return (
    <div className="home-panel flex flex-col items-center gap-3 rounded-[28px] px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[var(--color-app-text-soft)]">
          <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
        </svg>
      </div>
      <p className="text-sm text-[var(--color-app-text-muted)]">
        No emails are in the local cache yet. That usually means Gmail hasn&apos;t
        been provisioned or refreshed for this account.
      </p>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="mt-1 inline-flex items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {refreshing ? "Refreshing…" : "Load your inbox"}
      </button>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--color-app-border)] px-4 py-3 last:border-b-0 sm:px-5">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[var(--color-app-surface-strong)]" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-1/4 animate-pulse rounded bg-[var(--color-app-surface-strong)]" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-app-surface-strong)]" />
      </div>
      <div className="h-3 w-10 shrink-0 animate-pulse rounded bg-[var(--color-app-surface-strong)]" />
    </div>
  );
}

// No message selected yet — shown in the right-hand reading pane on desktop
function ReadingPaneEmpty() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[var(--color-app-text-soft)]">
          <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
        </svg>
      </div>
      <p className="text-sm text-[var(--color-app-text-soft)]">
        Select a message to read it here.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Reading pane — the actual open-email content.
// Rendered inline on desktop (right column) and inside a slide-over on mobile.
// ─────────────────────────────────────────────

function EmailReadingPane({ messageId, listItem, onClose, showCloseButton }) {
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
        const res = await fetch(`/api/gmail/${messageId}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Could not load this email.");
          return;
        }
        setDetail(data.message ?? null);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
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

  // Fall back to list data (subject/from/date) while the full body loads
  const from = detail?.from ?? listItem?.from;
  const subject = detail?.subject ?? listItem?.subject ?? "(no subject)";
  const date = detail?.internalDate ?? listItem?.internalDate;
  const senderName = formatSender(from);
  const senderEmail = formatSenderEmail(from);
  const bodyText = toPlainText(detail?.body ?? "");

  return (
    <div className="flex h-full flex-col">
      {/* Gmail-style subject bar */}
      <div className="flex items-center gap-3 border-b border-[var(--color-app-border)] px-5 py-4 sm:px-6">
        {showCloseButton ? (
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface-soft)] hover:text-[var(--color-app-text)]"
            aria-label="Back to inbox"
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
          <Avatar name={senderName} email={senderEmail} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="truncate text-sm font-semibold text-[var(--color-app-text)]">
                {senderName || senderEmail || "Unknown sender"}
              </p>
              {date ? (
                <p className="shrink-0 text-xs text-[var(--color-app-text-soft)]">
                  {formatFullDate(date)}
                </p>
              ) : null}
            </div>
            {senderEmail && senderName ? (
              <p className="truncate text-xs text-[var(--color-app-text-soft)]">
                {senderEmail}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--color-app-border)] pt-5">
          {loading ? (
            <div className="space-y-2.5">
              <div className="h-3 w-full animate-pulse rounded bg-[var(--color-app-surface-strong)]" />
              <div className="h-3 w-11/12 animate-pulse rounded bg-[var(--color-app-surface-strong)]" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--color-app-surface-strong)]" />
              <div className="h-3 w-full animate-pulse rounded bg-[var(--color-app-surface-strong)]" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-app-surface-strong)]" />
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

// ─────────────────────────────────────────────
// The message list (shared by both layouts)
// ─────────────────────────────────────────────

function MessageList({ messages, activeId, onSelect }) {
  return (
    <ul className="divide-y divide-[var(--color-app-border)]">
      {messages.map((message) => {
        const senderName = formatSender(message.from);
        const senderEmail = formatSenderEmail(message.from);
        const isActive = message.id === activeId;
        return (
          <li key={message.id}>
            <button
              onClick={() => onSelect(message.id)}
              className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition sm:px-5 sm:py-3.5 ${
                isActive
                  ? "bg-[var(--color-app-accent-soft)]"
                  : "hover:bg-[var(--color-app-surface-soft)]"
              }`}
            >
              <Avatar name={senderName} email={senderEmail} size={36} />

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[13.5px] font-semibold text-[var(--color-app-text)]">
                    {senderName || senderEmail || "Unknown sender"}
                  </p>
                  <span className="shrink-0 text-xs text-[var(--color-app-text-soft)]">
                    {formatMessageDate(message.internalDate)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-[var(--color-app-text-muted)]">
                  <span className="text-[var(--color-app-text)]">
                    {message.subject ?? "(no subject)"}
                  </span>
                  {message.snippet ? (
                    <span className="text-[var(--color-app-text-soft)]"> — {message.snippet}</span>
                  ) : null}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function EmailsPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);

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

  // Close the mobile reading view with Escape
  useEffect(() => {
    if (!activeId) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setActiveId(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId]);

  const filteredMessages = useMemo(() => {
    if (!query.trim()) return messages;
    const q = query.trim().toLowerCase();
    return messages.filter((m) => {
      const sender = formatSender(m.from).toLowerCase();
      const senderEmail = formatSenderEmail(m.from).toLowerCase();
      const subject = (m.subject ?? "").toLowerCase();
      const snippet = (m.snippet ?? "").toLowerCase();
      return (
        sender.includes(q) ||
        senderEmail.includes(q) ||
        subject.includes(q) ||
        snippet.includes(q)
      );
    });
  }, [messages, query]);

  const activeMessage = useMemo(
    () => messages.find((m) => m.id === activeId) ?? null,
    [messages, activeId],
  );

  const hasMessages = !loading && !error && messages.length > 0;

  return (
    <div className="mx-auto max-w-[1320px] space-y-5">
      {/* Header */}
      <section className="home-panel home-panel-strong rounded-[28px] p-5 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
              Inbox
            </p>
            <h2 className="mt-3 text-balance font-[family:var(--font-inter)] text-[clamp(1.5rem,3vw,2.2rem)] font-normal leading-[1.08] tracking-[-0.03em] text-[var(--color-app-text)]">
              Recent messages in one clean stack.
            </h2>
            {!loading && !error ? (
              <p className="mt-2 text-sm text-[var(--color-app-text-soft)]">
                {messages.length} message{messages.length === 1 ? "" : "s"}
                {query.trim() ? ` · ${filteredMessages.length} matching` : ""}
              </p>
            ) : null}
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={refreshing ? "animate-spin" : ""}
              >
                <path d="M4 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 9a8 8 0 0114-4.9M20 15a8 8 0 01-14 4.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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

        {/* Search */}
        {hasMessages ? (
          <div className="mt-5 flex items-center gap-2 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[var(--color-app-text-soft)]">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by sender, subject, or snippet…"
              className="w-full bg-transparent text-sm text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-soft)] focus:outline-none"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 text-xs text-[var(--color-app-text-soft)] transition hover:text-[var(--color-app-text)]"
              >
                Clear
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      {error ? (
        <div className="rounded-[22px] border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.08)] px-4 py-4 text-sm text-[var(--color-error)]">
          {error}
        </div>
      ) : null}

      {/* Loading skeleton */}
      {loading ? (
        <div className="home-panel overflow-hidden rounded-[24px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {/* Empty states */}
      {!loading && !error && messages.length === 0 ? (
        <EmptyState onRefresh={handleRefresh} refreshing={refreshing} />
      ) : null}
      {!loading && !error && messages.length > 0 && filteredMessages.length === 0 ? (
        <div className="home-panel rounded-[24px] px-5 py-10 text-center text-sm text-[var(--color-app-text-muted)]">
          No messages match &ldquo;{query}&rdquo;.
        </div>
      ) : null}

      {/* ── Desktop: Gmail-style two-pane layout ── */}
      {hasMessages && filteredMessages.length > 0 ? (
        <div className="home-panel hidden overflow-hidden rounded-[24px] lg:flex lg:h-[calc(100vh-280px)] lg:min-h-[520px]">
          <div className="w-[380px] shrink-0 overflow-y-auto border-r border-[var(--color-app-border)]">
            <MessageList
              messages={filteredMessages}
              activeId={activeId}
              onSelect={setActiveId}
            />
          </div>
          <div className="min-w-0 flex-1">
            {activeMessage ? (
              <EmailReadingPane
                key={activeMessage.id}
                messageId={activeMessage.id}
                listItem={activeMessage}
                onClose={() => setActiveId(null)}
                showCloseButton={false}
              />
            ) : (
              <ReadingPaneEmpty />
            )}
          </div>
        </div>
      ) : null}

      {/* ── Mobile / tablet: plain list, tapping opens a full slide-over ── */}
      {hasMessages && filteredMessages.length > 0 ? (
        <div className="home-panel overflow-hidden rounded-[24px] lg:hidden">
          <MessageList
            messages={filteredMessages}
            activeId={activeId}
            onSelect={setActiveId}
          />
        </div>
      ) : null}

      {/* Mobile slide-over — only rendered below the lg breakpoint's worth of state,
          reuses the same reading pane component so behavior stays in sync */}
      {activeId ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setActiveId(null)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-[var(--color-app-border)] bg-[var(--color-app-panel-strong)] shadow-2xl">
            <EmailReadingPane
              messageId={activeId}
              listItem={activeMessage}
              onClose={() => setActiveId(null)}
              showCloseButton={true}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}