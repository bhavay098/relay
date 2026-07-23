// ─────────────────────────────────────────────
// AI Chat – shared helpers & constants
// ─────────────────────────────────────────────

export const CHAT_REQUEST_ERROR = "Could not start the chat right now.";
export const CHAT_STREAM_ERROR =
  "I hit an error while responding. Please try again.";
export const INITIAL_MESSAGES = [];

/**
 * Parses buffered SSE text into individual JSON events.
 * Returns any remaining (incomplete) text so the caller can
 * prepend it to the next chunk.
 */
export function parseSseChunk(buffer, onEvent) {
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

// ── Action label helpers ──────────────────────

export function actionTitle(action) {
  if (action.kind === "email") return "Review email draft";
  if (action.kind === "calendar_create") return "Review new calendar event";
  if (action.kind === "calendar_update") return "Review calendar update";
  return "Confirm calendar deletion";
}

export function actionSuccessMessage(action) {
  if (action.kind === "email") return "Email sent.";
  if (action.kind === "calendar_create") return "Calendar event created.";
  if (action.kind === "calendar_update") return "Calendar event updated.";
  return "Calendar event deleted.";
}

export function confirmButtonLabel(action) {
  if (action.kind === "email") return "Send email";
  if (action.kind === "calendar_create") return "Create event";
  if (action.kind === "calendar_delete") return "Delete event";
  return "Save changes";
}

// ── Date / time converters ────────────────────

export function toDateTimeLocalValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const pad = (number) => String(number).padStart(2, "0");
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())]
    .join("-")
    .concat(`T${pad(date.getHours())}:${pad(date.getMinutes())}`);
}

export function toIsoDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString();
}

// ── Attendee converters ───────────────────────

export function attendeesToInputValue(attendees) {
  if (!Array.isArray(attendees)) return "";
  return attendees.join(", ");
}

export function attendeesFromInputValue(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
