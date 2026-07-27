import { HomeNavbar } from "./components/home/HomeNavbar.jsx";
import { HomeHero } from "./components/home/HomeHero.jsx";
import { SectionHeading } from "./components/home/SectionHeading.jsx";
import { CardGrid } from "./components/home/CardGrid.jsx";
import { HomeCTASection } from "./components/home/HomeCTASection.jsx";
import { HomeFooter } from "./components/home/HomeFooter.jsx";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
  { label: "Infrastructure", href: "#infrastructure" },
];

const capabilities = [
  "Gmail",
  "Calendar",
  "AI drafting",
  "Summaries",
  "Scheduling",
  "Connected actions",
];

const heroSignals = [
  { value: "02", label: "connected systems" },
  { value: "1", label: "workflow surface" },
  { value: "3", label: "actions in view" },
];

const commandQueue = [
  {
    title: "Board review moved to Thursday",
    body: "Draft a response, summarize the changes, and update the calendar invite.",
    tone: "priority",
  },
  {
    title: "Vendor follow-up",
    body: "Waiting on revised pricing before reply",
    tone: "quiet",
  },
  {
    title: "Team offsite logistics",
    body: "Pull travel summary and propose two meeting slots",
    tone: "quiet",
  },
];

const heroActions = ["Read the thread", "Draft the reply", "Move the meeting"];

const workflowSteps = [
  {
    title: "Read",
    body: "See the thread context that matters without opening extra tools.",
  },
  {
    title: "Decide",
    body: "Turn the next move into a draft, a reschedule, or a summary.",
  },
  {
    title: "Act",
    body: "Send the reply, move the meeting, and keep the work moving.",
  },
];

const focusPoints = [
  {
    title: "Less switching",
    body: "Keep mail, meeting changes, and draft replies in one place.",
  },
  {
    title: "Clear next step",
    body: "Show the action before the user has to hunt for it.",
  },
  {
    title: "Fast follow-through",
    body: "Turn context into a response or reschedule with less friction.",
  },
];

const infrastructurePoints = [
  {
    title: "Clerk-authenticated access",
    body: "Every session is tied to the signed-in user before inbox or calendar actions are allowed.",
  },
  {
    title: "Corsair-backed connectors",
    body: "Relay uses Gmail and Google Calendar tooling through Corsair for grounded integrations.",
  },
  {
    title: "OpenAI Agents runtime",
    body: "The assistant can inspect mail, summarize threads, and coordinate scheduling through streaming responses.",
  },
];

const footerLinks = [
  { label: "Product", href: "#workflow" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Sign in", href: "/sign-in" },
  { label: "Sign up", href: "/sign-up" },
];

export default function Home() {
  return (
    <main className="home-page home-grid-bg gradient-mesh min-h-screen bg-[var(--color-app-bg)] text-[var(--color-app-text)]">
      <HomeNavbar navLinks={navLinks} />

      <section className="home-grid-perspective relative isolate overflow-x-hidden">
        <div className="home-spotlight" />
        <div className="home-orbit left-[8%] top-28 hidden h-32 w-32 md:block" />
        <div className="home-orbit right-[10%] top-16 hidden h-40 w-40 lg:block" />

        <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-[1320px] flex-col px-4 py-6 sm:px-6 lg:px-8">
          <HomeHero
            eyebrow="AI workspace for Gmail and Google Calendar"
            title="Relay connects your Gmail and Google Calendar with an AI assistant, in one place."
            description="Relay is a productivity app that links your Gmail inbox and Google Calendar so you can read messages, draft replies, and manage events, then use an AI chat assistant to summarize threads, draft emails, and schedule meetings on your behalf."
            primaryCta={{ label: "Start with Relay", href: "/sign-up" }}
            secondaryCta={{ label: "View dashboard", href: "/dashboard" }}
            capabilities={capabilities}
            heroSignals={heroSignals}
            commandQueue={commandQueue}
            heroActions={heroActions}
          />
        </div>
      </section>

      <section
        id="workflow"
        className="mx-auto max-w-[1320px] px-4 pt-12 pb-20 sm:px-6 lg:px-8 lg:pt-14 lg:pb-24"
      >
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Core workflow"
            title="Connect, classify, schedule, and act without leaving the same command layer."
            body="Relay is designed for work that moves between inbox context, meeting coordination, and agent-assisted execution."
            align="center"
            headingClassName="mx-auto max-w-4xl"
          />
        </div>

        <CardGrid items={workflowSteps} />
      </section>

      <section
        id="product"
        className="mx-auto max-w-[1320px] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24"
      >
        <CardGrid items={focusPoints} />
      </section>

      <section
        id="infrastructure"
        className="mx-auto max-w-[1320px] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24"
      >
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Infrastructure"
            title="A small stack with concrete pieces already wired into the app."
            body="The product uses authenticated access, real Gmail and Calendar connectors, and an AI route that can work through those integrations."
            align="center"
          />
        </div>

        <CardGrid items={infrastructurePoints} />
      </section>

      <HomeCTASection
        eyebrow="Start operating from one surface"
        title="Turn email and scheduling work into one deliberate workflow."
        primaryCta={{ label: "Create account", href: "/sign-up" }}
        secondaryCta={{ label: "View dashboard", href: "/dashboard" }}
      />

      <HomeFooter footerLinks={footerLinks} />
    </main>
  );
}
