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

const DEFAULT_TIME_ZONE = "UTC";

function normalizeTimeZone(value) {
  if (typeof value !== "string" || !value.trim()) return DEFAULT_TIME_ZONE;

  const timeZone = value.trim();
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function normalizeDateTimeField(value, timeZone) {
  if (!value) return undefined;
  const field =
    typeof value === "string"
      ? { dateTime: value }
      : typeof value === "object"
        ? { ...value }
        : undefined;

  // Google Calendar requires a named timezone when an event's date-time does
  // not include an offset. Adding it consistently also preserves the user's
  // intended local time for drafts created by the AI.
  if (field?.dateTime && !field.timeZone) {
    field.timeZone = timeZone;
  }

  if (field) return field;
  return undefined;
}

function normalizeAttendees(attendees) {
  if (!Array.isArray(attendees)) return [];
  return attendees.map((attendee) =>
    typeof attendee === "string" ? { email: attendee } : attendee,
  );
}

// GET /api/calendar — refresh the local cache from Google, then list events.
// This keeps the calendar page current after an event is created through the
// agent, which writes to Google Calendar directly.

export async function GET(request) {
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
// Body: { summary, description, start, end, attendees, timeZone }

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

  const { summary, description, start, end, attendees, timeZone } = body;
  if (!summary || !start || !end) {
    return NextResponse.json(
      { error: "Missing required fields: summary, start, end" },
      { status: 400 },
    );
  }

  try {
    const tenant = corsair.withTenant(userId);
    const eventTimeZone = normalizeTimeZone(timeZone);
    const event = await tenant.googlecalendar.api.events.create({
      calendarId: "primary",
      event: {
        summary,
        description: description ?? "",
        start: normalizeDateTimeField(start, eventTimeZone),
        end: normalizeDateTimeField(end, eventTimeZone),
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
