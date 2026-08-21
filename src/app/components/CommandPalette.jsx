"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";
import { CommandPaletteItem } from "./CommandPaletteItem";
import { CommandPaletteFooter } from "./CommandPaletteFooter";

function getNavigationCommands(router, toggleTheme, onClose, onOpenShortcuts) {
  return [
    {
      id: "nav-inbox",
      category: "Navigation",
      title: "Go to Inbox",
      subtitle: "View and manage email threads",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
          <path d="M3 12.5V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4.5M3 12.5v5A2 2 0 0 0 5 19.5h14a2 2 0 0 0 2-2v-5M3 12.5l6.4 4.06a4 4 0 0 0 4.3 0L21 12.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      shortcut: "G I",
      action: () => router.push("/emails"),
    },
    {
      id: "nav-calendar",
      category: "Navigation",
      title: "Go to Calendar",
      subtitle: "View upcoming events and schedule",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
        </svg>
      ),
      shortcut: "G C",
      action: () => router.push("/calendar"),
    },
    {
      id: "nav-agent",
      category: "Navigation",
      title: "Go to AI Agent Studio",
      subtitle: "Chat with AI to draft replies and move meetings",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
          <rect x="4" y="8" width="16" height="11" rx="3" />
          <path d="M12 8V5m-3 0h6" strokeLinecap="round" />
          <circle cx="9" cy="13.5" r="1.2" fill="currentColor" />
          <circle cx="15" cy="13.5" r="1.2" fill="currentColor" />
        </svg>
      ),
      shortcut: "G A",
      action: () => router.push("/ai-chat"),
    },
    {
      id: "nav-brief",
      category: "Navigation",
      title: "Go to Brief / Dashboard",
      subtitle: "Overview of integration status and live previews",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
          <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.657-6.657-1.414 1.414M7.757 16.243l-1.414 1.414m0-11.314 1.414 1.414M16.243 16.243l1.414 1.414" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
      shortcut: "G D",
      action: () => router.push("/dashboard"),
    },
    {
      id: "act-new-event",
      category: "Actions",
      title: "Schedule New Event",
      subtitle: "Open calendar event creation modal",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      ),
      shortcut: "C",
      action: () => router.push("/calendar?create=true"),
    },
    {
      id: "act-theme",
      category: "Actions",
      title: "Toggle Light / Dark Theme",
      subtitle: "Switch appearance mode",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      shortcut: "T",
      action: toggleTheme,
    },
    {
      id: "act-shortcuts",
      category: "Actions",
      title: "View Keyboard Shortcuts",
      subtitle: "See all available hotkeys",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" />
        </svg>
      ),
      shortcut: "?",
      action: () => {
        onClose();
        if (onOpenShortcuts) onOpenShortcuts();
      },
    },
  ];
}

export function CommandPalette({ isOpen, onClose, onOpenShortcuts }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const { showSuccess, showInfo } = useToast();

  const toggleTheme = useCallback(() => {
    const currentTheme = document.documentElement.dataset.theme || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    try {
      localStorage.setItem("relay-theme", nextTheme);
    } catch {}
    showSuccess(`Switched to ${nextTheme} mode`);
  }, [showSuccess]);

  const allItems = useMemo(
    () => getNavigationCommands(router, toggleTheme, onClose, onOpenShortcuts),
    [router, toggleTheme, onClose, onOpenShortcuts]
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const lower = query.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.subtitle.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
    );
  }, [allItems, query]);

  const handleClose = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      inputRef.current?.focus();
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (e) => {
      if (e.target === dialog) {
        handleClose();
      }
    };

    dialog.addEventListener("click", handleBackdropClick);
    return () => dialog.removeEventListener("click", handleBackdropClick);
  }, [handleClose]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const max = filteredItems.length > 0 ? filteredItems.length - 1 : 0;
      setSelectedIndex((prev) => (prev < max ? prev + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const max = filteredItems.length > 0 ? filteredItems.length - 1 : 0;
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : max));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems.length > 0 && filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        handleClose();
      } else if (query.trim()) {
        showInfo(`Asking AI: "${query}"`);
        router.push(`/ai-chat?q=${encodeURIComponent(query)}`);
        handleClose();
      }
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command Palette"
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      className="fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none bg-transparent p-0 flex items-start justify-center px-4 pt-16 sm:pt-24 backdrop:bg-black/60 backdrop:backdrop-blur-md border-none outline-none overflow-visible open:flex closed:hidden"
    >
      {/* Palette Card */}
      <div className="animate-scaleIn relative flex w-full max-w-xl flex-col overflow-hidden rounded-[26px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-panel-strong)] shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-[var(--color-app-border)] px-4 py-3.5 sm:px-5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 text-[var(--color-app-text-soft)]"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <label htmlFor="command-palette-input" className="sr-only">
            Search commands or ask AI
          </label>
          <input
            id="command-palette-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or ask AI anything..."
            className="w-full bg-transparent text-sm font-medium text-[var(--color-app-text)] placeholder:text-[var(--color-app-text-soft)] focus:outline-none"
          />
          <span className="rounded-[8px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-1.5 py-0.5 font-[family:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--color-app-text-soft)]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[360px] overflow-y-auto p-2"
        >
          {filteredItems.length === 0 && query.trim() ? (
            <button
              type="button"
              onClick={() => {
                showInfo(`Asking AI: "${query}"`);
                router.push(`/ai-chat?q=${encodeURIComponent(query)}`);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-[16px] bg-[var(--color-app-accent-soft)] p-3 text-left transition hover:brightness-110"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[var(--color-app-text)]">
                  Ask Relay AI: &ldquo;{query}&rdquo;
                </p>
                <p className="truncate text-[11px] text-[var(--color-app-text-muted)]">
                  Press Enter to prompt the agent
                </p>
              </div>
              <span className="rounded-[6px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-2 py-0.5 font-[family:var(--font-mono)] text-[10px] text-[var(--color-app-text-soft)]">
                ↵ Enter
              </span>
            </button>
          ) : null}

          {filteredItems.map((item, index) => (
            <CommandPaletteItem
              key={item.id}
              item={item}
              isSelected={index === selectedIndex}
              onSelect={() => {
                item.action();
                onClose();
              }}
              onHover={() => setSelectedIndex(index)}
            />
          ))}
        </div>

        <CommandPaletteFooter />
      </div>
    </dialog>
  );
}

