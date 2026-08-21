import { useState, useCallback } from "react";
import {
  parseSseChunk,
  actionSuccessMessage,
  CHAT_REQUEST_ERROR,
  CHAT_STREAM_ERROR,
  INITIAL_MESSAGES,
} from "../utils";
import { useToast } from "../../../components/ToastProvider";

export function useAiChat({ getActiveConversationId, onEnsureConversation, onChatFinished }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [actionSending, setActionSending] = useState(false);
  const { showSuccess, showError } = useToast();

  const loadConversationMessages = useCallback(async (conversationId) => {
    setPendingAction(null);
    setActionError("");
    setActionStatus("");
    setError("");

    if (!conversationId) {
      setMessages(INITIAL_MESSAGES);
      return;
    }

    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Load conversation error:", errorData);
        setError("Could not load that conversation.");
        return;
      }
      const data = await res.json();
      setMessages(
        (data.messages ?? []).map((m, idx) => ({
          id: m.id || `msg-${conversationId}-${idx}`,
          role: m.role,
          content: m.content,
        })),
      );
    } catch (err) {
      console.error(err);
      setError("Could not load that conversation.");
    }
  }, []);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    let conversationId = getActiveConversationId ? getActiveConversationId() : null;
    if (!conversationId && onEnsureConversation) {
      try {
        conversationId = await onEnsureConversation();
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Could not start a new conversation.",
        );
        return;
      }
    }

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;
    const nextMessages = [...messages, { id: userMsgId, role: "user", content: trimmed }];
    setMessages([...nextMessages, { id: assistantMsgId, role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setActionStatus("");
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
          conversationId,
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
        if (done) break;

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

          if (event.type === "action_draft") {
            setPendingAction(event.action);
            setActionError("");
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : CHAT_REQUEST_ERROR);
    } finally {
      setLoading(false);
      if (onChatFinished) {
        onChatFinished();
      }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await sendMessage(input);
  }

  async function confirmPendingAction() {
    if (!pendingAction || actionSending) return;

    setActionSending(true);
    setActionError("");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      let response;
      if (pendingAction.kind === "email") {
        response = await fetch("/api/gmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: pendingAction.to,
            subject: pendingAction.subject,
            body: pendingAction.body,
          }),
        });
      } else if (pendingAction.kind === "calendar_create") {
        response = await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...pendingAction, timeZone }),
        });
      } else if (pendingAction.kind === "calendar_update") {
        const { eventId, kind, ...changes } = pendingAction;
        response = await fetch(`/api/calendar/${eventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...changes, timeZone }),
        });
      } else {
        response = await fetch(`/api/calendar/${pendingAction.eventId}`, {
          method: "DELETE",
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Could not complete this action.");
      }

      const status = actionSuccessMessage(pendingAction);
      setActionStatus(status);
      showSuccess(status);
      setMessages((current) => [
        ...current,
        { id: `assistant-status-${Date.now()}`, role: "assistant", content: status },
      ]);
      setPendingAction(null);
    } catch (err) {
      console.error(err);
      const errMsg =
        err instanceof Error
          ? err.message
          : "Could not complete this action.";
      setActionError(errMsg);
      showError(errMsg);
    } finally {
      setActionSending(false);
    }
  }

  return {
    messages,
    setMessages,
    input,
    setInput,
    loading,
    error,
    setError,
    pendingAction,
    setPendingAction,
    actionError,
    setActionError,
    actionStatus,
    setActionStatus,
    actionSending,
    loadConversationMessages,
    sendMessage,
    handleSubmit,
    confirmPendingAction,
  };
}
