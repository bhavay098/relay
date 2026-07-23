"use client";

export function ChatInput({ input, loading, onInputChange, onSubmit }) {
  return (
    <div className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-surface)] p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={async (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              await onSubmit(event);
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
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path d="m5 12 13-7-4 7 4 7-13-7Z" fill="currentColor" />
          </svg>
        </button>
      </form>
    </div>
  );
}
