// GET /api/connections — check which services the user has connected
// Returns: { connections: { gmail: true, googlecalendar: false } }

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

export async function GET() {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const connectionStatus = await corsair.manage.connectionStatus.get({
      tenantId: userId,
    });

    return NextResponse.json({
      connections: {
        gmail: connectionStatus.gmail === "connected",
        googlecalendar: connectionStatus.googlecalendar === "connected",
      },
      issues: {},
    });
  } catch (error) {
    console.error("Connection status error:", error);

    if (isGoogleGrantError(error)) {
      return NextResponse.json({
        connections: {
          gmail: false,
          googlecalendar: false,
        },
        issues: {
          googlecalendar:
            "Google Calendar access has expired or been revoked. Reconnect Google Calendar.",
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to check connections" },
      { status: 500 },
    );
  }
}
