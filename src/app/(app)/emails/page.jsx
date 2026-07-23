"use client";

import { useEffect, useMemo, useState } from "react";
import { EmailReadingPane } from "./components/EmailReadingPane";
import { EmailsHeader } from "./components/EmailsHeader";
import { EmptyState } from "./components/EmptyState";
import { MessageList } from "./components/MessageList";
import { ReadingPaneEmpty } from "./components/ReadingPaneEmpty";
import { RowSkeleton } from "./components/RowSkeleton";
import { EMAILS_ERROR, formatSender, formatSenderEmail } from "./utils";

export default function EmailsPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [mailbox, setMailbox] = useState("inbox");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEmails() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/gmail?mailbox=${mailbox}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          console.error("Emails page error response:", data);
          setError(EMAILS_ERROR);
          return;
        }
        setMessages(data.messages ?? []);
      } catch (caughtError) {
        if (caughtError.name !== "AbortError") {
          console.error(caughtError);
          setError(EMAILS_ERROR);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadEmails();
    return () => controller.abort();
  }, [mailbox]);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch(`/api/gmail/refresh?mailbox=${mailbox}`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? EMAILS_ERROR);
        return;
      }
      setMessages(data.messages ?? []);
    } catch (caughtError) {
      console.error(caughtError);
      setError(EMAILS_ERROR);
    } finally {
      setRefreshing(false);
    }
  }

  function handleMailboxChange(nextMailbox) {
    if (nextMailbox === mailbox) return;
    setMailbox(nextMailbox);
    setQuery("");
    setActiveId(null);
  }

  useEffect(() => {
    if (!activeId) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId]);

  const filteredMessages = useMemo(() => {
    if (!query.trim()) return messages;
    const normalizedQuery = query.trim().toLowerCase();
    return messages.filter((message) =>
      [
        formatSender(message.from),
        formatSenderEmail(message.from),
        message.subject ?? "",
        message.snippet ?? "",
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [messages, query]);
  const activeMessage = useMemo(
    () => messages.find((message) => message.id === activeId) ?? null,
    [messages, activeId],
  );
  const hasMessages = !loading && !error && messages.length > 0;
  const mailboxLabel = mailbox === "sent" ? "sent messages" : "inbox";

  return (
    <div className="mx-auto max-w-[1320px] space-y-5">
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
          <div
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
