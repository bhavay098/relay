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
import { corsair } from "@/server/corsair.js";

export async function POST(request) {
  // Convert Next.js headers to a plain object (Corsair needs this format)
  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Parse the request body
  const body = request.headers.get("content-type")?.includes("application/json")
    ? await request.json()
    : await request.text();

  // In multi-tenant mode, the tenantId tells Corsair which user this webhook is for.
  // You set this when registering the webhook URL (e.g. /api/webhook?tenantId=user_abc)
  const tenantId = new URL(request.url).searchParams.get("tenantId") ?? undefined;

  try {
    // processWebhook does all the work:
    //   1. Identifies which plugin (gmail / googlecalendar)
    //   2. Verifies the signature (rejects spoofed requests)
    //   3. Updates your local DB cache
    //   4. Runs your custom hooks (defined below in corsair.ts)
    const result = await processWebhook(corsair, headers, body, { tenantId });

    if (!result.response) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    console.info("Plugin processed:", result.plugin, result.action)

    return NextResponse.json(result.response);
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
