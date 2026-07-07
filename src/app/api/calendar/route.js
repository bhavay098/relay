// GOOGLE CALENDAR ROUTES (src/app/api/calendar/route.js)
//
// GET  /api/calendar       → list events (from cache)
// POST /api/calendar       → create a new event
// PUT  /api/calendar/[id]  → update an event
// DELETE /api/calendar/[id] → delete an event
// POST /api/calendar/[id]/respond → RSVP to an event invite

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import { corsair } from "@/server/corsair.js";

function normalizeDateTimeField(value) {
  if (!value) return undefined;
  if (typeof value === "string") return { dateTime: value };
  if (typeof value === "object") return value;
  return undefined;
}

function normalizeAttendees(attendees) {
  if (!Array.isArray(attendees)) return [];
  return attendees.map((attendee) =>
    typeof attendee === "string" ? { email: attendee } : attendee,
  );
}

// GET /api/calendar — list events from local cache

export async function GET(request) {
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tenant = corsair.withTenant(userId);
    const rows = await tenant.googlecalendar.db.events.search({
      limit: 50,
    });
    const events = rows.map((row) => row.data);
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Calendar list error:", error);
    if (
      error.message?.includes("No account") ||
      error.message?.includes("credentials")
    ) {
      return NextResponse.json(
        { error: "Google Calendar not connected." },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

// POST /api/calendar — create a calendar event
// Body: { summary, description, start, end, attendees }

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

  const { summary, description, start, end, attendees } = body;
  if (!summary || !start || !end) {
    return NextResponse.json(
      { error: "Missing required fields: summary, start, end" },
      { status: 400 },
    );
  }

  try {
    const tenant = corsair.withTenant(userId);
    const event = await tenant.googlecalendar.api.events.create({
      calendarId: "primary",
      event: {
        summary,
        description: description ?? "",
        start: normalizeDateTimeField(start),
        end: normalizeDateTimeField(end),
        attendees: normalizeAttendees(attendees),
      },
    });
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Calendar create error:", error);
    if (
      error.message?.includes("No account") ||
      error.message?.includes("credentials")
    ) {
      return NextResponse.json(
        { error: "Google Calendar not connected." },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
