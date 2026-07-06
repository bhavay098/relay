// SIGN-IN PAGE

// The [[...sign-in]] folder name is required by Clerk — don't rename it.
// Clerk's <SignIn /> component handles everything:
//   - Email + password form
//   - "Sign in with Google" button
//   - Password reset flow
//   - Error messages
// You don't need to build any of this yourself.

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <SignIn routing="path" path="/sign-in" forceRedirectUrl="/dashboard" />
    </main>
  );
}
