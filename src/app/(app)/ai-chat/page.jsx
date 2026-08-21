"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessageList } from "./components/ChatMessageList";
import { useConversations } from "./hooks/useConversations";
import { useAiChat } from "./hooks/useAiChat";

const starterPrompts = [
  "Summarize my last 5 emails",
  "Draft a reply to the latest thread",
  "Move tomorrow's review to Thursday",
];

function AiChatContent() {
  const scrollRef = useRef(null);
  const conversationScrollRef = useRef(null);
  const wasReviewVisibleRef = useRef(false);
  const searchParams = useSearchParams();
  const autoSentRef = useRef(false);

  const {
    messages,
    input,
    setInput,
    loading,
    error,
    setError,
    pendingAction,
    setPendingAction,
    actionError,
    setActionError,
    actionStatus,
    actionSending,
    loadConversationMessages,
    sendMessage,
    handleSubmit,
    confirmPendingAction,
  } = useAiChat({
    getActiveConversationId: () => activeConversationId,
    onEnsureConversation: () => startNewConversation(),
    onChatFinished: () => loadConversations(),
  });

  const {
    conversations,
    sortedConversations,
    conversationsLoading,
    activeConversationId,
    sidebarOpen,
    setSidebarOpen,
    renamingId,
    setRenamingId,
    renameValue,
    setRenameValue,
    loadConversations,
    openConversation,
    startNewConversation,
    handleDeleteConversation,
    startRenaming,
    submitRename,
  } = useConversations({
    onSelectConversation: loadConversationMessages,
    onError: (msg) => setError(msg),
  });

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
            <ChatHeader
              sidebarOpen={sidebarOpen}
              onOpenSidebar={() => setSidebarOpen(true)}
            />

            <div className="relative flex min-h-0 flex-1 flex-col px-3 pb-3 sm:px-6 sm:pb-6">
              <div className="pointer-events-none absolute right-8 top-6 h-28 w-28 rounded-[38%] bg-[var(--color-app-accent)] opacity-45 blur-2xl" />
              <div className="pointer-events-none absolute bottom-6 left-8 h-24 w-24 rounded-full bg-[rgba(34,197,94,0.24)] blur-2xl" />

              <ChatMessageList
                conversationScrollRef={conversationScrollRef}
                scrollRef={scrollRef}
                starterPrompts={starterPrompts}
                messages={messages}
                loading={loading}
                error={error}
                pendingAction={pendingAction}
                actionError={actionError}
                actionSending={actionSending}
                actionStatus={actionStatus}
                input={input}
                setInput={setInput}
                onConfirmPendingAction={confirmPendingAction}
                onDiscardPendingAction={() => {
                  setPendingAction(null);
                  setActionError("");
                }}
                onChangePendingAction={setPendingAction}
                onSubmitMessage={handleSubmit}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default function AiChatPage() {
  return (
    <Suspense fallback={null}>
      <AiChatContent />
    </Suspense>
  );
}
