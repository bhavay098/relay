"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

function parseSseChunk(buffer, onEvent) {
  const parts = buffer.split("\n\n");
  const remainder = parts.pop() ?? "";

  for (const part of parts) {
    const line = part
      .split("\n")
      .find((candidate) => candidate.startsWith("data: "));

    if (!line) {
      continue;
    }

    try {
      onEvent(JSON.parse(line.slice(6)));
    } catch {
      // Ignore malformed chunks and keep streaming.
    }
  }

  return remainder;
}

const CHAT_REQUEST_ERROR = "Could not start the chat right now.";
const CHAT_STREAM_ERROR = "I hit an error while responding. Please try again.";

export default function AiChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask me to draft replies, summarize Gmail, or create calendar events.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const searchParams = useSearchParams();
  const autoSentRef = useRef(false);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
        }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        console.error("AI chat error response:", data);
        throw new Error(CHAT_REQUEST_ERROR);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseChunk(buffer, (event) => {
          if (event.type === "text") {
            setMessages((current) => {
              const copy = [...current];
              const lastIndex = copy.length - 1;
              if (lastIndex >= 0) {
                copy[lastIndex] = {
                  ...copy[lastIndex],
                  content: `${copy[lastIndex].content}${event.content}`,
                };
              }
              return copy;
            });
          }

          if (event.type === "error") {
            setError(CHAT_STREAM_ERROR);
            setMessages((current) => {
              const copy = [...current];
              const lastIndex = copy.length - 1;
              if (lastIndex >= 0) {
                copy[lastIndex] = {
                  ...copy[lastIndex],
                  content: "I hit an error while responding.",
                };
              }
              return copy;
            });
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : CHAT_REQUEST_ERROR);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await sendMessage(input);
  }

  // If we arrived here from the dashboard's "Ask your agent" card
  // (e.g. /ai-chat?prompt=Summarize+my+unread+emails), auto-send it once.
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !autoSentRef.current) {
      autoSentRef.current = true;
      sendMessage(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col space-y-6">
      <section className="home-panel home-panel-strong rounded-[32px] p-6 sm:p-8 lg:p-10">
        <p className="inline-flex items-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-3 py-1 font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)]">
          Relay Agent
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-balance font-[family:var(--font-inter)] text-[clamp(1.8rem,3.8vw,3rem)] font-normal leading-tight tracking-tight text-[var(--color-app-text)]">
              Ask the agent to work your inbox and calendar from one surface.
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--color-app-text-muted)]">
              Draft replies, summarize messages, or move meetings without switching context.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
            {[
              "Summarize unread mail",
              "Draft a reply",
              "Reschedule a meeting",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 text-sm text-[var(--color-app-text-muted)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="flex min-h-[min(72vh,820px)] flex-col">
          <div
            ref={scrollRef}
            className="home-panel mb-4 flex-1 space-y-4 overflow-y-auto rounded-[28px] p-5"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-[18px] px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)]"
                      : "border border-[var(--color-app-border)] bg-[var(--color-app-surface)] text-[var(--color-app-text)]"
                  } whitespace-pre-wrap`}
                >
                  {message.content ||
                    (message.role === "assistant" && loading ? "…" : " ")}
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <div className="mb-4 rounded-[18px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask the agent to check Gmail, send a reply, or create a calendar event..."
              className="min-h-14 flex-1 resize-none rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 text-sm text-[var(--color-app-text)] outline-none placeholder:text-[var(--color-app-text-soft)] focus:border-[var(--color-app-accent)]"
              rows={2}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-[18px] bg-[var(--color-app-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-app-accent-fg)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="home-panel rounded-[28px] p-5">
            <p className="font-[family:var(--font-inter)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-text-soft)]">
              Try this
            </p>
            <div className="mt-4 space-y-2">
            {[
              "Summarize my last 5 emails",
              "Draft a reply to the latest thread",
              "Move tomorrow's review to Thursday",
            ].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setInput(item)}
                  className="w-full rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-surface)] px-4 py-3 text-left text-sm text-[var(--color-app-text-muted)] transition hover:border-[var(--color-app-border-strong)] hover:text-[var(--color-app-text)]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="home-panel rounded-[28px] p-5 text-sm leading-7 text-[var(--color-app-text-muted)]">
            The agent can use your connected Gmail and Google Calendar accounts directly. It won&apos;t ask for credentials in chat.
          </div>
        </aside>
      </div>
    </div>
  );
}
