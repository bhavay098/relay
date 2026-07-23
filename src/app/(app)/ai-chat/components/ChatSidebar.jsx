"use client";

export function ChatSidebar({
  sidebarOpen,
  onCollapse,
  onNewChat,
  conversations,
  sortedConversations,
  conversationsLoading,
  activeConversationId,
  onOpenConversation,
  renamingId,
  renameValue,
  onRenameValueChange,
  onStartRenaming,
  onSubmitRename,
  onCancelRename,
  onDeleteConversation,
}) {
  if (!sidebarOpen) return null;

  return (
    <aside className="home-panel hidden w-72 shrink-0 flex-col overflow-hidden rounded-[28px] sm:flex">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-app-border)] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
          Chats
        </p>
        <button
          type="button"
          onClick={onCollapse}
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
          onClick={onNewChat}
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
                      onChange={(e) => onRenameValueChange(e.target.value)}
                      onBlur={() => onSubmitRename(conversation.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          onSubmitRename(conversation.id);
                        if (e.key === "Escape") onCancelRename();
                      }}
                      className="w-full rounded-[12px] border border-[var(--color-app-accent)] bg-[var(--color-app-surface)] px-3 py-2 text-sm text-[var(--color-app-text)] outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenConversation(conversation.id)}
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
                            onStartRenaming(conversation, e)
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
                            onDeleteConversation(conversation.id, e)
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
  );
}
