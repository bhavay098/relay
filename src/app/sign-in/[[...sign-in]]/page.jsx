import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "../../components/auth/AuthShell";
import { clerkAppearance } from "../../components/auth/clerkAppearance";

const highlights = [
  {
    title: "Resume quickly",
    body: "Pick up the inbox, calendar, and AI workspace where you left off.",
  },
  {
    title: "One secure login",
    body: "Use the same Clerk-backed access across all Relay surfaces.",
  },
  {
    title: "Clean handoff",
    body: "Jump straight into your dashboard after authentication.",
  },
];

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in and get back to the inbox."
      description="Relay keeps the next action close by, so you can return to email triage, calendar changes, and AI-assisted drafting without rebuilding context."
      highlights={highlights}
      panelEyebrow="Secure access"
      panelTitle="Sign in"
      panelDescription="Use your existing Relay account."
    >
      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
      />
    </AuthShell>
  );
}
