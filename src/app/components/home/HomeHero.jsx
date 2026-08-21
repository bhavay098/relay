import Link from "next/link";
import { ProductDock } from "./ProductDock";

export function HomeHero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  capabilities,
  heroSignals,
  commandQueue,
  heroActions,
}) {
  return (
    <section className="flex flex-1 items-center justify-center py-14 sm:py-[4.5rem] lg:py-[5.75rem]">
      <div className="w-full max-w-6xl">
        <div className="animate-fadeInUp mx-auto max-w-6xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3.5 py-1 font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
            {eyebrow}
          </p>
          <h1 className="mt-6 text-balance font-[family:var(--font-inter)] text-[clamp(1.8rem,6vw,5.1rem)] font-medium leading-tight tracking-tight text-[var(--color-app-text)]">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-8 text-[var(--color-app-text-muted)] sm:text-[17px]">
            {description}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-app-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-app-accent-fg)] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_50px_rgba(15,23,42,0.12)] transition hover:brightness-110 active:scale-98"
            >
              {primaryCta.label}
            </Link>
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-app-border)] bg-transparent px-6 py-3 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]"
            >
              {secondaryCta.label}
            </Link>
          </div>

          {/* Trust and Integration badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--color-app-text-soft)]">
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[var(--color-success)]">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Google OAuth & Corsair Verified</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[var(--color-app-accent)]">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Clerk Authenticated</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1.5 py-0.5 font-[family:var(--font-mono)] text-[10px]">
                ⌘K
              </kbd>
              <span>Command Bar Everywhere</span>
            </span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {capabilities.map((item) => (
              <div
                key={item}
                className="home-panel home-card-hover rounded-full px-3.5 py-1.5 text-center text-xs font-medium text-[var(--color-app-text-muted)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="animate-slideInRight mx-auto mt-12 w-full max-w-4xl">
          <ProductDock
            heroSignals={heroSignals}
            commandQueue={commandQueue}
            heroActions={heroActions}
          />
        </div>
      </div>
    </section>
  );
}
