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
    <main className="home-page home-grid-bg gradient-mesh min-h-[100dvh] overflow-x-clip bg-[var(--color-app-bg)] text-[var(--color-app-text)]">
      <header className="sticky top-3 z-50 px-4 pt-4 sm:top-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="home-glass home-navbar-shell rounded-[24px] px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
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

      <section className="relative isolate overflow-hidden px-3 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-6 lg:px-8 lg:pb-12 lg:pt-10">
        <div className="home-spotlight" />
        <div className="home-orbit left-[8%] top-20 hidden h-28 w-28 md:block" />
        <div className="home-orbit right-[8%] top-10 hidden h-36 w-36 lg:block" />

        <div className="mx-auto grid w-full min-w-0 max-w-[1120px] gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-center">
          <div className="min-w-0 space-y-5 py-3 sm:space-y-6 sm:py-4 lg:py-10">
            <p className="inline-flex items-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
              {eyebrow}
            </p>
            <h1 className="max-w-3xl text-balance font-[family:var(--font-inter)] text-[clamp(1.75rem,7vw,4.75rem)] font-semibold leading-[1.12] tracking-[-0.05em] text-[var(--color-app-text)] sm:leading-tight sm:tracking-[-0.065em]">
              {title}
            </h1>
            <p className="max-w-2xl text-[15px] leading-7 text-[var(--color-app-text-muted)] sm:text-[17px] sm:leading-8">
              {description}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="home-panel home-card-hover min-w-0 overflow-hidden rounded-[20px] p-3.5 sm:rounded-[24px] sm:p-4"
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

          <div className="home-panel home-panel-strong home-card-hover mx-auto w-full min-w-0 max-w-[540px] overflow-hidden rounded-[24px] p-4 sm:rounded-[32px] sm:p-6 lg:max-w-none">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--color-app-border)] pb-4">
              <div className="min-w-0">
                <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  {panelEyebrow}
                </p>
                <p className="mt-1 text-sm text-[var(--color-app-text-muted)]">
                  {panelDescription}
                </p>
              </div>
            </div>

            <div className="auth-clerk min-w-0 max-w-full [&_.cl-card]:w-full [&_.cl-cardBox]:max-w-full [&_.cl-cardBox]:w-full [&_.cl-rootBox]:max-w-full [&_.cl-rootBox]:w-full">
              {children}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
