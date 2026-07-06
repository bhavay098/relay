// SIGN-UP PAGE

// Same idea as sign-in — [[...sign-up]] folder name is required.
// Clerk's <SignUp /> handles the whole registration flow.

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <SignUp routing="path" path="/sign-up" forceRedirectUrl="/dashboard" />
    </main>
  );
}
