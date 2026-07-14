"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const suggestions = [
  "Summarize my unread emails",
  "What's on my calendar today?",
  "Draft a reply to my last email",
];

export function AgentPromptCard() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  function goToAgent(text) {
    const value = text.trim();
    if (!value) return;
    // Pass the prompt along as a query param; ai-chat/page.jsx can read
    // it on load to pre-fill or auto-send the first message.
    router.push(`/ai-chat?prompt=${encodeURIComponent(value)}`);
  }

  return (
    <section className="home-panel home-panel-strong rounded-[28px] p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--color-app-accent-soft)] text-[var(--color-app-accent)]">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <rect
              x="4"
              y="8"
              width="16"
              height="11"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M12 8V5m-3 0h6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="9" cy="13.5" r="1.2" fill="currentColor" />
            <circle cx="15" cy="13.5" r="1.2" fill="currentColor" />
          </svg>
        </span>
        <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
          Ask your agent
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToAgent(prompt);
        }}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Draft a reply, summarize an email, schedule a meeting..."
          className="flex-1 rounded-[16px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 text-sm text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-soft)] outline-none focus:border-[var(--color-app-accent)]"
        />
        <button
          type="submit"
          className="rounded-[16px] bg-[var(--color-app-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-app-accent-fg)] transition hover:bg-[var(--color-accent-hover)]"
        >
          Ask
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => goToAgent(s)}
            className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-1.5 text-xs text-[var(--color-app-text-muted)] transition hover:border-[var(--color-app-border-strong)] hover:text-[var(--color-app-text)]"
          >
            {s}
          </button>
        ))}
      </div>
    </section>
  );
}
