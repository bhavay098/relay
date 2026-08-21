"use client";

import { useState, useEffect } from "react";
import {
  CALENDAR_LOCALE,
  END_HOUR,
  formatHourLabel,
  getEventHue,
  HOUR_HEIGHT,
  isSameDay,
  START_HOUR,
} from "../utils";

// Minimum width for a single day column
const DAY_COLUMN_MIN_WIDTH = 120;
const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatEventTimeLabel(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, "0");
  return `${displayHour}:${displayMinutes} ${period}`;
}

function eventTopAndHeight(start, end) {
  const startHour = start.getHours() + start.getMinutes() / 60;
  const endHour = Math.max(
    startHour + 0.25,
    end.getHours() + end.getMinutes() / 60
  );
  return {
    top: (startHour - START_HOUR) * HOUR_HEIGHT,
    height: (endHour - startHour) * HOUR_HEIGHT,
  };
}

export function WeekGrid({
  loading,
  weekStart,
  days,
  allDayByDay,
  timedByDay,
  gridScrollRef,
  onCreate,
  onEdit,
}) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Auto-update live current time indicator every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, index) => START_HOUR + index
  );

  if (loading || !weekStart) {
    return (
      <section className="home-panel flex h-[calc(100dvh-200px)] min-h-[480px] flex-col overflow-hidden rounded-[28px]">
        <div className="flex flex-1 items-center justify-center text-sm text-[var(--color-app-text-muted)]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--color-app-accent)] animate-pulse" />
            <span>Loading schedule events…</span>
          </div>
        </div>
      </section>
    );
  }

  const nowMinutesPosition =
    (currentTime.getHours() + currentTime.getMinutes() / 60 - START_HOUR) *
    HOUR_HEIGHT;

  return (
    <section className="home-panel flex h-[calc(100dvh-200px)] min-h-[480px] flex-col overflow-hidden rounded-[28px]">
      <div className="flex flex-1 flex-col overflow-x-auto overflow-y-hidden">
        {/* Days Header Row */}
        <div
          className="flex shrink-0 border-b border-[var(--color-app-border)] bg-[var(--color-app-panel-strong)]"
          style={{ minWidth: days.length * DAY_COLUMN_MIN_WIDTH + 56 }}
        >
          <div className="w-14 shrink-0 sm:w-16" />
          {days.map((day) => {
            const isToday = isSameDay(day, currentTime);
            return (
              <div
                key={day.toISOString()}
                className="flex flex-1 flex-col items-center gap-1 border-l border-[var(--color-app-border)] py-2.5"
                style={{ minWidth: DAY_COLUMN_MIN_WIDTH }}
              >
                <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${isToday ? "text-[var(--color-app-accent)]" : "text-[var(--color-app-text-soft)]"}`}>
                  {WEEKDAY_NAMES[day.getDay()]}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday
                      ? "bg-[var(--color-app-accent)] text-[var(--color-app-accent-fg)] shadow-sm"
                      : "text-[var(--color-app-text)]"
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* All-day Events Row */}
        {allDayByDay.some((dayEvents) => dayEvents.length) ? (
          <div
            className="flex shrink-0 border-b border-[var(--color-app-border)] bg-[var(--color-app-surface)]"
            style={{ minWidth: days.length * DAY_COLUMN_MIN_WIDTH + 56 }}
          >
            <div className="flex w-14 shrink-0 items-start justify-end pr-2 pt-1.5 text-[10px] uppercase font-semibold tracking-wider text-[var(--color-app-text-soft)] sm:w-16">
              All day
            </div>
            {days.map((day, dayIdx) => {
              const dayEvents = allDayByDay[dayIdx] ?? [];
              return (
                <div
                  key={day.toISOString()}
                  className="flex flex-1 flex-col gap-1 border-l border-[var(--color-app-border)] p-1"
                  style={{ minWidth: DAY_COLUMN_MIN_WIDTH }}
                >
                  {dayEvents.map((event) => (
                    <button
                      type="button"
                      key={event.id}
                      onClick={() => onEdit(event)}
                      className="truncate rounded-md px-2 py-1 text-left text-xs font-medium text-white transition hover:brightness-110 shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, hsl(${getEventHue(event.id)} 65% 42%), hsl(${getEventHue(event.id)} 65% 36%))`,
                      }}
                    >
                      {event.summary ?? "(no title)"}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Hour Grid Scroll Area */}
        <div ref={gridScrollRef} className="flex-1 overflow-y-auto">
          <div
            className="flex"
            style={{
              height: (END_HOUR - START_HOUR) * HOUR_HEIGHT,
              minWidth: days.length * DAY_COLUMN_MIN_WIDTH + 56,
            }}
          >
            {/* Time Labels Column */}
            <div className="w-14 shrink-0 sm:w-16">
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{ height: HOUR_HEIGHT }}
                  className="relative"
                >
                  <span className="absolute -top-2 right-2 font-[family:var(--font-mono)] text-[10px] text-[var(--color-app-text-soft)]">
                    {hour === START_HOUR ? "" : formatHourLabel(hour)}
                  </span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {days.map((day, dayIndex) => {
              const isToday = isSameDay(day, currentTime);
              return (
                <div
                  key={day.toISOString()}
                  className={`relative flex-1 border-l border-[var(--color-app-border)] ${isToday ? "bg-[var(--color-app-accent-soft)]/20" : ""}`}
                  style={{ minWidth: DAY_COLUMN_MIN_WIDTH }}
                >
                  {/* Hour slots */}
                  {hours.map((hour) => (
                    <button
                      type="button"
                      key={hour}
                      onClick={() => onCreate(day, hour)}
                      style={{ height: HOUR_HEIGHT }}
                      className="block w-full border-b border-[var(--color-app-border)] text-left transition hover:bg-[var(--color-app-surface-soft)]/60"
                      title={`Click to schedule at ${formatHourLabel(hour)}`}
                    />
                  ))}

                  {/* Real-time "Now" Indicator Line */}
                  {isToday && nowMinutesPosition >= 0 && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                      style={{ top: nowMinutesPosition }}
                    >
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"
                        style={{ marginLeft: -5 }}
                      />
                      <div className="h-[2px] flex-1 bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
                    </div>
                  )}

                  {/* Timed Events */}
                  {timedByDay[dayIndex].map(({ event, start, end }) => {
                    const { top, height } = eventTopAndHeight(start, end);
                    const hue = getEventHue(event.id);
                    return (
                      <button
                        type="button"
                        key={event.id}
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          onEdit(event);
                        }}
                        style={{
                          top,
                          height: Math.max(height, 24),
                          background: `linear-gradient(135deg, hsl(${hue} 55% 38%), hsl(${hue} 55% 32%))`,
                          borderLeft: `3px solid hsl(${hue} 80% 65%)`,
                        }}
                        className="absolute inset-x-1 z-[5] overflow-hidden rounded-[8px] px-2 py-1 text-left text-xs text-white shadow-sm transition hover:scale-[1.01] hover:brightness-110 hover:shadow-md"
                      >
                        <p className="truncate font-semibold leading-tight">
                          {event.summary ?? "(no title)"}
                        </p>
                        {height > 30 ? (
                          <p className="truncate text-[10px] font-medium leading-tight text-white/80 mt-0.5 font-[family:var(--font-mono)]">
                            {formatEventTimeLabel(start)}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
