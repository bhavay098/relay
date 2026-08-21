"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeToggle } from "../../components/ThemeToggle";
import {
  parseSseChunk,
  actionSuccessMessage,
  CHAT_REQUEST_ERROR,
  CHAT_STREAM_ERROR,
  INITIAL_MESSAGES,
} from "./utils";
import { AssistantMessageContent } from "./components/AssistantMessageContent";
import { ActionReviewCard } from "./components/ActionReviewCard";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatInput } from "./components/ChatInput";
import { StarterPrompts } from "./components/StarterPrompts";
import { ToolExecutionBadge } from "./components/ToolExecutionBadge";
import { useToast } from "../../components/ToastProvider";

const starterPrompts = [
  "Summarize my last 5 emails",
  "Draft a reply to the latest thread",
  "Move tomorrow's review to Thursday",
];

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
  const { showSuccess, showError } = useToast();

  // Chat history / conversation management state
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState(null);
  // Starts closed. On desktop this just means one tap to reveal it; on
  // mobile the sidebar renders as a full-screen overlay (see ChatSidebar),
  // so defaulting it open would cover the chat the moment the page loads.
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      showSuccess(status);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: status },
      ]);
      setPendingAction(null);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Could not complete this action.";
      setActionError(errMsg);
      showError(errMsg);
    } finally {
      setActionSending(false);
    }
  }

  // If we arrived here from the dashboard or command palette
  // (e.g. /ai-chat?prompt=... or /ai-chat?q=...), auto-send it once.
  useEffect(() => {
    const prompt = searchParams.get("prompt") || searchParams.get("q");
    if (prompt && !autoSentRef.current) {
      autoSentRef.current = true;
      sendMessage(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <>
      <style jsx global>{`
        body.ai-chat-immersive .app-topbar-shell {
          display: none !important;
        }

        body.ai-chat-immersive .mobile-app-nav {
          z-index: 70;
        }

        body.ai-chat-immersive .app-page > div,
        body.ai-chat-immersive .app-page main {
          padding: 0 !important;
        }
      `}</style>

      <div className="fixed inset-0 z-[60] overflow-hidden bg-[var(--color-app-bg)] text-[var(--color-app-text)] lg:left-[var(--sidebar-width)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.1),transparent_18%),radial-gradient(circle_at_22%_86%,rgba(34,197,94,0.18),transparent_16%)] opacity-70" />

        <div className="relative flex h-full w-full gap-4 p-3 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:p-5 lg:p-6">
          <ChatSidebar
            sidebarOpen={sidebarOpen}
            onCollapse={() => setSidebarOpen(false)}
            onNewChat={() => openConversation(null)}
            conversations={conversations}
            sortedConversations={sortedConversations}
            conversationsLoading={conversationsLoading}
            activeConversationId={activeConversationId}
            onOpenConversation={openConversation}
            renamingId={renamingId}
            renameValue={renameValue}
            onRenameValueChange={setRenameValue}
            onStartRenaming={startRenaming}
            onSubmitRename={submitRename}
            onCancelRename={() => setRenamingId(null)}
            onDeleteConversation={handleDeleteConversation}
          />

          <section className="home-panel home-panel-strong relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] sm:rounded-[32px]">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                {!sidebarOpen ? (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Show chats"
                    className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]"
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
                <h1 className="font-[family:var(--font-inter)] text-base font-semibold tracking-[-0.03em] text-[var(--color-app-text)] sm:text-[18px]">
                  Chat
                </h1>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-app-text-muted)]">
                <ThemeToggle />
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="pointer-events-none absolute right-8 top-6 h-28 w-28 rounded-[38%] bg-[var(--color-app-accent)] opacity-45 blur-2xl" />
              <div className="pointer-events-none absolute bottom-6 left-8 h-24 w-24 rounded-full bg-[rgba(34,197,94,0.24)] blur-2xl" />

              <div
                ref={conversationScrollRef}
                className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
              >
                <StarterPrompts prompts={starterPrompts} onSelect={setInput} />

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
                    {loading && (
                      <ToolExecutionBadge status="Inspecting context and executing actions..." />
                    )}
                  </div>

                  {error ? (
                    <div className="rounded-[20px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
                      {error}
                    </div>
                  ) : null}

                  {pendingAction ? (
                    <ActionReviewCard
                      pendingAction={pendingAction}
                      actionError={actionError}
                      actionSending={actionSending}
                      onConfirm={confirmPendingAction}
                      onDiscard={() => {
                        setPendingAction(null);
                        setActionError("");
                      }}
                      onChangePendingAction={setPendingAction}
                    />
                  ) : null}

                  {actionStatus ? (
                    <div className="rounded-[20px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 text-sm text-[var(--color-success)]">
                      {actionStatus}
                    </div>
                  ) : null}

                  <ChatInput
                    input={input}
                    loading={loading}
                    onInputChange={setInput}
                    onSubmit={handleSubmit}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
