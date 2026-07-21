// GET    /api/conversations/[id] — fetch one conversation with its messages
// PATCH  /api/conversations/[id] — rename a conversation
// DELETE /api/conversations/[id] — delete a conversation and its messages

import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/getAuthUserId.js";
import {
  getConversationWithMessages,
  renameConversation,
  deleteConversation,
} from "@/server/services/chatService.js";

export async function GET(request, { params }) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await getConversationWithMessages(userId, id);
    if (!result) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Get conversation error:", error);
    return NextResponse.json(
      { error: "Failed to load conversation" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  try {
    const conversation = await renameConversation(userId, id, body.title);
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Rename conversation error:", error);
    const status = error.message === "Conversation not found." ? 404 : 500;
    return NextResponse.json(
      {
        error: status === 404 ? error.message : "Failed to rename conversation",
      },
      { status },
    );
  }
}

export async function DELETE(request, { params }) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteConversation(userId, id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    const status = error.message === "Conversation not found." ? 404 : 500;
    return NextResponse.json(
      {
        error: status === 404 ? error.message : "Failed to delete conversation",
      },
      { status },
    );
  }
}
