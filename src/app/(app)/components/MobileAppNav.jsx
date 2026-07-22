"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Agent",
    href: "/ai-chat",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <rect x="4" y="8" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 8V5m-3 0h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="9" cy="13.5" r="1.2" fill="currentColor" />
        <circle cx="15" cy="13.5" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Brief",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.657-6.657-1.414 1.414M7.757 16.243l-1.414 1.414m0-11.314 1.414 1.414M16.243 16.243l1.414 1.414" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    label: "Inbox",
    href: "/emails",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M3 12.5V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4.5M3 12.5v5A2 2 0 0 0 5 19.5h14a2 2 0 0 0 2-2v-5M3 12.5l6.4 4.06a4 4 0 0 0 4.3 0L21 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 3v4M16 3v4M3.5 10h17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function MobileAppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile app navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-app-border)] bg-[var(--color-app-panel-strong)]/95 px-3 py-2 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-4 gap-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 rounded-[16px] px-2 py-2 text-[10px] font-medium transition active:scale-[0.97] ${
                isActive
                  ? "bg-[var(--color-app-surface-strong)] text-[var(--color-app-text)] font-semibold border border-[var(--color-app-border-strong)]"
                  : "text-[var(--color-app-text-muted)] hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
              }`}
            >
              <span>{item.icon}</span>
              <span className="uppercase tracking-[0.14em]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
