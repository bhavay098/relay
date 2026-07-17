import { currentUser } from "@clerk/nextjs/server";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { ConnectButtons } from "./components/ConnectButtons";
import { LiveWorkspace } from "./components/LiveWorkspace";
import { AgentPromptCard } from "./components/AgentPromptCard";
import { QuickActions } from "./components/QuickActions";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="mx-auto max-w-[1320px] space-y-6">
      <section className="animate-fadeInUp home-panel home-panel-strong rounded-[32px] p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
              Today&apos;s brief
            </p>
            <h2 className="mt-4 text-balance font-[family:var(--font-inter)] text-[clamp(1.8rem,3.8vw,3rem)] font-normal leading-[1.04] tracking-[-0.04em] text-[var(--color-app-text)]">
              Welcome back, {user.firstName || "there"}.
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--color-app-text-muted)]">
              One workspace for inbox context, calendar movement, and agent-assisted follow-through.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:min-w-[420px]">
              {[
                { label: "Inbox", value: "Live", body: "Recent mail and thread context" },
                { label: "Calendar", value: "Ready", body: "Upcoming events and changes" },
                { label: "Agent", value: "On deck", body: "Drafts and follow-up actions" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-4"
                >
                  <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                    {item.label}
                  </p>
                  <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--color-app-text)]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-app-text-muted)]">
                    {item.body}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <AgentPromptCard />
          <LiveWorkspace />
        </div>

        <div className="space-y-6">
          <section className="home-panel home-panel-strong rounded-[28px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  Integration health
                </p>
                <h3 className="mt-1 text-lg font-medium tracking-tight text-[var(--color-app-text)]">
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

          <section className="home-panel rounded-[28px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                  Shortcuts
                </p>
                <h3 className="mt-1 text-lg font-medium tracking-tight text-[var(--color-app-text)]">
                  Jump to a surface
                </h3>
              </div>
            </div>
            <div className="mt-5">
              <QuickActions />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
