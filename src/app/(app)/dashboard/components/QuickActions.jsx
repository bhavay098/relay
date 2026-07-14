"use client";

import Link from "next/link";

export function QuickActions() {
  const actions = [
    { label: "View Emails", href: "/emails" },
    { label: "View Calendar", href: "/calendar" },
    { label: "AI Chat", href: "/ai-chat" },
  ];

  return (
    <div className="grid gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group flex items-center justify-between rounded-[20px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-4 transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface-strong)]"
        >
          <span className="text-sm font-medium text-[var(--color-app-text)]">
            {action.label}
          </span>
          <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-app-text-soft)] transition group-hover:text-[var(--color-app-accent)]">
            Open
          </span>
        </Link>
      ))}
    </div>
  );
}
