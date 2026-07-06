// CALENDAR EVENT ROUTES (src/app/api/calendar/[id]/route.js)
//
// PUT  /api/calendar/[id]          → update a calendar event
// POST /api/calendar/[id]/respond  → RSVP to a calendar invite

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import { corsair } from "@/server/corsair.js";

// PUT /api/calendar/[id] — update a calendar event
// Body: { summary, description, start, end, attendees }
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

  const { summary, description, start, end, attendees } = body;

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

    // Build update object with only provided fields
    const updateData = {};
    if (summary) updateData.summary = summary;
    if (description) updateData.description = description;
    if (start) updateData.start = { dateTime: start };
    if (end) updateData.end = { dateTime: end };
    if (attendees) updateData.attendees = attendees.map((email) => ({ email }));

    const event = await tenant.googlecalendar.api.events.update({
      eventId: id,
      ...updateData,
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
    await tenant.googlecalendar.api.events.delete({ eventId: id });

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
