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
