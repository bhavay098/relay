"use client";

export function StarterPrompts({ prompts, onSelect }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-start px-2 pb-2 pt-0 text-center sm:px-3">
      <h2 className="mt-3 text-balance font-[family:var(--font-inter)] text-[clamp(1.65rem,7vw,4.75rem)] font-medium leading-[1.12] tracking-tight text-[var(--color-app-text)] sm:leading-tight">
        Ask the agent to work your inbox and calendar from one place.
      </h2>
      <div className="mt-4 flex max-w-full flex-wrap justify-center gap-2 sm:mt-5 sm:gap-3">
        {prompts.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className="max-w-full truncate rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3.5 py-2 text-[13px] font-medium text-[var(--color-app-text-muted)] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-[var(--color-app-border-strong)] hover:text-[var(--color-app-text)] sm:px-5 sm:py-2.5 sm:text-sm"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
