import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";

export function HomeNavbar({ navLinks }) {
  return (
    <header className="sticky top-3 z-50 px-4 sm:top-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="animate-fadeInDown home-glass home-navbar-shell rounded-[24px] px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-[family:var(--font-inter)] text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--color-app-text)]"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 40 40"
                  fill="none"
                  className="shrink-0 text-[var(--color-app-text)]"
                  aria-hidden="true"
                >
                  <path
                    d="M8 32V14C8 10.686 10.686 8 14 8H26C29.314 8 32 10.686 32 14V18"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                  <circle cx="8" cy="32" r="4" fill="currentColor" />
                  <circle
                    cx="20"
                    cy="8"
                    r="2.4"
                    fill="currentColor"
                    opacity="0.4"
                  />
                  <circle
                    cx="32"
                    cy="20"
                    r="4"
                    fill="currentColor"
                    opacity="0.4"
                  />
                </svg>
                Relay
              </Link>
              <nav className="hidden items-center gap-5 lg:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)] transition hover:text-[var(--color-app-text)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <Link
                href="/sign-in"
                className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-[var(--color-app-text)] px-4 py-2 text-sm font-semibold text-[var(--color-app-bg)] transition hover:bg-[var(--color-accent-hover)]"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
