import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";

export function AuthShell({
  eyebrow,
  title,
  description,
  highlights,
  panelEyebrow,
  panelTitle,
  panelDescription,
  children,
}) {
  return (
    <main className="home-grid-bg gradient-mesh min-h-screen bg-[var(--color-app-bg)] text-[var(--color-app-text)]">
      <header className="sticky top-3 z-50 px-4 pt-4 sm:top-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="home-glass rounded-[24px] px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="font-[family:var(--font-inter)] text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--color-app-text)]"
              >
                Relay
              </Link>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link
                  href="/"
                  className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
        <div className="home-spotlight" />
        <div className="home-orbit left-[8%] top-20 hidden h-28 w-28 md:block" />
        <div className="home-orbit right-[8%] top-10 hidden h-36 w-36 lg:block" />

        <div className="mx-auto grid w-full max-w-[1320px] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="space-y-6 py-4 lg:py-10">
            <p className="inline-flex items-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
              {eyebrow}
            </p>
            <h1 className="max-w-3xl text-balance font-[family:var(--font-inter)] text-[clamp(3rem,5vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.065em] text-[var(--color-app-text)]">
              {title}
            </h1>
            <p className="max-w-2xl text-[16px] leading-8 text-[var(--color-app-text-muted)] sm:text-[17px]">
              {description}
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="home-panel home-card-hover rounded-[24px] p-4"
                >
                  <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                    {item.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-app-text-muted)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="home-panel home-panel-strong home-card-hover rounded-[32px] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--color-app-border)] pb-4">
              <div>
                <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  {panelEyebrow}
                </p>
                <p className="mt-1 text-sm text-[var(--color-app-text-muted)]">
                  {panelDescription}
                </p>
              </div>

              <div className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 text-[11px] text-[var(--color-app-text-muted)]">
                {panelTitle}
              </div>
            </div>

            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
