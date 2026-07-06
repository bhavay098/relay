// POST /api/gmail/refresh — force a live fetch from Gmail API

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import { corsair } from "@/server/corsair.js";

export async function POST(request) {
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tenant = corsair.withTenant(userId);
    const result = await tenant.gmail.api.messages.list({});
    const messages = result.messages ?? [];
    return NextResponse.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Gmail refresh error:", error);
    if (
      error.message?.includes("No account") ||
      error.message?.includes("credentials")
    ) {
      return NextResponse.json(
        { error: "Gmail not connected." },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Failed to refresh emails" },
      { status: 500 },
    );
  }
}
