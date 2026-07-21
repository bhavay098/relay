import { randomUUID } from "crypto";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { conversations, chatMessages } from "../db/schema.js";

// This service is the application boundary for chat persistence: callers pass
// a user ID, and the functions below enforce that the user owns every
// conversation they read or modify.

// Builds a short conversation title from the user's first message, the same
// way ChatGPT titles a new chat. Trims to a clean word boundary instead of
// cutting mid-word.
const TITLE_MAX_LENGTH = 60;

export function titleFromMessage(message) {
  const cleaned = message.trim().replace(/\s+/g, " ");
  if (!cleaned) return "New conversation";
  if (cleaned.length <= TITLE_MAX_LENGTH) return cleaned;

  const truncated = cleaned.slice(0, TITLE_MAX_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");
  const base = lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated;
  return `${base}…`;
}

// Lists a user's conversations, newest first, for the chat sidebar.
export async function listConversations(userId) {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

// Creates a new, empty conversation. Title is filled in once the first
// message is saved (see saveMessage below).
export async function createConversation(userId) {
  const id = randomUUID();
  const [conversation] = await db
    .insert(conversations)
    .values({ id, userId, title: null })
    .returning();
  return conversation;
}

// Fetches one conversation (scoped to the owning user, so a user can never
// read another user's conversation by guessing an ID) along with its
// messages in chronological order.
export async function getConversationWithMessages(userId, conversationId) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId),
      ),
    )
    .limit(1);

  if (!conversation) return null;

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(asc(chatMessages.createdAt));

  return { conversation, messages };
}

// Verifies a conversation belongs to this user before any write. Every
// mutating function below calls this first so one user can never rename,
// delete, or post messages into another user's conversation.
async function assertOwnedConversation(userId, conversationId) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId),
      ),
    )
    .limit(1);

  if (!conversation) {
    throw new Error("Conversation not found.");
  }
  return conversation;
}

export async function renameConversation(userId, conversationId, title) {
  await assertOwnedConversation(userId, conversationId);

  // Normalize user input here so the database never stores blank titles made
  // entirely of whitespace.
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Title cannot be empty.");
  }

  const [updated] = await db
    .update(conversations)
    .set({ title: trimmed, updatedAt: new Date() })
    .where(eq(conversations.id, conversationId))
    .returning();

  return updated;
}

export async function deleteConversation(userId, conversationId) {
  await assertOwnedConversation(userId, conversationId);

  // Delete messages first since chat_messages.conversation_id references
  // conversations.id and there is no ON DELETE CASCADE in the schema.
  await db
    .delete(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId));

  // Once its dependent messages are gone, the parent row can be removed.
  await db.delete(conversations).where(eq(conversations.id, conversationId));
}

// Saves one message to a conversation. If this is the conversation's first
// message and it's from the user, also sets the auto-generated title —
// this is what makes new chats pick up a title the same way ChatGPT does,
// without a separate "generate title" step or extra LLM call.
export async function saveMessage(userId, conversationId, role, content) {
  const conversation = await assertOwnedConversation(userId, conversationId);

  const id = randomUUID();
  await db.insert(chatMessages).values({ id, conversationId, role, content });

  // Updating the parent timestamp makes a conversation move to the top of
  // the sidebar after either a user or assistant message is persisted.
  const updates = { updatedAt: new Date() };
  if (!conversation.title && role === "user") {
    // Only the initial user message gets to establish the automatic title;
    // this preserves a title that was generated or renamed previously.
    updates.title = titleFromMessage(content);
  }

  await db
    .update(conversations)
    .set(updates)
    .where(eq(conversations.id, conversationId));
}
