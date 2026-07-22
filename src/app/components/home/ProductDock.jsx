"use client";

import { useState } from "react";

export function ProductDock({
  heroSignals,
  commandQueue,
  heroActions,
}) {
  const [activeTab, setActiveTab] = useState("inbox"); // "inbox" | "calendar" | "agent"

  return (
    <div className="home-panel home-panel-strong home-card-hover home-dock relative overflow-hidden rounded-[32px] p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-app-border-strong)] to-transparent opacity-80" />

      {/* Header and Interactive View Selector Tabs */}
      <div className="flex flex-col gap-4 border-b border-[var(--color-app-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 rounded-full bg-[var(--color-app-text)] animate-pulse" />
          <span className="font-[family:var(--font-inter)] text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-app-text)]">
            Relay Live Preview
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("inbox")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === "inbox"
                ? "bg-[var(--color-app-text)] text-[var(--color-app-bg)] shadow-sm font-semibold"
                : "text-[var(--color-app-text-muted)] hover:text-[var(--color-app-text)]"
            }`}
          >
            Inbox Flow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === "calendar"
                ? "bg-[var(--color-app-text)] text-[var(--color-app-bg)] shadow-sm font-semibold"
                : "text-[var(--color-app-text-muted)] hover:text-[var(--color-app-text)]"
            }`}
          >
            Calendar Flow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("agent")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === "agent"
                ? "bg-[var(--color-app-text)] text-[var(--color-app-bg)] shadow-sm font-semibold"
                : "text-[var(--color-app-text-muted)] hover:text-[var(--color-app-text)]"
            }`}
          >
            AI Agent Flow
          </button>
        </div>
      </div>

      {/* Main Tab Content Display */}
      <div className="mt-5">
        {activeTab === "inbox" && (
          <div className="animate-fadeIn grid gap-5 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
            <div className="space-y-4">
              <div className="home-dock-workspace rounded-[26px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                      Relay workspace
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-app-text-muted)] sm:text-sm">
                      Inbox, schedule, and reply work in one view
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-app-text-muted)]">
                    Live sync
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {heroSignals.map((signal) => (
                    <div
                      key={signal.label}
                      className="rounded-[20px] border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] px-4 py-3"
                    >
                      <p className="font-[family:var(--font-inter)] text-2xl font-semibold leading-none text-[var(--color-app-text)]">
                        {signal.value}
                      </p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[var(--color-app-text-soft)]">
                        {signal.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="home-panel rounded-[26px] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                    Draft ready
                  </p>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]">Auto-generated</span>
                </div>
                <div className="mt-3 rounded-[20px] border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] p-4">
                  <p className="text-xs leading-6 text-[var(--color-app-text)] sm:text-sm">
                    "Thanks for the update. I can make Thursday work. I have adjusted the
                    review slot to 2:30 PM and attached the latest action list below."
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="home-dock-priority rounded-[30px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-surface-strong)] p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="home-dock-priority-kicker font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                      Priority inbox
                    </p>
                    <p className="home-dock-priority-copy mt-1 text-xs text-[var(--color-app-text-muted)] sm:text-sm">
                      Classify first, decide faster
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--color-app-chip)] border border-[var(--color-app-border)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-app-text)]">
                    3 urgent
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {commandQueue.map((item) => (
                    <div
                      key={item.title}
                      className={`home-dock-item rounded-[20px] border px-4 py-3.5 transition hover:border-[var(--color-app-border-strong)] ${
                        item.tone === "priority"
                          ? "border-[var(--color-app-border-strong)] bg-[var(--color-app-surface)]"
                          : "border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="home-dock-item-title text-xs font-semibold text-[var(--color-app-text)] sm:text-sm">
                            {item.title}
                          </p>
                          <p className="home-dock-item-body mt-1 text-xs leading-5 text-[var(--color-app-text-muted)]">
                            {item.body}
                          </p>
                        </div>
                        {item.tone === "priority" ? (
                          <span className="shrink-0 rounded-full border border-[var(--color-app-border-strong)] bg-[var(--color-app-chip)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[1px] text-[var(--color-app-text)]">
                            High
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="animate-fadeIn grid gap-5 lg:grid-cols-2">
            <div className="home-panel rounded-[26px] p-5">
              <div className="flex items-center justify-between">
                <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  Calendar Schedule
                </p>
                <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]">Google Calendar</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-[20px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-surface-strong)] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--color-app-text)]">Board Review Meeting</p>
                    <span className="rounded-full bg-[var(--color-app-chip)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--color-app-text-muted)]">Rescheduled</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-app-text-muted)]">Thursday, 2:30 PM - 3:00 PM</p>
                </div>
                <div className="rounded-[20px] border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--color-app-text)]">Vendor Pricing Sync</p>
                    <span className="text-[10px] text-[var(--color-app-text-soft)]">Pending</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-app-text-muted)]">Friday, 11:00 AM - 11:30 AM</p>
                </div>
              </div>
            </div>

            <div className="home-panel rounded-[26px] p-5">
              <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                AI Reschedule Assistant
              </p>
              <div className="mt-4 rounded-[20px] border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]">Smart Slot Proposal</p>
                <p className="mt-2 text-xs leading-5 text-[var(--color-app-text-muted)] sm:text-sm">
                  Found 2 open slots matching both participants' availability:
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-xl border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-xs">
                    <span>Thursday at 2:30 PM (Recommended)</span>
                    <span className="font-semibold text-[var(--color-app-text)]">Selected</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3 py-2 text-xs text-[var(--color-app-text-muted)]">
                    <span>Friday at 10:00 AM</span>
                    <span>Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "agent" && (
          <div className="animate-fadeIn grid gap-5 lg:grid-cols-2">
            <div className="home-panel rounded-[26px] p-5">
              <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                Agent Command Execution
              </p>
              <div className="mt-4 space-y-2.5">
                {heroActions.map((action, i) => (
                  <div
                    key={action}
                    className="flex items-center justify-between rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] px-4 py-3 text-xs text-[var(--color-app-text)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-app-chip)] text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-app-text-soft)]">Complete</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-panel rounded-[26px] p-5">
              <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                Grounded Tool Connectors
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-app-surface-strong)] text-xs font-bold">@</span>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-app-text)]">Corsair Gmail Integration</p>
                      <p className="text-[11px] text-[var(--color-app-text-soft)]">Read, search & draft messages</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--color-app-chip)] border border-[var(--color-app-border)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-app-text)]">Active</span>
                </div>
                <div className="flex items-center justify-between rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-app-surface-strong)] text-xs font-bold">📅</span>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-app-text)]">Google Calendar API</p>
                      <p className="text-[11px] text-[var(--color-app-text-soft)]">Check availability & update events</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--color-app-chip)] border border-[var(--color-app-border)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-app-text)]">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
