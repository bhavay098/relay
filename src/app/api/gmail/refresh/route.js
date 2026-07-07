// POST /api/gmail/refresh — trigger a Gmail sync then read from local DB
//
// Corsair automatically syncs message data (body, subject, from, to, etc.)
// into corsair_entities whenever an API call or webhook flows through it.
// Reading from tenant.gmail.db.messages.search() hits your local DB —
// zero extra API calls, no rate limits, body already included.

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import { corsair } from "@/server/corsair.js";

export async function POST(request) {
  const userId = await getAuthUserId();

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tenant = corsair.withTenant(userId);

    // Trigger a live fetch so Corsair syncs the latest messages into the DB.
    // This single API call updates corsair_entities for every returned message.
    await tenant.gmail.api.messages.list({});

    // Read all synced messages from local DB — body, subject, from, to are
    // already populated by Corsair. No per-message API call needed.
    const rows = await tenant.gmail.db.messages.search({ limit: 50 });

    // Each row: { id, entity_id, entity_type, data: { id, threadId, snippet, body, subject, from, to, ... } }
    const messages = rows.map((row) => row.data);

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
