export const EMAILS_ERROR = "Could not load emails right now.";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

const sameYearDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const otherYearDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function parseFromString(raw) {
  if (!raw) return { name: "", email: "" };
  const match = raw.match(/^(.*?)<([^>]+)>\s*$/);
  if (match) return { name: match[1].trim().replace(/^"(.*)"$/, "$1").trim(), email: match[2].trim() };
  return raw.includes("@") && !raw.includes(" ") ? { name: "", email: raw.trim() } : { name: raw.trim(), email: "" };
}

export function formatSender(from) {
  if (!from) return "";
  if (typeof from === "string") { const sender = parseFromString(from); return sender.name || sender.email; }
  if (Array.isArray(from)) return from[0]?.name || from[0]?.email || "";
  return typeof from === "object" ? from.name || from.email || "" : "";
}

export function formatSenderEmail(from) {
  if (!from) return "";
  if (typeof from === "string") return parseFromString(from).email;
  if (Array.isArray(from)) return from[0]?.email || "";
  return typeof from === "object" ? from.email || "" : "";
}

export function formatMessageDate(internalDate) {
  const date = new Date(Number(internalDate));
  if (!internalDate || Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return timeFormatter.format(date);
  }
  if (date.getFullYear() === now.getFullYear()) {
    return sameYearDateFormatter.format(date);
  }
  return otherYearDateFormatter.format(date);
}

export function formatFullDate(internalDate) {
  const date = new Date(Number(internalDate));
  if (!internalDate || Number.isNaN(date.getTime())) return "";
  return fullDateFormatter.format(date);
}

export function toPlainText(html) {
  return html ? html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim() : "";
}

export function decodeBase64UrlClient(data) {
  if (!data) return "";
  try {
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

export function extractClientEmailContent(message) {
  if (!message) return { html: "", text: "" };
  if (message.html) return { html: message.html, text: message.text || toPlainText(message.html) };

  let html = "";
  let text = "";

  function walkPayload(part) {
    if (!part) return;
    const mimeType = part.mimeType || "";
    const data = part.body?.data;
    if (data) {
      const decoded = decodeBase64UrlClient(data);
      if (mimeType.toLowerCase().includes("text/html") && !html) html = decoded;
      else if (mimeType.toLowerCase().includes("text/plain") && !text) text = decoded;
    }
    if (Array.isArray(part.parts)) {
      for (const child of part.parts) walkPayload(child);
    }
  }

  if (message.payload) walkPayload(message.payload);
  if (!html && message.body && /<[a-z][\s\S]*>/i.test(message.body)) html = message.body;
  if (!text && message.body) text = toPlainText(message.body);

  return { html, text: text || message.snippet || "" };
}

