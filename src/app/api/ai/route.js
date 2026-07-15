// AI ROUTE
// src/app/api/ai/route.js
//
// Chat-only endpoint powered by OpenAI Agents + Corsair tools.
// The agent can call the Gmail and Google Calendar tools exposed by Corsair
// based on the user's prompt.

import { NextResponse } from "next/server";
import { Agent, run, tool } from "@openai/agents";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { corsair } from "@/server/corsair.js";
import { getAuthUserId } from "@/server/getAuthUserId.js";

function normalizeHistory(history) {
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
  return (
    message.includes("invalid_grant") ||
    message.includes("Token has been expired or revoked") ||
    message.includes("credentials")
  );
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

        const provider = new OpenAIAgentsProvider();
        const tools = await provider.build({ corsair: tenant, tool });

        // Build the agent with a runtime instruction set and available tools.
        const agent = new Agent({
          name: "relay-agent",
          model: "gpt-5.4-nano",
          // The OpenAI Agents SDK reads OPENAI_API_KEY from the environment.
          // We fail fast above so the dependency is explicit at runtime.
          instructions: `You are a helpful assistant for Gmail and Google Calendar within the Relay app.
          Your scope is strictly limited to: reading, searching, summarizing, and sending Gmail email; and viewing, creating, updating, rescheduling, or canceling Google Calendar events.
          If the user asks anything outside that scope (general knowledge, coding help, writing help unrelated to email, math, trivia, or any other topic), do not answer it. Instead, briefly say that you're focused on helping with their Gmail and Calendar, and ask what they'd like help with there.
          The app already manages OAuth and tenant-scoped tool access. Never ask the user to provide Gmail or Calendar credentials.
          Use the available Corsair tools to answer the user's request directly.
          If a tool fails because the account is not connected, say that clearly and tell the user to connect the account in the app.
          When the user asks to inspect email, summarize messages, send mail, or manage calendar events, call the relevant tool(s) instead of describing what you would do.
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
