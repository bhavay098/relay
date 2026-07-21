"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "../../components/ThemeToggle";
import { SignOutButton } from "../dashboard/components/SignOutButton";

// Maps a route to the title shown in the top bar.
const pageTitles = {
  "/dashboard": "Brief",
  "/emails": "Inbox",
  "/calendar": "Calendar",
  "/ai-chat": "Agent",
};

export function AppTopbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Relay";

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="app-topbar-shell mx-auto flex min-h-[var(--topbar-height)] max-w-[1320px] flex-wrap items-center justify-between gap-3 rounded-[24px] px-4 py-3 backdrop-blur-xl sm:px-5">
        <h1 className="shrink-0 font-[family:var(--font-inter)] text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text)]">
          {title}
        </h1>
        <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {pathname === "/dashboard" ? <SignOutButton /> : null}
        </div>
      </div>
    </header>
  );
}
