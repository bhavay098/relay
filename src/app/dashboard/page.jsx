// DASHBOARD PAGE
// src/app/dashboard/page.jsx

import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { ConnectButtons } from "./components/ConnectButtons";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { GmailRefreshButton } from "./components/GmailRefreshButton";
import { CalendarRefreshButton } from "./components/CalendarRefreshButton";
import { QuickActions } from "./components/QuickActions";
import { SignOutButton } from "./components/SignOutButton";

const dashboardSignals = [
  { value: "2", label: "core integrations" },
  { value: "3", label: "action lanes" },
  { value: "1", label: "signed-in workspace" },
];

const workflowNotes = [
  {
    title: "Connection health",
    body: "Check whether Gmail and Calendar are available before pulling new work into Relay.",
  },
  {
    title: "Fresh sync",
    body: "Refresh mail and event data from one surface instead of bouncing between tools.",
  },
  {
    title: "Next move",
    body: "Jump directly into email, calendar, or AI chat once the workspace is ready.",
  },
];

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <main className="home-grid-bg gradient-mesh min-h-screen bg-[var(--color-app-bg)] text-[var(--color-app-text)]">
      <header className="sticky top-3 z-50 px-4 pt-4 sm:top-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="home-glass rounded-[24px] px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center justify-between gap-4">
                <Link
                  href="/"
                  className="font-[family:var(--font-inter)] text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--color-app-text)]"
                >
                  Relay
                </Link>
                <nav className="hidden items-center gap-5 lg:flex">
                  <Link
                    href="/"
                    className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)] transition hover:text-[var(--color-app-text)]"
                  >
                    Home
                  </Link>
                  <Link
                    href="/dashboard"
                    className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]"
                  >
                    Dashboard
                  </Link>
                </nav>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <SignOutButton />
                <div className="home-panel rounded-full px-3 py-1.5">
                  <UserButton afterSignOutUrl="/sign-in" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="home-grid-perspective relative isolate overflow-hidden px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
        <div className="home-spotlight" />
        <div className="home-orbit left-[6%] top-24 hidden h-32 w-32 md:block" />
        <div className="home-orbit right-[8%] top-16 hidden h-40 w-40 lg:block" />

        <div className="mx-auto grid w-full max-w-[1320px] gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <section className="space-y-6">
            <div className="animate-fadeInUp home-panel home-panel-strong rounded-[34px] p-6 sm:p-7">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-2xl">
                  <p className="inline-flex items-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
                    Active workspace
                  </p>
                  <p className="mt-5 max-w-2xl text-[16px] leading-8 text-[var(--color-app-text-muted)] sm:text-[17px]">
                    Welcome back, {user.firstName || "there"}. This workspace keeps
                    connection health, fresh sync, and next actions in one deliberate
                    command layer.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[320px]">
                  {dashboardSignals.map((signal) => (
                    <div
                      key={signal.label}
                      className="rounded-[22px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-4"
                    >
                      <p className="font-[family:var(--font-inter)] text-3xl font-semibold leading-none text-[var(--color-app-text)]">
                        {signal.value}
                      </p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--color-app-text-soft)]">
                        {signal.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 max-w-5xl">
                <h1 className="text-balance font-[family:var(--font-inter)] text-[clamp(2rem,3.6vw,3.1rem)] font-normal leading-[1.02] tracking-[-0.04em] text-[var(--color-app-text)]">
                  Move through inbox and calendar work without leaving Relay.
                </h1>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[28px] border border-[var(--color-app-border)] bg-[linear-gradient(180deg,rgba(217,119,6,0.12),rgba(16,21,33,0.96))] p-5">
                  <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                    Workspace identity
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-[22px] border border-[var(--color-app-border)] bg-[var(--color-app-surface-soft)] p-4">
                      <p className="text-sm text-[var(--color-app-text-soft)]">
                        Signed in as
                      </p>
                      <p className="mt-1 text-base font-medium text-[var(--color-app-text)]">
                        {user.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {workflowNotes.map((item) => (
                    <div
                      key={item.title}
                      className="home-panel rounded-[24px] px-4 py-4"
                    >
                      <p className="text-sm font-medium text-[var(--color-app-text)]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-7 text-[var(--color-app-text-muted)]">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
              <section className="home-panel rounded-[30px] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                      Integration health
                    </p>
                    <h2 className="mt-2 text-2xl font-medium tracking-tight text-[var(--color-app-text)]">
                      Connected services
                    </h2>
                  </div>
                  <span className="rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 text-[11px] text-[var(--color-app-text-muted)]">
                    Live check
                  </span>
                </div>

                <div className="mt-6">
                  <ConnectionStatus />
                </div>

                <div className="mt-6">
                  <ConnectButtons />
                </div>
              </section>

              <section className="home-panel rounded-[30px] p-5 sm:p-6">
                <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  Next actions
                </p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-[var(--color-app-text)]">
                  Open the right lane
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-app-text-muted)]">
                  Route into the mailbox, calendar, or AI workspace once your
                  connections are in place.
                </p>

                <div className="mt-6">
                  <QuickActions />
                </div>
              </section>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="home-panel home-panel-strong rounded-[30px] p-5 sm:p-6">
              <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                Inbox sync
              </p>
              <h2 className="mt-2 text-2xl font-medium tracking-tight text-[var(--color-app-text)]">
                Refresh Gmail
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-app-text-muted)]">
                Pull the latest message data into Relay before triage, drafting,
                or follow-up work.
              </p>
              <div className="mt-6">
                <GmailRefreshButton />
              </div>
            </section>

            <section className="home-panel home-panel-strong rounded-[30px] p-5 sm:p-6">
              <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                Schedule sync
              </p>
              <h2 className="mt-2 text-2xl font-medium tracking-tight text-[var(--color-app-text)]">
                Refresh Calendar
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-app-text-muted)]">
                Update event state so reschedules, summaries, and meeting moves
                start from current data.
              </p>
              <div className="mt-6">
                <CalendarRefreshButton />
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
