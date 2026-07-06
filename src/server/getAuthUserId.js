// AUTH HELPER (src/server/getAuthUserId.js)
//
// Gets the userId from the Clerk session.
// Import and use this in every API route instead of calling auth() directly.

import { auth } from "@clerk/nextjs/server";

export async function getAuthUserId() {
  const { userId } = await auth();
  return userId ?? null;
}
