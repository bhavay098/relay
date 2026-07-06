// CLERK WEBHOOK (src/app/api/webhooks/clerk/route.ts)
//
// Clerk calls this URL whenever something happens in your Clerk account — a user signs up, updates their profile, etc.
//
// We listen for "user.created" to:
//   1. Save the new user to YOUR postgres users table
//   2. Call setupCorsair() to provision their Corsair tenant
//      (creates their gmail + googlecalendar account rows)
//
// HOW TO REGISTER THIS WEBHOOK:
//   1. Go to clerk.com → Dashboard → Webhooks
//   2. Click "Add Endpoint"
//   3. URL: https://yourdomain.com/api/webhooks/clerk
//      (for local dev use ngrok: https://abc123.ngrok.app/api/webhooks/clerk)
//   4. Subscribe to events: "user.created", "user.deleted"
//   5. Copy the "Signing Secret" → add as CLERK_WEBHOOK_SECRET in .env.local

import { Webhook } from "svix"; // Clerk uses svix to sign webhooks
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createUser } from "@/server/services/userService.js";
import { db } from "@/server/db/index.js";
import { users } from "@/server/db/schema.js";
import { eq } from "drizzle-orm";

export async function POST(request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set in .env");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );
  }

  // -------------------------------------------------------
  // Verify the webhook signature
  // This proves the request really came from Clerk,
  // not from someone trying to fake a user creation.
  // -------------------------------------------------------

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const body = await request.text();

  let event;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // -------------------------------------------------------
  // Handle events
  // -------------------------------------------------------
  const { type, data } = event;

  if (type === "user.created") {
    // Clerk gives us the user's ID and email addresses
    const clerkUserId = data.id;
    const primaryEmail = data.email_addresses?.find(
      (e) => e.id === data.primary_email_address_id,
    )?.email_address;

    if (!primaryEmail) {
      console.error("Clerk webhook: user.created missing primary email");
      return NextResponse.json(
        { error: "Missing primary email address" },
        { status: 400 },
      );
    }

    const firstName = data.first_name;
    const lastName = data.last_name;
    const name = [firstName, lastName].filter(Boolean).join(" ") || null;

    try {
      await createUser(clerkUserId, primaryEmail, name ?? undefined);
      console.log(`New user provisioned: ${clerkUserId} (${primaryEmail})`);
    } catch (error) {
      console.error("Failed to create user from Clerk webhook:", error);
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 },
      );
    }
  }

  if (type === "user.deleted") {
    // Clean up your users table when someone deletes their Clerk account
    const clerkUserId = data.id;

    try {
      await db.delete(users).where(eq(users.id, clerkUserId));
      console.log(`User deleted: ${clerkUserId}`);
      // Note: Corsair account rows are left in place (tokens become invalid anyway)
    } catch (error) {
      console.error("Failed to delete user:", error);
      return NextResponse.json(
        { error: "User deletion failed" },
        { status: 500 },
      );
    }
  }

  // Always return 200 so Clerk knows we received the event
  return NextResponse.json({ received: true });
}
