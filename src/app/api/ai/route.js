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

  // Convert the user message into the shape expected by the Agents SDK.
  const input = [{ role: "user", content: message ?? "" }];

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
        const provider = new OpenAIAgentsProvider();
        const tools = await provider.build({ corsair: tenant, tool });

        // Build the agent with a runtime instruction set and available tools.
        const agent = new Agent({
          name: "relay-agent",
          model: "gpt-4o-mini",
          // The OpenAI Agents SDK reads OPENAI_API_KEY from the environment.
          // We fail fast above so the dependency is explicit at runtime.
          instructions: `You are a helpful assistant for Gmail and Google Calendar.
          Use the available Corsair tools to answer the user's request directly.
          When the user asks to inspect email, summarize messages, send mail, or manage calendar events, call the relevant tool(s) instead of describing what you would do.
          Be concise and confirm the actions you took.
          Today's date is ${new Date().toISOString().split("T")[0]}.`,
          tools,
        });

        const result = await run(agent, input, { stream: true });

        // Forward streamed text chunks to the client as they arrive.
        for await (const chunk of result.toTextStream()) {
          send({ type: "text", content: chunk });
        }

        // Signal that the stream completed successfully.
        send({ type: "done" });
      } catch (error) {
        // Log server-side details, but keep the client payload safe.
        console.error("AI chat stream error:", error);
        send({
          type: "error",
          content:
            process.env.NODE_ENV === "development"
              ? error instanceof Error
                ? error.message
                : String(error)
              : "AI chat failed",
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
