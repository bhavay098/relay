// POST /api/gmail/refresh — populate the local Gmail cache on demand.

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import { corsair } from "@/server/corsair.js";

const MAX_SYNCED_MESSAGES = 20;
const HYDRATION_CONCURRENCY = 5;

async function hydrateMessages(tenant, messageIds) {
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < messageIds.length) {
      const id = messageIds[nextIndex++];
      await tenant.gmail.api.messages.get({ id });
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(HYDRATION_CONCURRENCY, messageIds.length) },
      worker,
    ),
  );
}

export async function POST(request) {
  const userId = await getAuthUserId();

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tenant = corsair.withTenant(userId);

    // Gmail's list endpoint only returns IDs. Fetching each returned ID once
    // stores the subject, sender, snippet, and body in Corsair's local cache.
    //
    // We intentionally do not restrict this to the INBOX label because some
    // connected accounts may have mail archived or categorized elsewhere.
    // The inbox page is cache-driven, so we want the refresh step to populate
    // a useful recent-mail slice even when INBOX is empty.
    const list = await tenant.gmail.api.messages.list({
      maxResults: MAX_SYNCED_MESSAGES,
    });
    const messageIds = (list.messages ?? [])
      .map((message) => message.id)
      .filter(Boolean);

    await hydrateMessages(tenant, messageIds);

    const rows = await tenant.gmail.db.messages.search({
      limit: MAX_SYNCED_MESSAGES,
    });
    const messages = [];
    for (const row of rows) {
      const message = row.data;
      if (message.payload || message.subject || message.snippet) {
        messages.push(message);
      }
    }

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
