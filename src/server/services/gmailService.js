function assertSafeHeader(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  if (/[\r\n]/.test(value)) {
    throw new Error(`${field} cannot contain line breaks.`);
  }
}

export function createRawEmail({ to, subject, body }) {
  assertSafeHeader(to, "Recipient");
  assertSafeHeader(subject, "Subject");

  if (typeof body !== "string" || !body.trim()) {
    throw new Error("Message body is required.");
  }

  const message = [
    `To: ${to.trim()}`,
    `Subject: ${subject.trim()}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ].join("\r\n");

  return Buffer.from(message, "utf8").toString("base64url");
}

export async function sendGmailMessage(tenant, message) {
  return tenant.gmail.api.messages.send({ raw: createRawEmail(message) });
}

// Gmail's messages.list endpoint only stores message references (id and
// threadId). A hydrated message is written by messages.get and contains at
// least one of the display fields below.
export function isHydratedGmailMessage(message) {
  return Boolean(
    message && (message.payload || message.subject || message.snippet),
  );
}

const MAILBOX_LABELS = {
  inbox: "INBOX",
  sent: "SENT",
};

export function getMailboxLabel(mailbox) {
  return MAILBOX_LABELS[mailbox] ?? null;
}

export function hasGmailLabel(message, label) {
  return Array.isArray(message?.labelIds) && message.labelIds.includes(label);
}

function messageTimestamp(row) {
  const internalDate = Number(row.data?.internalDate);
  if (Number.isFinite(internalDate)) return internalDate;

  const updatedAt = new Date(row.updated_at ?? row.updatedAt ?? 0).getTime();
  return Number.isFinite(updatedAt) ? updatedAt : 0;
}

function newestFirst(left, right) {
  return messageTimestamp(right) - messageTimestamp(left);
}

export function decodeBase64Url(data) {
  if (!data) return "";
  try {
    return Buffer.from(data, "base64url").toString("utf-8");
  } catch {
    try {
      const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
      return Buffer.from(base64, "base64").toString("utf-8");
    } catch {
      return "";
    }
  }
}

export function extractEmailContent(message) {
  if (!message) return { html: "", text: "", body: "" };

  let html = "";
  let text = "";

  if (typeof message.html === "string" && message.html.trim()) {
    html = message.html;
  }
  if (typeof message.body === "string" && message.body.trim()) {
    if (/<[a-z][\s\S]*>/i.test(message.body)) {
      html = html || message.body;
    } else {
      text = text || message.body;
    }
  }

  function walkPayload(part) {
    if (!part) return;

    const mimeType = part.mimeType || "";
    const data = part.body?.data;

    if (data) {
      const decoded = decodeBase64Url(data);
      if (mimeType.toLowerCase().includes("text/html") && !html) {
        html = decoded;
      } else if (mimeType.toLowerCase().includes("text/plain") && !text) {
        text = decoded;
      }
    }

    if (Array.isArray(part.parts)) {
      for (const childPart of part.parts) {
        walkPayload(childPart);
      }
    }
  }

  if (message.payload) {
    walkPayload(message.payload);
  }

  return {
    html: html || (/<[a-z][\s\S]*>/i.test(text) ? text : ""),
    text: text || message.snippet || "",
    body: html || text || message.snippet || "",
  };
}

export async function readHydratedGmailMessages(
  tenant,
  { label = MAILBOX_LABELS.inbox, limit = 50 } = {},
) {
  const rows = await tenant.gmail.db.messages.search({});

  return rows
    .filter(
      (row) =>
        isHydratedGmailMessage(row.data) && hasGmailLabel(row.data, label),
    )
    .sort(newestFirst)
    .slice(0, limit)
    .map((row) => row.data);
}

export async function readHydratedGmailMessagesById(tenant, messageIds) {
  const rows = await tenant.gmail.db.messages.findManyByEntityIds(messageIds);
  const messagesById = new Map();
  for (const row of rows) {
    if (isHydratedGmailMessage(row.data)) {
      messagesById.set(row.entity_id, row.data);
    }
  }

  const result = [];
  for (const id of messageIds) {
    const message = messagesById.get(id);
    if (message) {
      result.push(message);
    }
  }
  return result;
}
