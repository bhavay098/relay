// GET /api/gmail/[id] — fetch a single email by Gmail message ID

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import { corsair } from "@/server/corsair.js";

export async function GET(request, { params }) {
  const userId = await getAuthUserId();

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const tenant = corsair.withTenant(userId);
    const message = await tenant.gmail.api.messages.get({ id });

    return NextResponse.json({ message });

  } catch (error) {
    console.error("Gmail get message error:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch email" },
      { status: 500 },
    );
  }
}
