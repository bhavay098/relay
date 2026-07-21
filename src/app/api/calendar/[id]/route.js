// CALENDAR EVENT ROUTES (src/app/api/calendar/[id]/route.js)
//
// PUT  /api/calendar/[id]          → update a calendar event
// POST /api/calendar/[id]/respond  → RSVP to a calendar invite

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

// PUT /api/calendar/[id] — update a calendar event
// Body: { summary, description, start, end, attendees, timeZone }
// Any field can be omitted to leave unchanged

export async function PUT(request, { params }) {
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { summary, description, start, end, attendees, timeZone } = body;

  // At least one field must be provided to update
  if (!summary && !description && !start && !end && !attendees) {
    return NextResponse.json(
      {
        error:
          "Provide at least one field to update: summary, description, start, end, or attendees",
      },
      { status: 400 },
    );
  }

  try {
    const tenant = corsair.withTenant(userId);
    const eventTimeZone = normalizeTimeZone(timeZone);

    const eventData = {};
    if (summary) eventData.summary = summary;
    if (description) eventData.description = description;
    if (start) eventData.start = normalizeDateTimeField(start, eventTimeZone);
    if (end) eventData.end = normalizeDateTimeField(end, eventTimeZone);
    if (attendees) eventData.attendees = normalizeAttendees(attendees);

    const event = await tenant.googlecalendar.api.events.update({
      calendarId: "primary",
      id,
      event: eventData,
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Calendar update error:", error);
    if (
      error.message?.includes("No account") ||
      error.message?.includes("credentials")
    ) {
      return NextResponse.json(
        { error: "Google Calendar not connected." },
        { status: 401 },
      );
    }
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

// DELETE /api/calendar/[id] — delete a calendar event

export async function DELETE(request, { params }) {
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const tenant = corsair.withTenant(userId);
    await tenant.googlecalendar.api.events.delete({
      calendarId: "primary",
      id,
    });

    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("Calendar delete error:", error);
    if (
      error.message?.includes("No account") ||
      error.message?.includes("credentials")
    ) {
      return NextResponse.json(
        { error: "Google Calendar not connected." },
        { status: 401 },
      );
    }
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
