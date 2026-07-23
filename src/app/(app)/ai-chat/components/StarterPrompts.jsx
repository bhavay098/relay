"use client";

export function StarterPrompts({ prompts, onSelect }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-start px-3 pb-2 pt-0 text-center">
      <h2 className="mt-3 text-balance font-[family:var(--font-inter)] text-[clamp(2.5rem,3vw,4.75rem)] font-medium leading-tight tracking-tight text-[var(--color-app-text)]">
        Ask the agent to work your inbox and calendar from one place.
      </h2>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {prompts.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-app-text-muted)] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-[var(--color-app-border-strong)] hover:text-[var(--color-app-text)]"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
