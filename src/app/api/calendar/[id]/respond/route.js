// CALENDAR RSVP ENDPOINT (src/app/api/calendar/[id]/respond/route.js)
//
// POST /api/calendar/[id]/respond — RSVP to a calendar invite
// Allows users to respond to event invitations with accept/decline/tentative

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import { corsair } from "@/server/corsair.js";

// POST /api/calendar/[id]/respond — RSVP to an event
// Body: { status: "accepted" | "declined" | "tentativelyAccepted" }

export async function POST(request, { params }) {
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

  const { status } = body;

  // Validate RSVP status
  const validStatuses = ["accepted", "declined", "tentativelyAccepted"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json(
      {
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      },
      { status: 400 },
    );
  }

  try {
    const tenant = corsair.withTenant(userId);

    // Get the event first to find the user's attendee entry
    const event = await tenant.googlecalendar.api.events.get({
      eventId: id,
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 },
      );
    }

    // Update the event with the user's RSVP status
    // Corsair will handle finding the correct attendee and updating their response
    const updatedEvent = await tenant.googlecalendar.api.events.update({
      eventId: id,
      attendeeResponse: status,
    });

    return NextResponse.json({
      success: true,
      message: `You have ${status} this event`,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Calendar RSVP error:", error);
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
      { error: "Failed to respond to event" },
      { status: 500 },
    );
  }
}
