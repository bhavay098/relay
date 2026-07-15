// POST /api/calendar/refresh — force a live fetch from Google Calendar
//
// Corsair syncs Google Calendar event data into corsair_entities when a live
// API call runs. We use events.getMany() to populate the local cache, then read
// the normalized rows from tenant.googlecalendar.db.events.

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import { corsair } from "@/server/corsair.js";

function isGoogleGrantError(error) {
  const message = `${error?.message ?? ""} ${error?.cause?.message ?? ""}`;
  return (
    message.includes("invalid_grant") ||
    message.includes("Token has been expired or revoked") ||
    message.includes("credentials")
  );
}

export async function POST(request) {
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tenant = corsair.withTenant(userId);
    await tenant.googlecalendar.api.events.getMany({
      calendarId: "primary",
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });

    const rows = await tenant.googlecalendar.db.events.search({
      limit: 50,
    });
    const events = rows.map((row) => row.data);

    return NextResponse.json({ success: true, count: events.length, events });
  } catch (error) {
    console.error("Calendar refresh error:", error);
    if (isGoogleGrantError(error)) {
      return NextResponse.json(
        {
          error:
            "Google Calendar access has expired or been revoked. Reconnect Google Calendar and try again.",
        },
        { status: 401 },
      );
    }

    if (error.message?.includes("No account")) {
      return NextResponse.json(
        { error: "Google Calendar not connected." },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Failed to refresh calendar" },
      { status: 500 },
    );
  }
}
