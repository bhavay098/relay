"use client";

import { useState } from "react";

export function GmailRefreshButton() {
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
        setError(data.error ?? "Failed to refresh Gmail");
        return;
      }

      setStatus(`Fetched ${data.count ?? 0} message${data.count === 1 ? "" : "s"}.`);
    } catch (err) {
      setError("Failed to refresh Gmail");
      console.error(err);
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
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Refreshing Gmail..." : "Refresh Gmail"}
      </button>

      <div className="text-sm min-h-5">
        {status && <p className="text-green-600">{status}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
}
