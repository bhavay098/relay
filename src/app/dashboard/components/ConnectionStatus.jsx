"use client";

import { useEffect, useState } from "react";

export function ConnectionStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkConnections() {
      try {
        const res = await fetch("/api/connections");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to check connections");
          return;
        }

        setStatus(data.connections);
      } catch (err) {
        setError("Failed to check connections");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    checkConnections();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Checking connections...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Status</h3>
      <div className="flex gap-8">
        <div>
          <strong>Gmail:</strong>{" "}
          <span className={status?.gmail ? "text-green-600" : "text-gray-400"}>
            {status?.gmail ? "✓ Connected" : "○ Not Connected"}
          </span>
        </div>
        <div>
          <strong>Google Calendar:</strong>{" "}
          <span
            className={
              status?.googlecalendar ? "text-green-600" : "text-gray-400"
            }
          >
            {status?.googlecalendar ? "✓ Connected" : "○ Not Connected"}
          </span>
        </div>
      </div>
    </div>
  );
}
