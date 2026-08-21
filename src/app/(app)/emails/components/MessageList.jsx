"use client";

import { useState } from "react";
import { Avatar } from "../../components/Avatar";
import { formatMessageDate, formatSender, formatSenderEmail } from "../utils";
import { useToast } from "../../../components/ToastProvider";

export function MessageList({ messages, activeId, mailbox, onSelect }) {
  const [starredIds, setStarredIds] = useState(new Set());
  const [readIds, setReadIds] = useState(new Set());
  const { showSuccess, showInfo } = useToast();
  const isSent = mailbox === "sent";

  const toggleStar = (e, id) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showInfo("Thread unstarred");
      } else {
        next.add(id);
        showSuccess("Thread starred");
      }
      return next;
    });
  };

  const handleArchive = (e, subject) => {
    e.stopPropagation();
    showSuccess(`Archived: "${subject || "Thread"}"`);
  };

  const toggleRead = (e, id) => {
    e.stopPropagation();
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showInfo("Marked as unread");
      } else {
        next.add(id);
        showInfo("Marked as read");
      }
      return next;
    });
  };

  return (
    <ul className="divide-y divide-[var(--color-app-border)]">
      {messages.map((message) => {
        const participant = isSent ? message.to : message.from;
        const participantName = formatSender(participant);
        const participantEmail = formatSenderEmail(participant);
        const participantLabel = participantName || participantEmail || "Unknown recipient";
        const isStarred = starredIds.has(message.id);
        const isRead = readIds.has(message.id);
        const isActive = message.id === activeId;

        return (
          <li key={message.id} className="relative group">
            <button
              type="button"
              onClick={() => onSelect(message.id)}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition sm:px-5 ${
                isActive
                  ? "bg-[var(--color-app-accent-soft)] border-l-2 border-[var(--color-app-text)]"
                  : "hover:bg-[var(--color-app-surface-soft)] border-l-2 border-transparent"
              }`}
            >
              {/* Unread indicator dot */}
              {!isRead && !isSent && (
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-[var(--color-app-text)]" />
              )}

              <Avatar name={participantName} email={participantEmail} size={36} />

              <div className="min-w-0 flex-1 pr-16 sm:pr-20">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <p className={`truncate text-[13.5px] ${!isRead && !isSent ? "font-bold text-[var(--color-app-text)]" : "font-medium text-[var(--color-app-text)]"}`}>
                      {isSent ? `To: ${participantLabel}` : participantLabel}
                    </p>
                    {isStarred && (
                      <span className="text-amber-400">★</span>
                    )}
                  </div>

                  <span className="shrink-0 text-xs text-[var(--color-app-text-soft)]">
                    {formatMessageDate(message.internalDate)}
                  </span>
                </div>

                <p className="mt-0.5 truncate text-sm text-[var(--color-app-text-muted)]">
                  <span className={!isRead && !isSent ? "font-semibold text-[var(--color-app-text)]" : "text-[var(--color-app-text)]"}>
                    {message.subject ?? "(no subject)"}
                  </span>
                  {message.snippet ? (
                    <span className="text-[var(--color-app-text-soft)]">
                      {" "}— {message.snippet}
                    </span>
                  ) : null}
                </p>
              </div>
            </button>

            {/* Hover Quick Triage Actions - Sibling to main button to avoid nested <button> tag errors */}
            <div className="hidden group-hover:flex items-center gap-1 absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--color-app-panel-strong)]/95 backdrop-blur-md px-1.5 py-1 rounded-[12px] border border-[var(--color-app-border-strong)] shadow-md z-10">
              <button
                type="button"
                onClick={(e) => toggleStar(e, message.id)}
                title={isStarred ? "Unstar" : "Star"}
                className="p-1 rounded-[8px] text-[var(--color-app-text-soft)] hover:text-amber-400 hover:bg-[var(--color-app-surface)] transition"
              >
                <svg viewBox="0 0 20 20" fill={isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => toggleRead(e, message.id)}
                title={isRead ? "Mark unread" : "Mark read"}
                className="p-1 rounded-[8px] text-[var(--color-app-text-soft)] hover:text-[var(--color-app-text)] hover:bg-[var(--color-app-surface)] transition"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => handleArchive(e, message.subject)}
                title="Archive thread"
                className="p-1 rounded-[8px] text-[var(--color-app-text-soft)] hover:text-[var(--color-app-text)] hover:bg-[var(--color-app-surface)] transition"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
