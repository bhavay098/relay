// AI ROUTE
// src/app/api/ai/route.js
//
// Chat-only endpoint powered by OpenAI Agents + Corsair tools.
// The agent can call the Gmail and Google Calendar tools exposed by Corsair
// based on the user's prompt.

import { NextResponse } from "next/server";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { corsair } from "@/server/corsair.js";
import { getAuthUserId } from "@/server/getAuthUserId.js";

function normalizeHistory(history) {
  // Convert the client chat transcript into the exact input shape expected
  // by the OpenAI Agents SDK, while discarding malformed or empty entries.
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0,
    )
    .map((item) => ({
      role: item.role,
      content: [
        {
          type: item.role === "assistant" ? "output_text" : "input_text",
          text: item.content,
        },
      ],
    }));
}

function requestedServices(message) {
  const text = message.toLowerCase();

  // Match actual intent phrases, not bare words. The previous version
  // matched on words like "message" or "mail" alone, which fired on
  // completely unrelated sentences (e.g. "can you message me back")
  // and incorrectly told users to reconnect Gmail even when it was
  // already connected.
  const gmailIntent =
    /\b(my|the)\s+(gmail|email|inbox|mail)\b/.test(text) ||
    /\b(check|read|open|show|summarize|search|find|reply to|send|draft)\b.{0,20}\b(email|emails|gmail|inbox|mail)\b/.test(
      text,
    );

  const calendarIntent =
    /\b(my|the)\s+(calendar|schedule)\b/.test(text) ||
    /\b(check|show|create|schedule|book|move|reschedule|cancel|update)\b.{0,20}\b(calendar|event|events|meeting|meetings)\b/.test(
      text,
    );

  return {
    gmail: gmailIntent,
    googlecalendar: calendarIntent,
  };
}

function isGoogleGrantError(error) {
  const message = `${error?.message ?? ""} ${error?.cause?.message ?? ""}`;
  // Google OAuth tokens can expire or be revoked after the user disconnects
  // the account, so we treat those failures as a reconnectable auth issue.
  return (
    message.includes("invalid_grant") ||
    message.includes("Token has been expired or revoked") ||
    message.includes("credentials")
  );
}

function toCachedMessages(rows, limit) {
  // Reduce the cached Gmail rows to the small subset of fields the UI and
  // agent need, instead of exposing the full provider payload.
  const messages = [];
  for (const row of rows) {
    const message = row.data;
    if (message.payload || message.subject || message.snippet) {
      messages.push({
        id: message.id,
        from: message.from ?? "",
        subject: message.subject ?? "(no subject)",
        snippet: message.snippet ?? "",
        date: message.internalDate ?? "",
      });
    }
    if (messages.length === limit) break;
  }
  return messages;
}

function actionDraft(action) {
  // Tag the tool result so the streaming loop can recognize it as a
  // user-reviewable action instead of a normal assistant response.
  return JSON.stringify({ type: "action_draft", action });
}

function parseActionDraft(output) {
  // The tool returns a JSON string, so safely decode it before forwarding
  // the draft to the client approval UI.
  if (typeof output !== "string") return null;

  try {
    const data = JSON.parse(output);
    return data?.type === "action_draft" && data.action ? data.action : null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  // The agent runtime depends on an OpenAI API key being present.
  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set" },
      { status: 500 },
    );
  }

  const userId = await getAuthUserId(request);

  // Reject requests that are not associated with an authenticated user.
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse the request body defensively so malformed JSON gets a clear error.
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message } = body;

  // The endpoint expects a single chat message to seed the agent run.
  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const history = normalizeHistory(body.history);
  const input = [
    ...history,
    { role: "user", content: [{ type: "input_text", text: message ?? "" }] },
  ];

  const wants = requestedServices(message);

  // Stream the response as Server-Sent Events so the client can render tokens
  // incrementally instead of waiting for the full agent response.
  const stream = new ReadableStream({
    async start(controller) {
      // Helper for emitting one SSE event at a time.
      const send = (data) => {
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        // Scope all tool access to the current tenant/user.
        const tenant = corsair.withTenant(userId);

        const connectionStatus = await corsair.manage.connectionStatus.get({
          tenantId: userId,
        });

        const gmailConnected = connectionStatus.gmail === "connected";
        const calendarConnected =
          connectionStatus.googlecalendar === "connected";

        if (wants.gmail && !gmailConnected) {
          send({
            type: "error",
            content:
              "Gmail is not connected for this account. Connect Gmail in the app, then try again.",
          });
          return;
        }

        if (wants.googlecalendar && !calendarConnected) {
          send({
            type: "error",
            content:
              "Google Calendar is not connected for this account. Connect Google Calendar in the app, then try again.",
          });
          return;
        }

        const searchCachedEmailsTool = tool({
          name: "search_cached_emails",
          description:
            "Search the user's locally cached Gmail messages. This never calls Gmail's live API.",
          parameters: z.object({
            limit: z.number().int().min(1).max(20).default(5),
          }),
          strict: true,
          async execute({ limit }) {
            const rows = await tenant.gmail.db.messages.search({ limit: 50 });
            return JSON.stringify(toCachedMessages(rows, limit));
          },
        });
        const listCachedCalendarTool = tool({
          name: "list_cached_calendar_events",
          description:
            "List the user's locally cached Google Calendar events. This never calls Google Calendar's live API.",
          parameters: z.object({
            limit: z.number().int().min(1).max(20).default(10),
          }),
          strict: true,
          async execute({ limit }) {
            const rows = await tenant.googlecalendar.db.events.search({
              limit,
            });
            return JSON.stringify(rows.map((row) => row.data));
          },
        });
        const prepareEmailDraftTool = tool({
          name: "prepare_email_draft",
          description:
            "Prepare an editable email draft for user review. This never sends email. Use this whenever the user asks to send or draft an email.",
          parameters: z.object({
            to: z.string().min(3).describe("Recipient email address"),
            subject: z.string().min(1).describe("Concise email subject"),
            body: z.string().min(1).describe("Plain-text email body"),
          }),
          strict: true,
          async execute({ to, subject, body: emailBody }) {
            return actionDraft({
              kind: "email",
              to,
              subject,
              body: emailBody,
            });
          },
        });
        const prepareCalendarCreateTool = tool({
          name: "prepare_calendar_create",
          description:
            "Prepare a calendar event for user review. This never creates an event. Use this whenever the user asks to create or schedule an event.",
          parameters: z.object({
            summary: z.string().min(1),
            description: z.string().default(""),
            start: z.string().min(1).describe("ISO 8601 start date-time"),
            end: z.string().min(1).describe("ISO 8601 end date-time"),
            attendees: z.array(z.string()).default([]),
          }),
          strict: true,
          async execute({ summary, description, start, end, attendees }) {
            return actionDraft({
              kind: "calendar_create",
              summary,
              description,
              start,
              end,
              attendees,
            });
          },
        });
        const prepareCalendarUpdateTool = tool({
          name: "prepare_calendar_update",
          description:
            "Prepare an update to a calendar event for user review. This never changes an event. Use an event ID returned by list_cached_calendar_events.",
          parameters: z.object({
            eventId: z.string().min(1),
            summary: z.string().optional(),
            description: z.string().optional(),
            start: z.string().optional().describe("ISO 8601 start date-time"),
            end: z.string().optional().describe("ISO 8601 end date-time"),
            attendees: z.array(z.string()).optional(),
          }),
          strict: true,
          async execute({ eventId, ...changes }) {
            return actionDraft({
              kind: "calendar_update",
              eventId,
              ...changes,
            });
          },
        });
        const prepareCalendarDeleteTool = tool({
          name: "prepare_calendar_delete",
          description:
            "Prepare deletion of a calendar event for user review. This never deletes an event. Use an event ID returned by list_cached_calendar_events.",
          parameters: z.object({
            eventId: z.string().min(1),
            summary: z.string().optional(),
          }),
          strict: true,
          async execute({ eventId, summary }) {
            return actionDraft({ kind: "calendar_delete", eventId, summary });
          },
        });
        const tools = [
          searchCachedEmailsTool,
          listCachedCalendarTool,
          prepareEmailDraftTool,
          prepareCalendarCreateTool,
          prepareCalendarUpdateTool,
          prepareCalendarDeleteTool,
        ];

        // Only expose read-only cache tools and "prepare" tools here. The
        // client is the approval boundary that actually performs send/create/
        // update/delete after the user confirms the draft.
        const agent = new Agent({
          name: "relay-agent",
          model: "gpt-5.4-mini",
          // The OpenAI Agents SDK reads OPENAI_API_KEY from the environment.
          // We fail fast above so the dependency is explicit at runtime.
          instructions: `You are a helpful assistant for Gmail and Google Calendar within the Relay app.
          Your scope is strictly limited to: reading, searching, summarizing, and sending Gmail email; and viewing, creating, updating, rescheduling, or canceling Google Calendar events.
          If the user asks anything outside that scope (general knowledge, coding help, writing help unrelated to email, math, trivia, or any other topic), do not answer it. Instead, briefly say that you're focused on helping with their Gmail and Calendar, and ask what they'd like help with there.
          The app already manages OAuth and tenant-scoped tool access. Never ask the user to provide Gmail or Calendar credentials.
          Use the available tools to answer the user's request directly.
          If a tool fails because the account is not connected, say that clearly and tell the user to connect the account in the app.
          Email, calendar creation, calendar updates, and calendar deletion are sensitive actions. Always call the corresponding prepare tool instead of performing the action. The app will show the user a review card and only execute after they explicitly confirm with its button.
          For calendar creates and updates, the review card is editable, so include the meeting details in the draft and let the user adjust the title, time, description, and attendees before confirming.
          Never treat a chat message such as "yes" or "send it" as permission to perform a sensitive action. Never claim that a sensitive action was completed when it was only prepared.
          When the user asks to inspect email, summarize messages, or view calendar events, call the relevant read-only cache tool instead of describing what you would do.
          For every response, use markdown structure to improve readability. Prefer a short title or lead sentence, then bullets or numbered steps for details. Use paragraphs only when they help readability.
          When listing emails, use a clean plain-text format with one email per line, include sender, subject, and a short snippet, and no markdown syntax.
          For general answers, prefer markdown formatting when it improves readability: use short headings, bullet points, numbered steps, tables only when they add clarity, and fenced code blocks for code or structured examples.
          Be concise and confirm the actions you took.
          Today's date is ${new Date().toISOString().split("T")[0]}.`,
          tools,
        });

        const result = await run(agent, input, { stream: true });

        // Walk the full event stream instead of only toTextStream().
        // toTextStream() silently drops tool_call_item / tool_call_output_item
        // events, which means tool failures (e.g. a Gmail API call that
        // errors or returns nothing) were previously invisible on the
        // server - only the model's own apology ever reached the logs.
        // Logging tool calls and their outputs here lets us see the real
        // cause the next time a tool call fails or returns empty.
        for await (const event of result) {
          if (event.type === "raw_model_stream_event") {
            // Only forward actual assistant text deltas. Other raw events
            // (e.g. response.function_call_arguments.delta) also carry a
            // .delta field, but that's the tool's raw JSON arguments, not
            // text meant for the chat - forwarding it would leak partial
            // tool-call JSON into the user's message bubble.
            if (
              event.data?.type === "output_text_delta" &&
              typeof event.data.delta === "string"
            ) {
              send({ type: "text", content: event.data.delta });
            }
            continue;
          }

          if (event.type === "run_item_stream_event") {
            if (event.item?.type === "tool_call_item") {
              // Log the exact tool name and arguments so a failed or odd call
              // can be debugged from the server logs without guessing.
              console.log(
                "AI chat tool call:",
                event.item.rawItem?.name ?? "unknown",
                JSON.stringify(event.item.rawItem?.arguments ?? {}),
              );
            }

            if (event.item?.type === "tool_call_output_item") {
              const output = event.item.output;
              const outputText =
                typeof output === "string" ? output : JSON.stringify(output);

              // A failed or empty tool call is exactly the situation the
              // user hit: the model gets back nothing useful and has to
              // narrate an apology. Logging the raw output here is what
              // makes that diagnosable instead of a mystery.
              console.log(
                "AI chat tool output:",
                outputText?.slice(0, 500) ?? "(empty)",
              );

              const draft = parseActionDraft(outputText);
              if (draft) {
                // This is the handoff point between the model and the UI:
                // we emit a structured draft so the client can render an
                // editable review card and wait for explicit confirmation.
                send({ type: "action_draft", action: draft });
              }

              if (!outputText || outputText === "null" || outputText === "{}") {
                console.warn(
                  "AI chat tool call returned an empty/unexpected result - check Corsair connection/token health for this tenant.",
                );
              }
            }
          }
        }

        // Signal that the stream completed successfully.
        send({ type: "done" });
      } catch (error) {
        // Log server-side details, but keep the client payload safe.
        console.error("AI chat stream error:", error);
        if (isGoogleGrantError(error)) {
          send({
            type: "error",
            content:
              "Google Calendar or Gmail access has expired or been revoked. Reconnect the account in the app, then try again.",
          });
          return;
        }
        send({
          type: "error",
          content: "I hit an error while responding. Please try again.",
        });
      } finally {
        // Close the stream in all cases so the client can finish cleanly.
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
