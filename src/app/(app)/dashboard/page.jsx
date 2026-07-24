import { currentUser } from "@clerk/nextjs/server";
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
      <section className="animate-fadeInUp home-panel home-panel-strong w-full max-w-full overflow-hidden rounded-[28px] p-4 sm:rounded-[32px] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <h2 className="text-balance font-[family:var(--font-inter)] text-[clamp(1.55rem,7vw,3rem)] font-normal leading-[1.08] tracking-[-0.04em] text-[var(--color-app-text)]">
              Welcome back, {user.firstName || "there"}.
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--color-app-text-muted)]">
              One workspace for inbox context, calendar movement, and agent-assisted follow-through.
            </p>
          </div>

          <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[420px] xl:grid-cols-3">
              {[
                { label: "Inbox", value: "Live", body: "Recent mail and thread context" },
                { label: "Calendar", value: "Ready", body: "Upcoming events and changes" },
                { label: "Agent", value: "On deck", body: "Drafts and follow-up actions" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 overflow-hidden rounded-[22px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-4"
                >
                  <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
                    {item.label}
                  </p>
                  <p className="mt-3 text-lg font-semibold tracking-tight text-[var(--color-app-text)]">
                    {item.value}
                  </p>
                  <p className="mt-2 break-words text-xs leading-5 text-[var(--color-app-text-muted)]">
                    {item.body}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0 space-y-5 sm:space-y-6">
          <AgentPromptCard />
          <LiveWorkspace />
        </div>

        <div className="min-w-0 space-y-5 sm:space-y-6">
          <section className="home-panel home-panel-strong w-full max-w-full overflow-hidden rounded-[28px] p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
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
        </div>
      </div>
    </div>
  );
}
