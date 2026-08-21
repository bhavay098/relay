"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";

const CONNECTIONS_ERROR = "Could not load connection status right now.";

export function ConnectionStatus() {
  const [status, setStatus] = useState(null);
  const [issues, setIssues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function checkConnections() {
      try {
        const data = await apiFetch("/api/connections", { signal: controller.signal });
        setStatus(data.connections);
        setIssues(data.issues ?? null);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(CONNECTIONS_ERROR);
      } finally {
        setLoading(false);
      }
    }

    checkConnections();
    return () => controller.abort();
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
      issue: issues?.gmail,
    },
    {
      label: "Google Calendar",
      connected: Boolean(status?.googlecalendar),
      issue: issues?.googlecalendar,
    },
  ];

  return (
    <section className="home-panel flex flex-col justify-between rounded-[28px] p-4 sm:p-6">
      <div>
        <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
          Health
        </p>
        <h3 className="mt-1 text-lg font-medium tracking-tight text-[var(--color-app-text)]">
          Integration status
        </h3>
        <p className="mt-1 text-xs text-[var(--color-app-text-muted)]">
          Monitors active OAuth tokens and sync health
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {services.map((svc) => (
          <div
            key={svc.label}
            className="flex items-center justify-between rounded-[16px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  svc.connected
                    ? "bg-[var(--color-success)] shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                    : "bg-[var(--color-error)] shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                }`}
              />
              <span className="text-sm font-medium text-[var(--color-app-text)]">
                {svc.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold ${
                  svc.connected
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-error)]"
                }`}
              >
                {svc.connected ? "Active" : "Disconnected"}
              </span>
              {svc.issue ? (
                <span
                  title={svc.issue}
                  className="rounded-full bg-[rgba(239,68,68,0.12)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-error)]"
                >
                  {svc.issue}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
