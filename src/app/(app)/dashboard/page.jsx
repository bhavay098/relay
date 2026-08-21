import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { ConnectButtons } from "./components/ConnectButtons";
import { LiveWorkspace } from "./components/LiveWorkspace";
import { AgentPromptCard } from "./components/AgentPromptCard";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1320px] space-y-5 overflow-x-clip sm:space-y-6">
      {/* Hero Welcome Header with Live Status & Quick Launcher */}
      <section className="animate-fadeInUp home-panel home-panel-strong w-full max-w-full overflow-hidden rounded-[28px] p-5 sm:rounded-[32px] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-app-accent)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span>Relay Mission Control</span>
            </div>

            <h2 className="mt-4 text-balance font-[family:var(--font-inter)] text-[clamp(1.6rem,5vw,2.8rem)] font-medium leading-[1.1] tracking-[-0.03em] text-[var(--color-app-text)]">
              Welcome back, {user.firstName || "there"}.
            </h2>
            <p className="mt-3 text-[14.5px] leading-7 text-[var(--color-app-text-muted)] sm:text-[15.5px]">
              Unified command workspace for your inbox, calendar, and agent-assisted follow-through.
            </p>

            {/* Quick Action Shortcuts */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link
                href="/emails"
                className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3.5 py-2 text-xs font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface-soft)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
                  <path d="M3 12.5V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4.5M3 12.5v5A2 2 0 0 0 5 19.5h14a2 2 0 0 0 2-2v-5M3 12.5l6.4 4.06a4 4 0 0 0 4.3 0L21 12.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Inbox</span>
              </Link>

              <Link
                href="/calendar"
                className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3.5 py-2 text-xs font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface-soft)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
                  <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
                  <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
                </svg>
                <span>Schedule</span>
              </Link>

              <Link
                href="/ai-chat"
                className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-3.5 py-2 text-xs font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface-soft)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
                  <rect x="4" y="8" width="16" height="11" rx="3" />
                  <path d="M12 8V5m-3 0h6" strokeLinecap="round" />
                </svg>
                <span>Ask AI Agent</span>
              </Link>
            </div>
          </div>

          {/* Metric Status Cards */}
          <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[440px]">
            {[
              {
                label: "Inbox",
                status: "Live Sync",
                detail: "Threads cached locally",
                href: "/emails",
                dotColor: "bg-emerald-400",
              },
              {
                label: "Calendar",
                status: "Connected",
                detail: "Week schedule active",
                href: "/calendar",
                dotColor: "bg-blue-400",
              },
              {
                label: "AI Studio",
                status: "Ready",
                detail: "Drafts & actions on deck",
                href: "/ai-chat",
                dotColor: "bg-violet-400",
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group min-w-0 overflow-hidden rounded-[22px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] p-4 transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface-soft)]"
              >
                <div className="flex items-center justify-between">
                  <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-app-text-soft)]">
                    {item.label}
                  </p>
                  <span className={`h-2 w-2 rounded-full ${item.dotColor}`} />
                </div>
                <p className="mt-2.5 text-base font-semibold tracking-tight text-[var(--color-app-text)] group-hover:text-[var(--color-app-accent)] transition">
                  {item.status}
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-[var(--color-app-text-muted)]">
                  {item.detail}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid: AI Prompts + Previews | Integration status */}
      <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="min-w-0 space-y-5 sm:space-y-6">
          <AgentPromptCard />
          <LiveWorkspace />
        </div>

        <div className="min-w-0 space-y-5 sm:space-y-6">
          <section className="home-panel home-panel-strong w-full max-w-full overflow-hidden rounded-[28px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  Integration health
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-[var(--color-app-text)]">
                  Connected services
                </h3>
              </div>
            </div>
            <div className="mt-5">
              <ConnectionStatus />
            </div>
            <div className="mt-5">
              <ConnectButtons />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
