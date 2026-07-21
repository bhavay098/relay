// GET  /api/conversations — list the current user's conversations for the sidebar
// POST /api/conversations — start a new, empty conversation

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import {
  listConversations,
  createConversation,
} from "@/server/services/chatService.js";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await listConversations(userId);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("List conversations error:", error);
    return NextResponse.json(
      { error: "Failed to load conversations" },
      { status: 500 },
    );
  }
}

export async function POST() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversation = await createConversation(userId);
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
