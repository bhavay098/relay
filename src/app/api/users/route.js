// USER SIGNUP ROUTE (src/app/api/users/route.js)
//
// POST /api/users
// Creates a new user and provisions their Corsair tenant.
// Body: { userId, email, name }

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createUser } from "@/server/services/userService.js";

export async function POST(request) {
  const { userId: sessionUserId } = await auth();

  if (!sessionUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, email, name } = body;

  if (!userId || !email) {
    return NextResponse.json(
      { error: "Missing required fields: userId, email" },
      { status: 400 },
    );
  }

  if (userId !== sessionUserId) {
    return NextResponse.json(
      { error: "Cannot create a user for a different account" },
      { status: 403 },
    );
  }

  try {
    await createUser(userId, email, name);
    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
