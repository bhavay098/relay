"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

// Each nav item: label shown to the user, href to route to,
// and an inline SVG icon (no icon library needed).
const navItems = [
  {
    label: "Brief",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
        <path
          d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.657-6.657-1.414 1.414M7.757 16.243l-1.414 1.414m0-11.314 1.414 1.414M16.243 16.243l1.414 1.414"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    label: "Inbox",
    href: "/emails",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
        <path
          d="M3 12.5V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4.5M3 12.5v5A2 2 0 0 0 5 19.5h14a2 2 0 0 0 2-2v-5M3 12.5l6.4 4.06a4 4 0 0 0 4.3 0L21 12.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
        <rect
          x="3.5"
          y="5"
          width="17"
          height="15.5"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M8 3v4M16 3v4M3.5 10h17"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Agent",
    href: "/ai-chat",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
        <rect
          x="4"
          y="8"
          width="16"
          height="11"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M12 8V5m-3 0h6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="9" cy="13.5" r="1.2" fill="currentColor" />
        <circle cx="15" cy="13.5" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar-shell fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col backdrop-blur-xl lg:flex">
      {/* Logo / wordmark */}
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--color-app-accent)] font-[family:var(--font-inter)] text-sm font-bold text-[var(--color-app-accent-fg)]">
          R
        </span>
        <span className="font-[family:var(--font-inter)] text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--color-app-text)]">
          Relay
        </span>
      </div>

      {/* Section label */}
      <p className="px-6 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
        Workspace
      </p>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          // Highlight the link if we're on that page (or a sub-page of it).
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[var(--color-app-accent-soft)] text-[var(--color-app-accent)]"
                  : "text-[var(--color-app-text-muted)] hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
              }`}
            >
              <span
                className={
                  isActive
                    ? "text-[var(--color-app-accent)]"
                    : "text-[var(--color-app-text-soft)] group-hover:text-[var(--color-app-text)]"
                }
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: account */}
      <div className="border-t border-[var(--color-app-border)] px-4 py-4">
        <div className="flex items-center gap-3 rounded-[14px] px-2 py-2 hover:bg-[var(--color-app-surface)]">
          <UserButton afterSignOutUrl="/sign-in" />
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-app-text-soft)] hover:text-[var(--color-app-text)]"
          >
            Back to site
          </Link>
        </div>
      </div>
    </aside>
  );
}
