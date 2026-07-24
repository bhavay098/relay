import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "../../components/auth/AuthShell";
import { clerkAppearance } from "../../components/auth/clerkAppearance";

const highlights = [
  {
    title: "Connect once",
    body: "Link Gmail and Calendar so Relay can work from one surface.",
  },
  {
    title: "Start organized",
    body: "Set up a workspace that already knows your workflow.",
  },
  {
    title: "Move faster",
    body: "Use the inbox, schedule, and assistant together from day one.",
  },
];

export default async function SignUpPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      eyebrow="Create your workspace"
      title="Set up Relay for email and calendar work."
      description="Create your account to connect Gmail and Calendar, then keep replies, meeting updates, and AI help in one deliberate flow."
      highlights={highlights}
      panelEyebrow="Create account"
      panelTitle="Sign up"
      panelDescription="Set up your Relay account and start from one surface."
    >
      <SignUp
        appearance={clerkAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
      />
    </AuthShell>
  );
}
