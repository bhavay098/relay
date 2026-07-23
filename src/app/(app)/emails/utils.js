import { getDeterministicHue } from "../components/colorUtils";

export const EMAILS_ERROR = "Could not load emails right now.";
const AVATAR_HUES = [210, 260, 320, 20, 160, 190, 280, 40];

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

export function getInitials(name) { return name?.trim()?.[0]?.toUpperCase() ?? "?"; }
export function getAvatarHue(seed) { return getDeterministicHue(seed, AVATAR_HUES); }

export function formatMessageDate(internalDate) {
  const date = new Date(Number(internalDate));
  if (!internalDate || Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: date.getFullYear() === now.getFullYear() ? undefined : "numeric" }).format(date);
}

export function formatFullDate(internalDate) {
  const date = new Date(Number(internalDate));
  if (!internalDate || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export function toPlainText(html) {
  return html ? html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim() : "";
}
