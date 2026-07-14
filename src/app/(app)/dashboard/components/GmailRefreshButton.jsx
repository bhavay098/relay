"use client";

import { useState } from "react";

const GMAIL_REFRESH_ERROR = "Could not refresh Gmail right now.";

export function GmailRefreshButton({ onRefreshed }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function refreshGmail() {
    setLoading(true);
    setStatus(null);
    setError(null);

    try {
      const res = await fetch("/api/gmail/refresh", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Gmail refresh error response:", data);
        setError(GMAIL_REFRESH_ERROR);
        return;
      }

      setStatus(
        `Fetched ${data.count ?? 0} message${data.count === 1 ? "" : "s"}.`,
      );
      onRefreshed?.();
    } catch (err) {
      console.error(err);
      setError(GMAIL_REFRESH_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={refreshGmail}
        disabled={loading}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-[18px] bg-[var(--color-app-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-app-accent-fg)] shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Refreshing Gmail..." : "Refresh Gmail"}
      </button>

      <div className="min-h-5 text-sm">
        {status ? (
          <p className="text-[var(--color-success)]">{status}</p>
        ) : null}
        {error ? <p className="text-[var(--color-error)]">{error}</p> : null}
      </div>
    </div>
  );
}
