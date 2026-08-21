// POST /api/gmail/refresh — populate the local Gmail cache on demand.

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import { corsair } from "@/server/corsair.js";
import {
  getMailboxLabel,
  readHydratedGmailMessagesById,
} from "@/server/services/gmailService.js";

const MAX_SYNCED_MESSAGES = 20;
const HYDRATION_CONCURRENCY = 5;

async function hydrateMessages(tenant, messageIds) {
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < messageIds.length) {
      const id = messageIds[nextIndex++];
      // Explicit `full` avoids Gmail's id-only/minimal response and makes
      // Corsair write the payload, subject, sender, and snippet to row.data.
      await tenant.gmail.api.messages.get({ id, format: "full" });
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
    const mailbox = new URL(request.url).searchParams.get("mailbox") ?? "inbox";
    const label = getMailboxLabel(mailbox);
    if (!label) {
      return NextResponse.json({ error: "Unknown mailbox." }, { status: 400 });
    }

    const tenant = corsair.withTenant(userId);

    // messages.list only saves id/threadId reference rows. Fetch every listed
    // ID in full, then read those exact hydrated entities back from Corsair's
    // database. A broad search({ limit }) can otherwise select old reference
    // rows in an unspecified database order.
    const list = await tenant.gmail.api.messages.list({
      maxResults: MAX_SYNCED_MESSAGES,
      labelIds: [label],
    });

    const messageIds = [];
    for (const message of list.messages ?? []) {
      if (message.id) {
        messageIds.push(message.id);
      }
    }

    await hydrateMessages(tenant, messageIds);

    const messages = await readHydratedGmailMessagesById(tenant, messageIds);

    return NextResponse.json({
      success: true,
      mailbox,
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
