export function ProductDock({
  heroSignals,
  commandQueue,
  heroActions,
}) {
  return (
    <div className="home-panel home-panel-strong home-card-hover home-dock relative overflow-hidden rounded-[32px] p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-app-accent)] to-transparent opacity-60" />
      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
        <div className="space-y-4">
          <div className="home-dock-workspace rounded-[26px] border border-[var(--color-app-border)] bg-[linear-gradient(180deg,rgba(217,119,6,0.12),rgba(16,21,33,0.96))] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  Relay workspace
                </p>
                <p className="mt-1 text-sm text-[var(--color-app-text-muted)]">
                  Inbox, schedule, and reply work in one view
                </p>
              </div>
              <span className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 text-[11px] text-[var(--color-app-text-muted)]">
                Live sync
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {heroSignals.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-[20px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3"
                >
                  <p className="font-[family:var(--font-inter)] text-2xl font-semibold leading-none text-[var(--color-app-text)]">
                    {signal.value}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--color-app-text-soft)]">
                    {signal.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="home-panel rounded-[26px] p-4">
            <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
              Draft ready
            </p>
            <div className="mt-4 rounded-[20px] border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] p-4">
              <p className="text-sm leading-7 text-[var(--color-app-text)]">
                Thanks for the update. I can make Thursday work. I have adjusted the
                review slot to 2:30 PM and attached the latest action list below.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="home-dock-priority rounded-[30px] border border-[var(--color-app-border-strong)] bg-[linear-gradient(180deg,rgba(16,21,33,0.94),rgba(10,13,20,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="home-dock-priority-kicker font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  Priority inbox
                </p>
                <p className="home-dock-priority-copy mt-1 text-sm text-[var(--color-app-text-muted)]">
                  Classify first, decide faster
                </p>
              </div>
              <span className="text-[11px] text-[var(--color-app-accent)]">
                3 urgent
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {commandQueue.map((item) => (
                <div
                  key={item.title}
                  className={`home-dock-item rounded-[20px] border px-4 py-4 ${
                    item.tone === "priority"
                      ? "border-[var(--color-app-border-strong)] bg-[var(--color-app-surface-strong)]"
                      : "border-[var(--color-app-border)] bg-[var(--color-app-surface)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="home-dock-item-title text-sm font-medium text-[var(--color-app-text)]">
                        {item.title}
                      </p>
                      <p className="home-dock-item-body mt-1 text-xs leading-5 text-[var(--color-app-text-muted)]">
                        {item.body}
                      </p>
                    </div>
                    {item.tone === "priority" ? (
                      <span className="rounded-md bg-[var(--color-app-accent-soft)] px-2 py-1 text-[10px] uppercase tracking-[1px] text-[var(--color-app-accent)]">
                        High
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="home-panel home-dock-subcard rounded-[26px] p-4">
              <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                Calendar control
              </p>
              <div className="mt-4 rounded-[20px] border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] p-4">
                <p className="text-sm font-medium text-[var(--color-app-text)]">
                  Review rescheduled
                </p>
                <p className="mt-1 text-xs text-[var(--color-app-text-muted)]">
                  Thu 2:30 PM - 3:00 PM
                </p>
              </div>
            </div>

            <div className="home-panel home-dock-subcard rounded-[26px] p-4">
              <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                Agent actions
              </p>
              <div className="mt-4 space-y-2.5">
                {heroActions.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] px-3 py-2.5 text-xs text-[var(--color-app-text-muted)]"
                  >
                    <span className="h-2 w-2 rounded-full bg-[var(--color-app-accent)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
