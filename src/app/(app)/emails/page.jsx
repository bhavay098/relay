"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { EmailReadingPane } from "./components/EmailReadingPane";
import { EmailsHeader } from "./components/EmailsHeader";
import { EmptyState } from "./components/EmptyState";
import { MessageList } from "./components/MessageList";
import { ReadingPaneEmpty } from "./components/ReadingPaneEmpty";
import { RowSkeleton } from "./components/RowSkeleton";
import { EMAILS_ERROR, formatSender, formatSenderEmail } from "./utils";
import { useToast } from "../../components/ToastProvider";
import { apiFetch } from "../../../lib/api";

export default function EmailsPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [mailbox, setMailbox] = useState("inbox");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    apiFetch(`/api/gmail?mailbox=${mailbox}`, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setMessages(data?.messages ?? []);
      })
      .catch((caughtError) => {
        if (controller.signal.aborted || caughtError?.name === "AbortError") return;
        console.error("Emails page error:", caughtError);
        setError(EMAILS_ERROR);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [mailbox]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch(`/api/gmail/refresh?mailbox=${mailbox}`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        const errMsg = data.error ?? EMAILS_ERROR;
        setError(errMsg);
        showError(errMsg);
        return;
      }
      setMessages(data.messages ?? []);
      showSuccess(`Refreshed ${mailbox}: ${data.messages?.length ?? 0} messages`);
    } catch (caughtError) {
      console.error(caughtError);
      setError(EMAILS_ERROR);
      showError(EMAILS_ERROR);
    } finally {
      setRefreshing(false);
    }
  }, [mailbox, showSuccess, showError]);

  function handleMailboxChange(nextMailbox) {
    if (nextMailbox === mailbox) return;
    setMailbox(nextMailbox);
    setQuery("");
    setActiveId(null);
  }

  const filteredMessages = useMemo(() => {
    if (!query.trim()) return messages;
    const normalizedQuery = query.trim().toLowerCase();
    return messages.filter((message) =>
      [
        formatSender(message.from),
        formatSenderEmail(message.from),
        message.subject ?? "",
        message.snippet ?? "",
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [messages, query]);

  const activeMessage = useMemo(
    () => messages.find((message) => message.id === activeId) ?? null,
    [messages, activeId]
  );

  // Keyboard navigation for Superhuman-style power-users
  useEffect(() => {
    const onKeyDown = (event) => {
      // Don't capture when typing in an input/textarea
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      if (event.key === "Escape") {
        setActiveId(null);
      } else if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        if (filteredMessages.length === 0) return;
        const currentIndex = filteredMessages.findIndex((m) => m.id === activeId);
        const nextIndex = currentIndex < filteredMessages.length - 1 ? currentIndex + 1 : 0;
        setActiveId(filteredMessages[nextIndex].id);
      } else if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        if (filteredMessages.length === 0) return;
        const currentIndex = filteredMessages.findIndex((m) => m.id === activeId);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredMessages.length - 1;
        setActiveId(filteredMessages[prevIndex].id);
      } else if (event.key === "e" && activeMessage) {
        event.preventDefault();
        showSuccess(`Archived: "${activeMessage.subject || "Email"}"`);
      } else if (event.key === "r" && activeMessage) {
        event.preventDefault();
        const replyInput = document.getElementById("email-reply-prompt-input");
        if (replyInput) {
          replyInput.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId, filteredMessages, activeMessage, showSuccess]);

  const hasMessages = !loading && !error && messages.length > 0;
  const mailboxLabel = mailbox === "sent" ? "sent messages" : "inbox";

  return (
    <div className="mx-auto min-w-0 max-w-[1320px] space-y-5">
      <EmailsHeader
        loading={loading}
        error={error}
        messagesCount={messages.length}
        filteredCount={filteredMessages.length}
        mailbox={mailbox}
        onMailboxChange={handleMailboxChange}
        query={query}
        onQueryChange={setQuery}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        hasMessages={hasMessages}
      />

      {/* Power-user helper hint pill */}
      {hasMessages && (
        <div className="hidden items-center justify-between px-2 text-[11px] text-[var(--color-app-text-soft)] sm:flex">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1 py-0.5 font-[family:var(--font-mono)]">J</kbd> /{" "}
              <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1 py-0.5 font-[family:var(--font-mono)]">K</kbd> navigate
            </span>
            <span>
              <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1 py-0.5 font-[family:var(--font-mono)]">R</kbd> AI reply
            </span>
            <span>
              <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1 py-0.5 font-[family:var(--font-mono)]">E</kbd> archive
            </span>
          </div>
          <span>{filteredMessages.length} total messages</span>
        </div>
      )}

      {error ? (
        <div className="rounded-[22px] border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.08)] px-4 py-4 text-sm text-[var(--color-error)]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="home-panel overflow-hidden rounded-[24px]">
          {Array.from({ length: 6 }).map((_, index) => (
            <RowSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!loading && !error && messages.length === 0 ? (
        <EmptyState
          onRefresh={handleRefresh}
          refreshing={refreshing}
          mailbox={mailbox}
        />
      ) : null}

      {!loading && !error && messages.length > 0 && filteredMessages.length === 0 ? (
        <div className="home-panel rounded-[24px] px-5 py-10 text-center text-sm text-[var(--color-app-text-muted)]">
          No {mailboxLabel} match &ldquo;{query}&rdquo;.
        </div>
      ) : null}

      {hasMessages && filteredMessages.length > 0 ? (
        <div className="home-panel hidden overflow-hidden rounded-[24px] lg:flex lg:h-[calc(100vh-280px)] lg:min-h-[520px]">
          <div className="w-[380px] shrink-0 overflow-y-auto border-r border-[var(--color-app-border)]">
            <MessageList
              messages={filteredMessages}
              activeId={activeId}
              mailbox={mailbox}
              onSelect={setActiveId}
            />
          </div>
          <div className="min-w-0 flex-1">
            {activeMessage ? (
              <EmailReadingPane
                key={activeMessage.id}
                messageId={activeMessage.id}
                listItem={activeMessage}
                mailbox={mailbox}
                onClose={() => setActiveId(null)}
                showCloseButton={false}
              />
            ) : (
              <ReadingPaneEmpty />
            )}
          </div>
        </div>
      ) : null}

      {hasMessages && filteredMessages.length > 0 ? (
        <div className="home-panel overflow-hidden rounded-[24px] lg:hidden">
          <MessageList
            messages={filteredMessages}
            activeId={activeId}
            mailbox={mailbox}
            onSelect={setActiveId}
          />
        </div>
      ) : null}

      {activeId ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close email details backdrop"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setActiveId(null)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-[var(--color-app-border)] bg-[var(--color-app-panel-strong)] shadow-2xl">
            <EmailReadingPane
              messageId={activeId}
              listItem={activeMessage}
              mailbox={mailbox}
              onClose={() => setActiveId(null)}
              showCloseButton
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
