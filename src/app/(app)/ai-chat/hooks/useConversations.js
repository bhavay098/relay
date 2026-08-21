import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../../lib/api";

export function useConversations({ onSelectConversation, onError }) {
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const sortedConversations = useMemo(() => {
    return conversations.toSorted(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  }, [conversations]);

  async function loadConversations(signal) {
    try {
      const data = await apiFetch("/api/conversations", { signal });
      setConversations(data.conversations ?? []);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Load conversations error:", err);
    } finally {
      setConversationsLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadConversations(controller.signal);
    return () => controller.abort();
  }, []);

  async function openConversation(conversationId) {
    setActiveConversationId(conversationId);
    if (onSelectConversation) {
      await onSelectConversation(conversationId);
    }
  }

  async function startNewConversation() {
    try {
      const data = await apiFetch("/api/conversations", { method: "POST" });
      setConversations((current) => [data.conversation, ...current]);
      setActiveConversationId(data.conversation.id);
      return data.conversation.id;
    } catch (err) {
      throw new Error(err.data?.error ?? "Could not start a new conversation.");
    }
  }

  async function handleDeleteConversation(conversationId, event) {
    event.stopPropagation();
    if (!window.confirm("Delete this conversation? This cannot be undone.")) {
      return;
    }

    try {
      await apiFetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
      setConversations((current) =>
        current.filter((c) => c.id !== conversationId),
      );
      if (activeConversationId === conversationId) {
        openConversation(null);
      }
    } catch (err) {
      console.error(err);
      if (onError) {
        onError(
          err.data?.error || (err instanceof Error ? err.message : "Could not delete this conversation."),
        );
      }
    }
  }

  function startRenaming(conversation, event) {
    event.stopPropagation();
    setRenamingId(conversation.id);
    setRenameValue(conversation.title ?? "");
  }

  async function submitRename(conversationId) {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;

    try {
      const data = await apiFetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      setConversations((current) =>
        current.map((c) => (c.id === conversationId ? data.conversation : c)),
      );
    } catch (err) {
      console.error(err);
      if (onError) {
        onError(
          err.data?.error || (err instanceof Error ? err.message : "Could not rename this conversation."),
        );
      }
    }
  }

  return {
    conversations,
    sortedConversations,
    conversationsLoading,
    activeConversationId,
    setActiveConversationId,
    sidebarOpen,
    setSidebarOpen,
    renamingId,
    setRenamingId,
    renameValue,
    setRenameValue,
    loadConversations: () => loadConversations(),
    openConversation,
    startNewConversation,
    handleDeleteConversation,
    startRenaming,
    submitRename,
  };
}
