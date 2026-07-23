// GMAIL ROUTES (src/app/api/gmail/route.js)
//
// GET  /api/gmail       → list emails (from cache)
// POST /api/gmail/send  → send an email

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import { corsair } from "@/server/corsair.js";
import {
  getMailboxLabel,
  readHydratedGmailMessages,
  sendGmailMessage,
} from "@/server/services/gmailService.js";

// GET /api/gmail — list emails from local cache

export async function GET(request) {
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
    const messages = await readHydratedGmailMessages(tenant, { label });
    return NextResponse.json({ mailbox, messages });

  } catch (error) {
    console.error("Gmail list error:", error);
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
      { error: "Failed to fetch emails" },
      { status: 500 },
    );
  }
}

// POST /api/gmail — send an email
// Body: { to, subject, body }

export async function POST(request) {
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { to, subject, body: emailBody } = body;
  if (!to || !subject || !emailBody) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, body" },
      { status: 400 },
    );
  }

  try {
    const tenant = corsair.withTenant(userId);
    const result = await sendGmailMessage(tenant, {
      to,
      subject,
      body: emailBody,
    });
    return NextResponse.json({ success: true, messageId: result.id });
  } catch (error) {
    console.error("Gmail send error:", error);
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
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
