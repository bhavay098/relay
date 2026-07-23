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

export async function readHydratedGmailMessages(
  tenant,
  { label = MAILBOX_LABELS.inbox, limit = 50 } = {},
) {
  // Corsair database entities expose the provider record under `row.data`.
  // Filter by a Gmail system label so the cache can safely hold both inbox
  // and sent mail without mixing the two views.
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
  const messagesById = new Map(
    rows
      .filter((row) => isHydratedGmailMessage(row.data))
      .map((row) => [row.entity_id, row.data]),
  );

  // Preserve Gmail's newest-first order instead of the database's unspecified
  // entity order.
  return messageIds
    .map((id) => messagesById.get(id))
    .filter(Boolean);
}
