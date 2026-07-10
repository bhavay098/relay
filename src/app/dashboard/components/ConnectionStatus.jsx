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
    return (
      <div className="rounded-[22px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-4 text-sm text-[var(--color-app-text-muted)]">
        Checking connections...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[22px] border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.08)] px-4 py-4 text-sm text-[var(--color-error)]">
        {error}
      </div>
    );
  }

  const services = [
    {
      label: "Gmail",
      connected: Boolean(status?.gmail),
    },
    {
      label: "Google Calendar",
      connected: Boolean(status?.googlecalendar),
    },
  ];

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.label}
            className="rounded-[22px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-app-text-soft)]">
              {service.label}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  service.connected
                    ? "bg-[var(--color-success)]"
                    : "bg-[var(--color-app-border-strong)]"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  service.connected
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-app-text-muted)]"
                }`}
              >
                {service.connected ? "Connected" : "Not connected"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm leading-7 text-[var(--color-app-text-muted)]">
        Relay checks whether the core inbox and calendar connectors are ready
        before you move into sync or action flows.
      </p>
    </div>
  );
}
