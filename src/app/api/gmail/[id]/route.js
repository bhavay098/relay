// GET /api/gmail/[id] — fetch a single email by Gmail message ID (from the local DB cache)

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import { corsair } from "@/server/corsair.js";
import {
  readHydratedGmailMessagesById,
  extractEmailContent,
} from "@/server/services/gmailService.js";

export async function GET(request, { params }) {
  const userId = await getAuthUserId();

  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const tenant = corsair.withTenant(userId);
    const [message] = await readHydratedGmailMessagesById(tenant, [id]);

    if (!message) {
      return NextResponse.json(
        { error: "Message not found in local cache. Try refreshing your inbox." },
        { status: 404 },
      );
    }

    const { html, text, body } = extractEmailContent(message);

    return NextResponse.json({
      message: {
        ...message,
        html,
        text,
        body: body || message.body || text,
      },
    });

  } catch (error) {
    console.error("Gmail get message error:", error);

    return NextResponse.json(
      { error: "Failed to fetch email" },
      { status: 500 },
    );
  }
}