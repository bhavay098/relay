import Link from "next/link";

// Grouped into columns so the footer reads as a real site footer
// rather than a single row of chips. Feel free to add/remove links
// per column — the layout adapts automatically.
const defaultColumns = [
  {
    heading: "Product",
    links: [
      { label: "Workflow", href: "#workflow" },
      { label: "Infrastructure", href: "#infrastructure" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", href: "/sign-in" },
      { label: "Sign up", href: "/sign-up" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function HomeFooter({ footerLinks, columns = defaultColumns }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-app-border)]">
      <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          {/* Brand blurb */}
          <div className="max-w-sm">
            <p className="font-[family:var(--font-inter)] text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-app-text)]">
              Relay
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-app-text-muted)]">
              Gmail, Calendar, and AI drafting coordinated through one focused
              workspace.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:flex sm:gap-16">
            {columns.map((col) => (
              <div key={col.heading}>
                <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  {col.heading}
                </p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--color-app-text-muted)] transition hover:text-[var(--color-app-text)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--color-app-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--color-app-text-soft)]">
            © {year} Relay. All rights reserved.
          </p>
          {footerLinks ? (
            <div className="flex flex-wrap gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-[var(--color-app-text-soft)] transition hover:text-[var(--color-app-text)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
