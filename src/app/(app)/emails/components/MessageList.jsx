"use client";

import { Avatar } from "../../components/Avatar";
import { formatMessageDate, formatSender, formatSenderEmail } from "../utils";

export function MessageList({ messages, activeId, mailbox, onSelect }) {
  const isSent = mailbox === "sent";

  return (
    <ul className="divide-y divide-[var(--color-app-border)]">
      {messages.map((message) => {
        const participant = isSent ? message.to : message.from;
        const participantName = formatSender(participant);
        const participantEmail = formatSenderEmail(participant);
        const participantLabel = participantName || participantEmail || "Unknown recipient";

        return (
          <li key={message.id}>
            <button
              onClick={() => onSelect(message.id)}
              className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition sm:px-5 sm:py-3.5 ${
                message.id === activeId
                  ? "bg-[var(--color-app-accent-soft)]"
                  : "hover:bg-[var(--color-app-surface-soft)]"
              }`}
            >
              <Avatar name={participantName} email={participantEmail} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[13.5px] font-semibold text-[var(--color-app-text)]">
                    {isSent ? `To: ${participantLabel}` : participantLabel}
                  </p>
                  <span className="shrink-0 text-xs text-[var(--color-app-text-soft)]">
                    {formatMessageDate(message.internalDate)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-[var(--color-app-text-muted)]">
                  <span className="text-[var(--color-app-text)]">
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
          </li>
        );
      })}
    </ul>
  );
}
