"use client";

export function EmptyState({ onRefresh, refreshing, mailbox }) {
  const isSent = mailbox === "sent";

  return <div className="home-panel flex flex-col items-center gap-3 rounded-[28px] px-6 py-16 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[var(--color-app-text-soft)]"><path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" /><rect x="3" y="5" width="18" height="14" rx="2.5" /></svg></div><p className="text-sm text-[var(--color-app-text-muted)]">{isSent ? "No sent messages are in the local cache yet." : "No emails are in the local cache yet. That usually means Gmail hasn&apos;t been provisioned or refreshed for this account."}</p><button type="button" onClick={onRefresh} disabled={refreshing} className="mt-1 inline-flex items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-4 py-2 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)] disabled:cursor-not-allowed disabled:opacity-50">{refreshing ? "Refreshing…" : isSent ? "Load sent messages" : "Load your inbox"}</button></div>;
}
