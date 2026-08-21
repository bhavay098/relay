// WEBHOOK ROUTE (src/app/api/webhook/route.js)
//
// Single endpoint that handles ALL incoming webhooks.
// Corsair automatically figures out which plugin sent it,
// verifies the signature, updates the cache, and runs your hooks.
//
// URL: POST /api/webhook?tenantId=user_abc
//
// You'll register this URL in Google Cloud Console
// under "Push Notifications" for Gmail & Calendar.

import { processWebhook } from "corsair";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { corsair } from "@/server/corsair.js";

function verifySignature(rawBody, signature, secret) {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    const sigClean = signature.replace(/^sha256=/, "");
    const sigBuffer = Buffer.from(sigClean, "utf8");
    const expBuffer = Buffer.from(expectedSignature, "utf8");
    return (
      sigBuffer.length === expBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expBuffer)
    );
  } catch {
    return false;
  }
}

export async function POST(request) {
  const webhookSecret = process.env.WEBHOOK_SECRET || process.env.CORSAIR_WEBHOOK_SECRET;

  // Convert Next.js headers to a plain object (Corsair needs this format)
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Read raw body first for HMAC verification and parsing
  const rawBody = await request.text();

  // Verify provider signature if a webhook secret is configured
  if (webhookSecret) {
    const signature =
      request.headers.get("x-webhook-signature") ||
      request.headers.get("x-hub-signature-256") ||
      request.headers.get("x-signature-256");

    if (!signature || !verifySignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }
  }

  // Parse the request body
  let body;
  if (request.headers.get("content-type")?.includes("application/json")) {
    try {
      body = JSON.parse(rawBody || "{}");
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
  } else {
    body = rawBody;
  }

  // In multi-tenant mode, the tenantId tells Corsair which user this webhook is for.
  // You set this when registering the webhook URL (e.g. /api/webhook?tenantId=user_abc)
  const tenantId = new URL(request.url).searchParams.get("tenantId") ?? undefined;

  try {
    // processWebhook does all the work:
    //   1. Identifies which plugin (gmail / googlecalendar)
    //   2. Updates your local DB cache
    //   3. Runs your custom hooks
    const result = await processWebhook(corsair, headers, body, { tenantId });

    if (!result.response) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    console.info("Plugin processed:", result.plugin, result.action);

    return NextResponse.json(result.response);
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

