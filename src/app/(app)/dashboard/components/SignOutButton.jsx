"use client";

import { useClerk } from "@clerk/nextjs";

export function SignOutButton() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/sign-in" })}
      className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]"
    >
      Sign out
    </button>
  );
}
