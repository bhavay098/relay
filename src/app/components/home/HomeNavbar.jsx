"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";

export function HomeNavbar({ navLinks }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-3 z-50 px-4 sm:top-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="animate-fadeInDown home-glass home-navbar-shell rounded-[24px] px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Desktop Nav */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2.5 font-[family:var(--font-inter)] text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--color-app-text)] transition hover:opacity-90"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-app-text)] text-xs font-bold text-[var(--color-app-bg)] shadow-sm">
                  R
                </span>
                Relay
              </Link>
              <nav className="hidden items-center gap-6 lg:flex">
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

            {/* Right actions (Desktop & Theme Toggle) */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              <div className="hidden items-center gap-3 lg:flex">
                <Link
                  href="/sign-in"
                  className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-xs font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] active:scale-[0.98]"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-full bg-[var(--color-app-text)] px-4 py-2 text-xs font-semibold text-[var(--color-app-bg)] transition hover:opacity-90 active:scale-[0.98]"
                >
                  Get started
                </Link>
              </div>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] text-[var(--color-app-text)] transition hover:bg-[var(--color-app-surface)] lg:hidden"
              >
                {mobileMenuOpen ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer Dropdown */}
          {mobileMenuOpen && (
            <div className="animate-fadeIn mt-3 flex flex-col gap-3 border-t border-[var(--color-app-border)] pt-3 lg:hidden">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-muted)] transition hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-app-border)]">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2.5 text-xs font-medium text-[var(--color-app-text)] transition hover:bg-[var(--color-app-surface)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-full bg-[var(--color-app-text)] px-4 py-2.5 text-xs font-semibold text-[var(--color-app-bg)] transition hover:opacity-90"
                >
                  Get started
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
