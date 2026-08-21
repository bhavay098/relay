import { StarterPrompts } from "./StarterPrompts";
import { AssistantMessageContent } from "./AssistantMessageContent";
import { ToolExecutionBadge } from "./ToolExecutionBadge";
import { ActionReviewCard } from "./ActionReviewCard";
import { ChatInput } from "./ChatInput";

export function ChatMessageList({
  conversationScrollRef,
  scrollRef,
  starterPrompts,
  messages,
  loading,
  error,
  pendingAction,
  actionError,
  actionSending,
  actionStatus,
  input,
  setInput,
  onConfirmPendingAction,
  onDiscardPendingAction,
  onChangePendingAction,
  onSubmitMessage,
}) {
  return (
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
          {messages.map((message) => (
            <div
              key={message.id || `${message.role}-${message.content?.slice(0, 20)}`}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
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
            onConfirm={onConfirmPendingAction}
            onDiscard={onDiscardPendingAction}
            onChangePendingAction={onChangePendingAction}
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
          onSubmit={onSubmitMessage}
        />
      </div>
    </div>
  );
}
