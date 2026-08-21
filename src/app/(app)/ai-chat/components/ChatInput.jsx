"use client";

import { useState, useRef, useEffect } from "react";

const SLASH_COMMANDS = [
  { command: "/summarize", desc: "Summarize my recent unread emails and action items" },
  { command: "/draft", desc: "Draft a reply to the latest message" },
  { command: "/schedule", desc: "Schedule a meeting for tomorrow at 2 PM" },
  { command: "/triage", desc: "Review inbox threads and suggest priority tasks" },
];

export function ChatInput({ input, loading, onInputChange, onSubmit }) {
  const [slashIndex, setSlashIndex] = useState(0);
  const showSlashMenu = input.startsWith("/") && !input.includes(" ");
  const textareaRef = useRef(null);

  const filteredCommands = SLASH_COMMANDS.filter((item) =>
    item.command.toLowerCase().startsWith(input.toLowerCase())
  );

  const selectCommand = (cmd) => {
    onInputChange(cmd + " ");
    setSlashIndex(0);
    textareaRef.current?.focus();
  };

  const handleKeyDown = async (event) => {
    if (showSlashMenu && filteredCommands.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSlashIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSlashIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
        return;
      }
      if (event.key === "Tab" || (event.key === "Enter" && !event.shiftKey)) {
        event.preventDefault();
        selectCommand(filteredCommands[slashIndex].command);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onInputChange("");
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await onSubmit(event);
    }
  };

  return (
    <div className="relative">
      {/* Slash command autocomplete popup */}
      {showSlashMenu && filteredCommands.length > 0 && (
        <div className="absolute bottom-full mb-2 w-full overflow-hidden rounded-[20px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-panel-strong)] p-1.5 shadow-[0_16px_36px_rgba(0,0,0,0.35)] backdrop-blur-2xl animate-fadeInUp z-20">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-app-text-soft)]">
            Suggested Commands
          </div>
          {filteredCommands.map((item, idx) => (
            <button
              key={item.command}
              type="button"
              onClick={() => selectCommand(item.command)}
              onMouseEnter={() => setSlashIndex(idx)}
              className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-xs transition ${
                idx === slashIndex
                  ? "bg-[var(--color-app-surface-strong)] text-[var(--color-app-text)] font-medium"
                  : "text-[var(--color-app-text-muted)] hover:bg-[var(--color-app-surface)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-[family:var(--font-mono)] font-semibold text-[var(--color-app-accent)]">
                  {item.command}
                </span>
                <span className="text-[11px] text-[var(--color-app-text-soft)]">
                  {item.desc}
                </span>
              </div>
              <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1.5 py-0.5 font-[family:var(--font-mono)] text-[9px]">
                Tab ⇥
              </kbd>
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="rounded-[24px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-surface)] p-2 shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or press / for slash commands (/draft, /schedule, /summarize)..."
            className="min-h-[52px] max-h-[160px] w-full resize-none bg-transparent px-3.5 py-2 text-xs leading-5 text-[var(--color-app-text)] outline-none placeholder:text-[var(--color-app-text-soft)] sm:text-sm"
            rows={2}
          />

          <div className="flex items-center justify-between border-t border-[var(--color-app-border)] pt-2 px-2">
            <div className="flex items-center gap-2 text-[11px] text-[var(--color-app-text-soft)]">
              <span className="hidden sm:inline">
                Type <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1 py-0.5 font-[family:var(--font-mono)] text-[9px]">/</kbd> for quick actions
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] text-[var(--color-app-text-soft)] sm:inline">
                Enter ↵ to send · Shift+Enter for newline
              </span>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-8 items-center gap-1.5 rounded-full bg-[var(--color-app-accent)] px-3.5 text-xs font-semibold text-[var(--color-app-accent-fg)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <span>Send</span>
                <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                  <path d="m5 12 13-7-4 7 4 7-13-7Z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
