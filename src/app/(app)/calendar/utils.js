import { getDeterministicHue } from "../components/colorUtils";

export const CALENDAR_PAGE_ERROR = "Could not load events right now.";
export const HOUR_HEIGHT = 56;
export const START_HOUR = 0;
export const END_HOUR = 24;
export const CALENDAR_LOCALE = "en-US";

const EVENT_HUES = [217, 142, 291, 12, 199, 45, 340];

export function startOfWeek(date) {
  const result = new Date(date);
  result.setDate(result.getDate() - result.getDay());
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(first, second) {
  return Boolean(
    first &&
      second &&
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate(),
  );
}

export function toLocalInputValue(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (value) => String(value).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function getEventRange(event) {
  const startRaw = event.start?.dateTime ?? event.start?.date;
  const endRaw = event.end?.dateTime ?? event.end?.date;
  return {
    start: startRaw ? new Date(startRaw) : null,
    end: endRaw ? new Date(endRaw) : null,
    isAllDay: Boolean(event.start?.date && !event.start?.dateTime),
  };
}

export function formatWeekRangeLabel(weekStart) {
  const weekEnd = addDays(weekStart, 6);
  const startMonth = weekStart.toLocaleDateString(CALENDAR_LOCALE, { month: "short" });
  const endMonth = weekEnd.toLocaleDateString(CALENDAR_LOCALE, { month: "short" });
  if (weekStart.getMonth() === weekEnd.getMonth()) return `${startMonth} ${weekStart.getDate()} – ${weekEnd.getDate()}`;
  if (weekStart.getFullYear() === weekEnd.getFullYear()) return `${startMonth} ${weekStart.getDate()} – ${endMonth} ${weekEnd.getDate()}`;
  return `${startMonth} ${weekStart.getDate()}, ${weekStart.getFullYear()} – ${endMonth} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
}

export function formatHourLabel(hour) {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export function getEventHue(seed) {
  return getDeterministicHue(seed, EVENT_HUES);
}

export function rsvpStatusLabel(responseStatus) {
  if (responseStatus === "accepted") return "Yes";
  if (responseStatus === "declined") return "No";
  if (responseStatus === "tentative") return "Maybe";
  if (responseStatus === "needsAction") return "Not responded";
  return "";
}
