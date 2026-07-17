"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

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
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-").concat(`T${pad(date.getHours())}:${pad(date.getMinutes())}`);
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
          onChange={(event) =>
            onChange({ ...draft, body: event.target.value })
          }
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
            updateField("attendees", attendeesFromInputValue(event.target.value))
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
        <div
          key={label}
          className="flex flex-col gap-1 sm:flex-row sm:gap-3"
        >
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
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask me to draft replies, summarize Gmail, or create calendar events.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [actionSending, setActionSending] = useState(false);
  const scrollRef = useRef(null);
  const searchParams = useSearchParams();
  const autoSentRef = useRef(false);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, loading, pendingAction]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
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
          body: JSON.stringify(pendingAction),
        });
      } else if (pendingAction.kind === "calendar_update") {
        const { eventId, kind, ...changes } = pendingAction;
        response = await fetch(`/api/calendar/${eventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
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

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="home-panel home-panel-strong rounded-[32px] p-5 sm:p-8 lg:p-10">
        <p className="inline-flex items-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
          Relay Agent
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-balance font-[family:var(--font-inter)] text-[clamp(1.8rem,3.8vw,3rem)] font-normal leading-tight tracking-tight text-[var(--color-app-text)]">
              Ask the agent to work your inbox and calendar from one surface.
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--color-app-text-muted)]">
              Draft replies, summarize messages, or move meetings without switching context.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 xl:min-w-[420px]">
            {[
              "Summarize unread mail",
              "Draft a reply",
              "Reschedule a meeting",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 text-sm text-[var(--color-app-text-muted)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-h-[min(72vh,820px)] flex-col">
          <div
            ref={scrollRef}
            className="home-panel mb-4 flex-1 space-y-4 overflow-y-auto rounded-[28px] p-4 sm:p-5"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-[18px] px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${
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
            <div className="mb-4 rounded-[18px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
              {error}
            </div>
          ) : null}

          {pendingAction ? (
            <section
              aria-labelledby="review-action-title"
              className="mb-4 rounded-[22px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-chip)] p-4 sm:p-5"
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
                  className="w-full rounded-[14px] bg-[var(--color-app-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-app-accent-fg)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {actionSending ? "Working..." : confirmButtonLabel(pendingAction)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingAction(null);
                    setActionError("");
                  }}
                  disabled={actionSending}
                  className="w-full rounded-[14px] border border-[var(--color-app-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-app-text-muted)] transition hover:border-[var(--color-app-border-strong)] hover:text-[var(--color-app-text)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Discard
                </button>
              </div>
            </section>
          ) : null}

          {actionStatus ? (
            <p className="mb-4 text-sm text-[var(--color-success)]">
              {actionStatus}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask the agent to check Gmail, send a reply, or create a calendar event..."
              className="min-h-14 flex-1 resize-none rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 text-sm text-[var(--color-app-text)] outline-none placeholder:text-[var(--color-app-text-soft)] focus:border-[var(--color-app-accent)]"
              rows={2}
            />
            <button
              type="submit"
              disabled={loading}
              className="min-h-12 rounded-[18px] bg-[var(--color-app-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-app-accent-fg)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="home-panel rounded-[28px] p-5">
            <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
              Try this
            </p>
            <div className="mt-4 space-y-2">
              {[
                "Summarize my last 5 emails",
                "Draft a reply to the latest thread",
                "Move tomorrow's review to Thursday",
              ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setInput(item)}
                  className="w-full rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 text-left text-sm text-[var(--color-app-text-muted)] transition hover:border-[var(--color-app-border-strong)] hover:text-[var(--color-app-text)]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="home-panel rounded-[28px] p-5 text-sm leading-7 text-[var(--color-app-text-muted)]">
            The agent can read your connected Gmail and Google Calendar data. It always asks for approval before it sends, creates, changes, or deletes anything, and calendar drafts stay editable until you confirm them.
          </div>
        </aside>
      </div>
    </div>
  );
}
