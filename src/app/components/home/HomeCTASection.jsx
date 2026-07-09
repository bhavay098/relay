import Link from "next/link";

export function HomeCTASection({ eyebrow, title, primaryCta, secondaryCta }) {
  return (
    <section className="mx-auto max-w-[1320px] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
      <div className="home-panel home-panel-strong rounded-[32px] px-6 py-8 sm:px-8 sm:py-10 lg:flex lg:items-end lg:justify-between lg:gap-8">
        <div className="max-w-2xl">
          <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-balance font-[family:var(--font-inter)] text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--color-app-text)]">
            {title}
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0">
          <Link
            href={primaryCta.href}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-app-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            {primaryCta.label}
          </Link>
          <Link
            href={secondaryCta.href}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-6 py-3 text-sm font-medium text-[var(--color-app-text)] transition hover:bg-[var(--color-app-surface)]"
          >
            {secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
