"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
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
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar-shell fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col backdrop-blur-xl lg:flex">
      {/* Logo / Wordmark */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--color-app-border)]">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--color-app-text)] font-[family:var(--font-inter)] text-xs font-bold text-[var(--color-app-bg)] shadow-sm">
            R
          </span>
          <span className="font-[family:var(--font-inter)] text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--color-app-text)]">
            Relay
          </span>
        </Link>
        <span className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]">
          v1.0
        </span>
      </div>

      {/* Navigation section */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
          Workspace
        </p>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-[var(--color-app-surface-strong)] text-[var(--color-app-text)] border border-[var(--color-app-border-strong)] shadow-sm"
                    : "text-[var(--color-app-text-muted)] hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
                }`}
              >
                <span
                  className={
                    isActive
                      ? "text-[var(--color-app-text)]"
                      : "text-[var(--color-app-text-soft)] group-hover:text-[var(--color-app-text)]"
                  }
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick shortcuts / help trigger */}
      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "?", bubbles: true })
            );
          }}
          className="flex w-full items-center justify-between rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-2 text-left text-xs font-medium text-[var(--color-app-text-muted)] transition hover:border-[var(--color-app-border-strong)] hover:text-[var(--color-app-text)]"
        >
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" />
            </svg>
            <span>Shortcuts</span>
          </span>
          <kbd className="rounded border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-1.5 py-0.5 font-[family:var(--font-mono)] text-[10px]">
            ?
          </kbd>
        </button>
      </div>

      {/* Account Profile Bottom Bar */}
      <div className="border-t border-[var(--color-app-border)] p-3">
        <div className="flex items-center justify-between rounded-[16px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <UserButton afterSignOutUrl="/sign-in" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[var(--color-app-text)]">Account</span>
              <Link
                href="/"
                className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-app-text-soft)] hover:text-[var(--color-app-text)] transition"
              >
                Home site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
