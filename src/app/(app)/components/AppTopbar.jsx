"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "../../components/ThemeToggle";
import { SignOutButton } from "../dashboard/components/SignOutButton";

const pageTitles = {
  "/dashboard": "Brief Overview",
  "/emails": "Inbox Operations",
  "/calendar": "Calendar Schedule",
  "/ai-chat": "AI Agent Command",
};

export function AppTopbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Relay Workspace";

  return (
    <header className="sticky top-0 z-30 px-4 pt-3 sm:px-6 lg:px-8">
      <div className="app-topbar-shell mx-auto flex min-h-[var(--topbar-height)] max-w-[1320px] items-center justify-between gap-3 rounded-[24px] px-4 py-2.5 backdrop-blur-xl sm:px-5">
        <h1 className="min-w-0 truncate font-[family:var(--font-inter)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text)] sm:text-sm sm:tracking-[0.18em]">
          {title}
        </h1>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {pathname === "/dashboard" ? <SignOutButton /> : null}
        </div>
      </div>
    </header>
  );
}
