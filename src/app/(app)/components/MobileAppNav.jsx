"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Brief", href: "/dashboard" },
  { label: "Inbox", href: "/emails" },
  { label: "Calendar", href: "/calendar" },
  { label: "Agent", href: "/ai-chat" },
];

export function MobileAppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile app navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-app-border)] bg-[var(--color-app-panel-strong)]/95 px-3 py-2 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-4 gap-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center rounded-[16px] px-2 py-2 text-[11px] font-medium transition ${
                isActive
                  ? "bg-[var(--color-app-accent-soft)] text-[var(--color-app-accent)]"
                  : "text-[var(--color-app-text-muted)] hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
              }`}
            >
              <span className="text-[10px] uppercase tracking-[0.16em]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
