import Link from "next/link";

export function HomeFooter({ footerLinks }) {
  return (
    <footer className="border-t border-[var(--color-app-border)]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-sm">
          <p className="font-[family:var(--font-inter)] text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text)]">
            Relay
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--color-app-text-muted)]">
            Gmail, Calendar, and AI drafting coordinated through one focused workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm text-[var(--color-app-text-muted)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
