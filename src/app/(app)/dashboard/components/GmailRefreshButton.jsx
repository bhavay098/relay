"use client";

import { useState } from "react";
import { useToast } from "../../../components/ToastProvider";

const GMAIL_REFRESH_ERROR = "Could not refresh Gmail right now.";

export function GmailRefreshButton({ onRefreshed }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useToast();

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
        showError(GMAIL_REFRESH_ERROR);
        return;
      }

      const msg = `Fetched ${data.count ?? 0} message${data.count === 1 ? "" : "s"} from Gmail.`;
      setStatus(msg);
      showSuccess(msg);
      onRefreshed?.();
    } catch (err) {
      console.error(err);
      setError(GMAIL_REFRESH_ERROR);
      showError(GMAIL_REFRESH_ERROR);
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
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[var(--color-app-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-app-accent-fg)] shadow-[0_18px_50px_rgba(15,23,42,0.12)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}>
          <path d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-4.9M20 15a8 8 0 01-14 4.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{loading ? "Refreshing Gmail..." : "Refresh Gmail"}</span>
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
