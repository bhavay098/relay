"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/ToastProvider";

const PROMPT_PRESETS = [
  { label: "Polite Confirmation", prompt: "Draft a concise, polite confirmation acknowledging this email and confirming everything looks good." },
  { label: "Suggest Alternate Time", prompt: "Draft a polite reply explaining that the proposed time doesn't work and suggest 2 alternate time slots tomorrow." },
  { label: "Request More Details", prompt: "Draft a friendly reply asking for more specific details and timeline expectations before moving forward." },
  { label: "Decline Politely", prompt: "Draft a professional and graceful decline stating current capacity constraints." },
];

export function EmailReplyComposer({ message }) {
  const [promptText, setPromptText] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const router = useRouter();
  const { showSuccess, showInfo } = useToast();

  const handlePresetClick = (presetPrompt) => {
    setPromptText(presetPrompt);
  };

  const handleLaunchAgent = (customPrompt) => {
    const activePrompt = customPrompt || promptText || "Draft a reply to this email";
    const sender = message?.from || "the sender";
    const subject = message?.subject || "this thread";

    const fullPrompt = `${activePrompt}\n\nEmail Context:\nFrom: ${sender}\nSubject: ${subject}\nSnippet: ${message?.snippet || ""}`;

    showInfo("Handoff to AI Agent drafting studio...");
    router.push(`/ai-chat?q=${encodeURIComponent(fullPrompt)}`);
  };

  return (
    <div className="mt-8 rounded-[22px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-surface)] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-app-border)] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-app-accent-soft)] text-[var(--color-app-text)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
            </svg>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-app-text)]">
            AI Reply Assistant
          </span>
        </div>
        <span className="text-[10px] text-[var(--color-app-text-soft)]">
          Press R or pick a preset
        </span>
      </div>

      {/* Preset Pills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {PROMPT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePresetClick(preset.prompt)}
            className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-app-text-muted)] transition hover:border-[var(--color-app-border-strong)] hover:text-[var(--color-app-text)] hover:bg-[var(--color-app-surface-soft)]"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="mt-3">
        <label htmlFor="email-reply-prompt-input" className="sr-only">
          Reply instructions
        </label>
        <textarea
          id="email-reply-prompt-input"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Type instructions or select a preset to draft a reply..."
          rows={2}
          className="w-full resize-none rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] p-3 text-xs leading-5 text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-soft)] focus:border-[var(--color-app-border-strong)] focus:outline-none"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-[var(--color-app-text-soft)]">
          Drafts are reviewed before sending
        </span>
        <button
          type="button"
          onClick={() => handleLaunchAgent()}
          className="flex items-center gap-1.5 rounded-[12px] bg-[var(--color-app-accent)] px-3.5 py-2 text-xs font-semibold text-[var(--color-app-accent-fg)] transition hover:brightness-110 active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Draft Reply with AI</span>
        </button>
      </div>
    </div>
  );
}
