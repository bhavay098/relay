"use client";

export function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: "Global Navigation",
      items: [
        { key: "⌘ K / Ctrl K", desc: "Open Command Palette" },
        { key: "?", desc: "Show keyboard shortcuts" },
        { key: "T", desc: "Toggle dark / light theme" },
        { key: "Esc", desc: "Close modals / clear selection" },
      ],
    },
    {
      title: "Inbox Operations",
      items: [
        { key: "J / ↓", desc: "Next email thread" },
        { key: "K / ↑", desc: "Previous email thread" },
        { key: "Enter", desc: "Open selected email" },
        { key: "R", desc: "Jump to AI reply draft" },
        { key: "/", desc: "Search inbox" },
      ],
    },
    {
      title: "Calendar Schedule",
      items: [
        { key: "C", desc: "Create new event" },
        { key: "T", desc: "Jump to today" },
        { key: "← / →", desc: "Previous / Next week" },
      ],
    },
    {
      title: "AI Agent Studio",
      items: [
        { key: "/summarize", desc: "Summarize recent unread mail" },
        { key: "/draft", desc: "Draft a reply with context" },
        { key: "/schedule", desc: "Schedule event via agent" },
        { key: "Enter", desc: "Send message to agent" },
        { key: "Shift + Enter", desc: "New line in chat prompt" },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close shortcuts modal backdrop"
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="animate-scaleIn relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-panel-strong)] shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-[var(--color-app-border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[var(--color-app-accent)] text-xs font-bold text-[var(--color-app-accent-fg)]">
              ⌨
            </span>
            <h2 id="shortcuts-title" className="text-sm font-semibold tracking-wide text-[var(--color-app-text)] uppercase">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-app-text-muted)] hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)] transition"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="grid gap-6 overflow-y-auto p-6 sm:grid-cols-2">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-app-text-soft)]">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-2 rounded-[12px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-xs"
                  >
                    <span className="text-[var(--color-app-text-muted)]">{item.desc}</span>
                    <kbd className="rounded-[6px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-chip)] px-2 py-0.5 font-[family:var(--font-mono)] text-[10px] font-semibold text-[var(--color-app-text)]">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-6 py-3 text-center text-xs text-[var(--color-app-text-soft)]">
          Press <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1.5 py-0.5 font-[family:var(--font-mono)] text-[10px]">Esc</kbd> anytime to dismiss this menu.
        </div>
      </div>
    </div>
  );
}
