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
          <p className="inline-flex items-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
            {eyebrow}
          </p>
          <h1 className="mt-6 text-balance font-(--font-inter) text-[clamp(3.15rem,6vw,5.1rem)] font-medium leading-tight tracking-tight text-[var(--color-app-text)]">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-8 text-[var(--color-app-text-muted)] sm:text-[17px]">
            {description}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-app-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-app-accent-fg)] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_50px_rgba(15,23,42,0.12)] transition hover:brightness-110"
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

          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {capabilities.map((item) => (
              <div
                key={item}
                className="home-panel home-card-hover rounded-full px-4 py-2 text-center text-sm text-[var(--color-app-text-muted)]"
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
