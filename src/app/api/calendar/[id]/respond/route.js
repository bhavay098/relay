// CALENDAR RSVP ENDPOINT (src/app/api/calendar/[id]/respond/route.js)
//
// POST /api/calendar/[id]/respond — RSVP to a calendar invite
// Allows users to respond to event invitations with accept/decline/tentative

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { corsair } from "@/server/corsair.js";
import { getAuthUserId } from "@/server/getAuthUserId.js";

// POST /api/calendar/[id]/respond — RSVP to an event
// Body: { status: "accepted" | "declined" | "tentativelyAccepted" | "tentative" }

const VALID_STATUSES = [
  "accepted",
  "declined",
  "tentativelyAccepted",
  "tentative",
];

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
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      {
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  try {
    const tenant = corsair.withTenant(userId);
    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.emailAddresses?.find(
      (email) => email.id === clerkUser?.primaryEmailAddressId,
    )?.emailAddress;

    const event = await tenant.googlecalendar.api.events.get({
      calendarId: "primary",
      id,
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 },
      );
    }

    const attendeeStatus =
      status === "tentativelyAccepted" ? "tentative" : status;
    const attendees = Array.isArray(event.attendees) ? [...event.attendees] : [];
    const selfAttendeeIndex = attendees.findIndex(
      (attendee) => attendee?.self === true,
    );
    const emailAttendeeIndex =
      selfAttendeeIndex === -1 && primaryEmail
        ? attendees.findIndex((attendee) => attendee?.email === primaryEmail)
        : selfAttendeeIndex;

    if (emailAttendeeIndex === -1) {
      return NextResponse.json(
        { error: "Unable to determine your attendee record for this event" },
        { status: 400 },
      );
    }

    attendees[emailAttendeeIndex] = {
      ...attendees[emailAttendeeIndex],
      responseStatus: attendeeStatus,
    };

    const updatedEvent = await tenant.googlecalendar.api.events.update({
      calendarId: "primary",
      id,
      event: {
        ...event,
        attendees,
      },
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
