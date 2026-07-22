"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { ThemeToggle } from "../../components/ThemeToggle";

function parseSseChunk(buffer, onEvent) {
  const parts = buffer.split("\n\n");
  const remainder = parts.pop() ?? "";

  for (const part of parts) {
    const line = part
      .split("\n")
      .find((candidate) => candidate.startsWith("data: "));

    if (!line) {
      continue;
    }

    try {
      onEvent(JSON.parse(line.slice(6)));
    } catch {
      // Ignore malformed chunks and keep streaming.
    }
  }

  return remainder;
}

const CHAT_REQUEST_ERROR = "Could not start the chat right now.";
const CHAT_STREAM_ERROR = "I hit an error while responding. Please try again.";
const INITIAL_MESSAGES = [];

function actionTitle(action) {
  if (action.kind === "email") return "Review email draft";
  if (action.kind === "calendar_create") return "Review new calendar event";
  if (action.kind === "calendar_update") return "Review calendar update";
  return "Confirm calendar deletion";
}

function actionSuccessMessage(action) {
  if (action.kind === "email") return "Email sent.";
  if (action.kind === "calendar_create") return "Calendar event created.";
  if (action.kind === "calendar_update") return "Calendar event updated.";
  return "Calendar event deleted.";
}

function confirmButtonLabel(action) {
  if (action.kind === "email") return "Send email";
  if (action.kind === "calendar_create") return "Create event";
  if (action.kind === "calendar_delete") return "Delete event";
  return "Save changes";
}

function toDateTimeLocalValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const pad = (number) => String(number).padStart(2, "0");
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())]
    .join("-")
    .concat(`T${pad(date.getHours())}:${pad(date.getMinutes())}`);
}

function toIsoDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString();
}

function attendeesToInputValue(attendees) {
  if (!Array.isArray(attendees)) return "";
  return attendees.join(", ");
}

function attendeesFromInputValue(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function EmailDraftReview({ draft, onChange }) {
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

function CalendarDraftReview({ draft, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...draft, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="calendar-draft-title"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
        >
          Title
        </label>
        <input
          id="calendar-draft-title"
          value={draft.summary ?? ""}
          onChange={(event) => updateField("summary", event.target.value)}
          className="mt-2 w-full rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none focus:border-[var(--color-app-accent)]"
        />
      </div>
      <div>
        <label
          htmlFor="calendar-draft-description"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
        >
          Description
        </label>
        <textarea
          id="calendar-draft-description"
          value={draft.description ?? ""}
          onChange={(event) => updateField("description", event.target.value)}
          rows={4}
          className="mt-2 min-h-28 w-full resize-y rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm leading-6 text-[var(--color-app-text)] outline-none focus:border-[var(--color-app-accent)]"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="calendar-draft-start"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
          >
            Start
          </label>
          <input
            id="calendar-draft-start"
            type="datetime-local"
            value={toDateTimeLocalValue(draft.start)}
            onChange={(event) =>
              updateField("start", toIsoDateTime(event.target.value))
            }
            className="mt-2 w-full rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none focus:border-[var(--color-app-accent)]"
          />
        </div>
        <div>
          <label
            htmlFor="calendar-draft-end"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
          >
            End
          </label>
          <input
            id="calendar-draft-end"
            type="datetime-local"
            value={toDateTimeLocalValue(draft.end)}
            onChange={(event) =>
              updateField("end", toIsoDateTime(event.target.value))
            }
            className="mt-2 w-full rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none focus:border-[var(--color-app-accent)]"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="calendar-draft-attendees"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]"
        >
          Attendees
        </label>
        <input
          id="calendar-draft-attendees"
          value={attendeesToInputValue(draft.attendees)}
          onChange={(event) =>
            updateField(
              "attendees",
              attendeesFromInputValue(event.target.value),
            )
          }
          placeholder="name@example.com, teammate@example.com"
          className="mt-2 w-full rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none placeholder:text-[var(--color-app-text-soft)] focus:border-[var(--color-app-accent)]"
        />
      </div>
    </div>
  );
}

function CalendarActionReview({ action }) {
  if (action.kind === "calendar_delete") {
    return (
      <p className="break-words text-sm leading-6 text-[var(--color-app-text-muted)]">
        Delete {action.summary ? `“${action.summary}”` : "the selected event"}?
        This cannot be undone from Relay.
      </p>
    );
  }

  const fields = [
    ["Title", action.summary],
    ["Start", action.start],
    ["End", action.end],
    ["Attendees", action.attendees?.join(", ")],
  ].filter(([, value]) => value);

  return (
    <dl className="space-y-2 text-sm">
      {fields.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
          <dt className="shrink-0 text-[var(--color-app-text-soft)] sm:w-20">
            {label}
          </dt>
          <dd className="min-w-0 break-words text-[var(--color-app-text)]">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function AssistantMessageContent({ content, loading }) {
  if (!content) {
    return loading ? "…" : " ";
  }

  return (
    <div className="ai-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a({ children, ...props }) {
            return (
              <a
                {...props}
                target="_blank"
                rel="noreferrer noopener"
                className="ai-markdown-link"
              >
                {children}
              </a>
            );
          },
          blockquote({ children, ...props }) {
            return (
              <blockquote {...props} className="ai-markdown-quote">
                {children}
              </blockquote>
            );
          },
          code({ className, children, ...props }) {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code {...props} className={className}>
                  {children}
                </code>
              );
            }

            return (
              <code {...props} className="ai-markdown-inline-code">
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <pre className="ai-markdown-pre">{children}</pre>;
          },
          table({ children, ...props }) {
            return (
              <div className="ai-markdown-table-wrap">
                <table {...props} className="ai-markdown-table">
                  {children}
                </table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function AiChatPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [actionSending, setActionSending] = useState(false);
  const scrollRef = useRef(null);
  const conversationScrollRef = useRef(null);
  const wasReviewVisibleRef = useRef(false);
  const searchParams = useSearchParams();
  const autoSentRef = useRef(false);

  // Chat history / conversation management state
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // The server already returns conversations sorted newest-first, but we
  // re-sort here too so the sidebar can never show a stale order — e.g. if
  // an optimistic update (starting a new chat) and a background refetch
  // land in a different order than they were kicked off. Always deriving
  // the displayed order from updatedAt means there's nowhere for a race to
  // hide.
  const sortedConversations = useMemo(() => {
    return [...conversations].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  }, [conversations]);

  // Loads the sidebar list. Reusable so it can be called again after
  // creating, renaming, or deleting a conversation to stay in sync.
  async function loadConversations() {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations ?? []);
      }
    } catch (err) {
      console.error("Load conversations error:", err);
    } finally {
      setConversationsLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, []);

  // Loads one conversation's messages into the chat window. Used both when
  // clicking a conversation in the sidebar and when starting fresh.
  async function openConversation(conversationId) {
    setActiveConversationId(conversationId);
    setPendingAction(null);
    setActionError("");
    setActionStatus("");
    setError("");

    if (!conversationId) {
      setMessages(INITIAL_MESSAGES);
      return;
    }

    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      const data = await res.json();
      if (!res.ok) {
        console.error("Load conversation error:", data);
        setError("Could not load that conversation.");
        return;
      }
      setMessages(
        (data.messages ?? []).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      );
    } catch (err) {
      console.error(err);
      setError("Could not load that conversation.");
    }
  }

  // Creates a new conversation on the server and switches to it. Called
  // both by the explicit "New chat" button and lazily the first time the
  // user sends a message with no conversation selected yet.
  async function startNewConversation() {
    const res = await fetch("/api/conversations", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Could not start a new conversation.");
    }
    setConversations((current) => [data.conversation, ...current]);
    setActiveConversationId(data.conversation.id);
    setMessages(INITIAL_MESSAGES);
    return data.conversation.id;
  }

  async function handleDeleteConversation(conversationId, event) {
    event.stopPropagation();
    if (!window.confirm("Delete this conversation? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not delete this conversation.");
      }
      setConversations((current) =>
        current.filter((c) => c.id !== conversationId),
      );
      if (activeConversationId === conversationId) {
        openConversation(null);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete this conversation.",
      );
    }
  }

  function startRenaming(conversation, event) {
    event.stopPropagation();
    setRenamingId(conversation.id);
    setRenameValue(conversation.title ?? "");
  }

  async function submitRename(conversationId) {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;

    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not rename this conversation.");
      }
      setConversations((current) =>
        current.map((c) => (c.id === conversationId ? data.conversation : c)),
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not rename this conversation.",
      );
    }
  }

  useEffect(() => {
    document.body.classList.add("ai-chat-immersive");
    return () => {
      document.body.classList.remove("ai-chat-immersive");
    };
  }, []);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, loading, pendingAction]);

  // The review card sits below the message list. Reveal it when an action is
  // first ready, but do not force the scroll position again while the user is
  // editing its fields.
  useEffect(() => {
    const shouldRevealReview = pendingAction && !wasReviewVisibleRef.current;
    const node = conversationScrollRef.current;

    if (shouldRevealReview && node) {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      node.scrollTo({
        top: node.scrollHeight,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }

    wasReviewVisibleRef.current = Boolean(pendingAction);
  }, [pendingAction]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    // Lazily start a conversation on the first message, same as ChatGPT
    // does — there's no empty "Untitled" conversation sitting in the
    // sidebar until the user actually says something.
    let conversationId = activeConversationId;
    if (!conversationId) {
      try {
        conversationId = await startNewConversation();
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not start a new conversation.",
        );
        return;
      }
    }

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setActionStatus("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
          conversationId,
        }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        console.error("AI chat error response:", data);
        throw new Error(CHAT_REQUEST_ERROR);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseChunk(buffer, (event) => {
          if (event.type === "text") {
            setMessages((current) => {
              const copy = [...current];
              const lastIndex = copy.length - 1;
              if (lastIndex >= 0) {
                copy[lastIndex] = {
                  ...copy[lastIndex],
                  content: `${copy[lastIndex].content}${event.content}`,
                };
              }
              return copy;
            });
          }

          if (event.type === "error") {
            setError(CHAT_STREAM_ERROR);
            setMessages((current) => {
              const copy = [...current];
              const lastIndex = copy.length - 1;
              if (lastIndex >= 0) {
                copy[lastIndex] = {
                  ...copy[lastIndex],
                  content: "I hit an error while responding.",
                };
              }
              return copy;
            });
          }

          if (event.type === "action_draft") {
            setPendingAction(event.action);
            setActionError("");
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : CHAT_REQUEST_ERROR);
    } finally {
      setLoading(false);
      // Picks up the auto-generated title (set from the first message) and
      // the conversation's new position at the top of the list.
      loadConversations();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await sendMessage(input);
  }

  async function confirmPendingAction() {
    if (!pendingAction || actionSending) return;

    setActionSending(true);
    setActionError("");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      let response;
      if (pendingAction.kind === "email") {
        response = await fetch("/api/gmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: pendingAction.to,
            subject: pendingAction.subject,
            body: pendingAction.body,
          }),
        });
      } else if (pendingAction.kind === "calendar_create") {
        response = await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...pendingAction, timeZone }),
        });
      } else if (pendingAction.kind === "calendar_update") {
        const { eventId, kind, ...changes } = pendingAction;
        response = await fetch(`/api/calendar/${eventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...changes, timeZone }),
        });
      } else {
        response = await fetch(`/api/calendar/${pendingAction.eventId}`, {
          method: "DELETE",
        });
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Could not complete this action.");
      }

      const status = actionSuccessMessage(pendingAction);
      setActionStatus(status);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: status },
      ]);
      setPendingAction(null);
    } catch (err) {
      console.error(err);
      setActionError(
        err instanceof Error ? err.message : "Could not complete this action.",
      );
    } finally {
      setActionSending(false);
    }
  }

  // If we arrived here from the dashboard's "Ask your agent" card
  // (e.g. /ai-chat?prompt=Summarize+my+unread+emails), auto-send it once.
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !autoSentRef.current) {
      autoSentRef.current = true;
      sendMessage(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const starterPrompts = [
    "Summarize my last 5 emails",
    "Draft a reply to the latest thread",
    "Move tomorrow's review to Thursday",
  ];

  return (
    <>
      <style jsx global>{`
        body.ai-chat-immersive .app-topbar-shell,
        body.ai-chat-immersive .mobile-app-nav {
          display: none !important;
        }

        body.ai-chat-immersive .app-page > div,
        body.ai-chat-immersive .app-page main {
          padding: 0 !important;
        }
      `}</style>

      <div className="fixed inset-0 z-[60] overflow-hidden bg-[var(--color-app-bg)] text-[var(--color-app-text)] lg:left-[var(--sidebar-width)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.1),transparent_18%),radial-gradient(circle_at_22%_86%,rgba(34,197,94,0.18),transparent_16%)] opacity-70" />

        <div className="relative flex h-full w-full gap-4 p-4 sm:p-5 lg:p-6">
          {sidebarOpen ? (
            <aside className="home-panel hidden w-72 shrink-0 flex-col overflow-hidden rounded-[28px] sm:flex">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--color-app-border)] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  Chats
                </p>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Collapse sidebar"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface-soft)] hover:text-[var(--color-app-text)]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M15 6l-6 6 6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="px-3 pt-3">
                <button
                  type="button"
                  onClick={() => openConversation(null)}
                  className="flex w-full items-center gap-2 rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2.5 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  New chat
                </button>
              </div>

              <div className="mt-2 flex-1 overflow-y-auto px-2 pb-3">
                {conversationsLoading ? (
                  <div className="space-y-2 px-2 pt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-9 animate-pulse rounded-[12px] bg-[var(--color-app-surface-strong)]"
                      />
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="px-3 pt-3 text-sm text-[var(--color-app-text-soft)]">
                    No conversations yet. Send a message to start one.
                  </p>
                ) : (
                  <ul className="space-y-0.5">
                    {sortedConversations.map((conversation) => {
                      const isActive = conversation.id === activeConversationId;
                      const isRenaming = renamingId === conversation.id;
                      return (
                        <li key={conversation.id}>
                          {isRenaming ? (
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => submitRename(conversation.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  submitRename(conversation.id);
                                if (e.key === "Escape") setRenamingId(null);
                              }}
                              className="w-full rounded-[12px] border border-[var(--color-app-accent)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => openConversation(conversation.id)}
                              className={`group flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-left text-sm transition ${
                                isActive
                                  ? "bg-[var(--color-app-accent-soft)] text-[var(--color-app-text)]"
                                  : "text-[var(--color-app-text-muted)] hover:bg-[var(--color-app-surface-soft)]"
                              }`}
                            >
                              <span className="min-w-0 flex-1 truncate">
                                {conversation.title || "New conversation"}
                              </span>
                              <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) =>
                                    startRenaming(conversation, e)
                                  }
                                  aria-label="Rename conversation"
                                  className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-app-text-soft)] hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M12 20h9" strokeLinecap="round" />
                                    <path
                                      d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) =>
                                    handleDeleteConversation(conversation.id, e)
                                  }
                                  aria-label="Delete conversation"
                                  className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-app-text-soft)] hover:bg-[var(--color-app-surface)] hover:text-[var(--color-error)]"
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M3 6h18" strokeLinecap="round" />
                                    <path
                                      d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              </span>
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </aside>
          ) : null}

          <section className="home-panel home-panel-strong relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[32px]">
            <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                {!sidebarOpen ? (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Show chats"
                    className="hidden h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] sm:flex"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M9 6l6 6-6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : null}
                <span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M9 4v16M15 4v16"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <h1 className="font-[family:var(--font-inter)] text-[18px] font-semibold tracking-[-0.03em] text-[var(--color-app-text)]">
                  Chat
                </h1>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-app-text-muted)]">
                <ThemeToggle />
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="pointer-events-none absolute right-8 top-6 h-28 w-28 rounded-[38%] bg-[var(--color-app-accent)] opacity-45 blur-2xl" />
              <div className="pointer-events-none absolute bottom-6 left-8 h-24 w-24 rounded-full bg-[rgba(34,197,94,0.24)] blur-2xl" />

              <div
                ref={conversationScrollRef}
                className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
              >
                <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-start px-3 pb-2 pt-0 text-center">
                  <h2 className="mt-3 text-balance font-[family:var(--font-inter)] text-[clamp(2.5rem,3vw,4.75rem)] font-medium leading-tight tracking-tight text-[var(--color-app-text)]">
                    Ask the agent to work your inbox and calendar from one
                    place.
                  </h2>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    {starterPrompts.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setInput(item)}
                        className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-app-text-muted)] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-[var(--color-app-border-strong)] hover:text-[var(--color-app-text)]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                  <div
                    ref={scrollRef}
                    className="max-h-[min(48vh,440px)] space-y-5 overflow-y-auto pr-1"
                  >
                    {messages.map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[92%] rounded-[20px] px-4 py-3 text-sm leading-7 sm:max-w-[80%] ${
                            message.role === "user"
                              ? "bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)]"
                              : "border border-[var(--color-app-border)] bg-[var(--color-app-surface)] text-[var(--color-app-text)]"
                          } ${message.role === "assistant" ? "ai-assistant-bubble" : "whitespace-pre-wrap"}`}
                        >
                          {message.role === "assistant" ? (
                            <AssistantMessageContent
                              content={message.content}
                              loading={loading}
                            />
                          ) : (
                            message.content
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {error ? (
                    <div className="rounded-[20px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
                      {error}
                    </div>
                  ) : null}

                  {pendingAction ? (
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
                        Review the details below. Nothing happens until you
                        confirm.
                      </p>
                      <div className="mt-5">
                        {pendingAction.kind === "email" ? (
                          <EmailDraftReview
                            draft={pendingAction}
                            onChange={setPendingAction}
                          />
                        ) : pendingAction.kind === "calendar_delete" ? (
                          <CalendarActionReview action={pendingAction} />
                        ) : (
                          <CalendarDraftReview
                            draft={pendingAction}
                            onChange={setPendingAction}
                          />
                        )}
                      </div>
                      {actionError ? (
                        <p className="mt-4 text-sm text-[var(--color-error)]">
                          {actionError}
                        </p>
                      ) : null}
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={confirmPendingAction}
                          disabled={actionSending}
                          className="w-full rounded-[16px] bg-[var(--color-app-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-app-accent-fg)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          {actionSending
                            ? "Working..."
                            : confirmButtonLabel(pendingAction)}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPendingAction(null);
                            setActionError("");
                          }}
                          disabled={actionSending}
                          className="w-full rounded-[16px] border border-[var(--color-app-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-app-text-muted)] transition hover:border-[var(--color-app-border-strong)] hover:text-[var(--color-app-text)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          Discard
                        </button>
                      </div>
                    </section>
                  ) : null}

                  {actionStatus ? (
                    <div className="rounded-[20px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 text-sm text-[var(--color-success)]">
                      {actionStatus}
                    </div>
                  ) : null}

                  <div className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-surface)] p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                    <form
                      onSubmit={handleSubmit}
                      className="flex items-center gap-2"
                    >
                      <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={async (event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            await handleSubmit(event);
                          }
                        }}
                        placeholder="Ask the agent to check Gmail, send a reply, or create a calendar event..."
                        className="min-h-12 flex-1 resize-none rounded-full border-0 bg-transparent px-4 py-[5px] text-sm leading-5 text-[var(--color-app-text)] outline-none placeholder:text-[var(--color-app-text-soft)]"
                        rows={2}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Send message"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-3.5 w-3.5"
                        >
                          <path
                            d="m5 12 13-7-4 7 4 7-13-7Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
