"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarHeader } from "./components/CalendarHeader";
import { EventModal } from "./components/EventModal";
import { WeekGrid } from "./components/WeekGrid";
import {
  addDays,
  CALENDAR_PAGE_ERROR,
  getEventRange,
  HOUR_HEIGHT,
  isSameDay,
  startOfWeek,
} from "./utils.js";
import { useToast } from "../../components/ToastProvider";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [modalState, setModalState] = useState(null);
  const gridScrollRef = useRef(null);
  const hasScrolledToNowRef = useRef(false);
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();

  // Handle ?create=true from command palette
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      const now = new Date();
      openCreateModal(now, now.getHours());
    }
  }, [searchParams]);

  async function loadEvents() {
    try {
      const response = await fetch("/api/calendar");
      const data = await response.json();
      if (!response.ok) {
        console.error("Calendar page error response:", data);
        setError(CALENDAR_PAGE_ERROR);
        return;
      }
      setEvents(data.events ?? []);
    } catch (caughtError) {
      console.error(caughtError);
      setError(CALENDAR_PAGE_ERROR);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch("/api/calendar/refresh", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        const errMsg = data.error ?? CALENDAR_PAGE_ERROR;
        setError(errMsg);
        showError(errMsg);
        return;
      }
      setEvents(data.events ?? []);
      showSuccess(`Calendar synced: ${data.events?.length ?? 0} events loaded`);
    } catch (caughtError) {
      console.error(caughtError);
      setError(CALENDAR_PAGE_ERROR);
      showError(CALENDAR_PAGE_ERROR);
    } finally {
      setRefreshing(false);
    }
  }, [showSuccess, showError]);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (!hasScrolledToNowRef.current && !loading && gridScrollRef.current) {
      gridScrollRef.current.scrollTop = Math.max(0, (new Date().getHours() - 2) * HOUR_HEIGHT);
      hasScrolledToNowRef.current = true;
    }
  }, [loading]);

  const days = useMemo(
    () => (weekStart ? Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)) : []),
    [weekStart]
  );

  const { allDayByDay, timedByDay } = useMemo(() => {
    const allDay = Array.from({ length: 7 }, () => []);
    const timed = Array.from({ length: 7 }, () => []);
    for (const event of events) {
      const { start, end, isAllDay } = getEventRange(event);
      if (!start) continue;
      for (let index = 0; index < 7; index++) {
        if (!isSameDay(start, days[index])) continue;
        if (isAllDay) allDay[index].push(event);
        else timed[index].push({ event, start, end: end ?? start });
        break;
      }
    }
    return { allDayByDay: allDay, timedByDay: timed };
  }, [events, days]);

  function openCreateModal(day, hour) {
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    setModalState({ event: null, start, end });
  }

  function handleSaved(savedEvent) {
    setEvents((current) =>
      current.some((event) => event.id === savedEvent.id)
        ? current.map((event) => (event.id === savedEvent.id ? savedEvent : event))
        : [...current, savedEvent]
    );
    setModalState(null);
    showSuccess("Event saved successfully");
  }

  function handleDeleted(eventId) {
    setEvents((current) => current.filter((event) => event.id !== eventId));
    setModalState(null);
    showSuccess("Event removed from calendar");
  }

  // Keyboard navigation for Calendar: C to create, T for today, ArrowLeft/ArrowRight for weeks
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName) || modalState) return;

      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        const now = new Date();
        openCreateModal(now, now.getHours());
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        setWeekStart(startOfWeek(new Date()));
        showSuccess("Jumped to current week");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalState, showSuccess]);

  return (
    <div className="mx-auto flex min-w-0 max-w-[1400px] flex-col gap-4 px-4 sm:px-6 lg:px-8">
      <CalendarHeader
        weekStart={weekStart}
        refreshing={refreshing}
        onWeekStartChange={setWeekStart}
        onRefresh={handleRefresh}
        onCreate={() => openCreateModal(new Date(), new Date().getHours())}
      />

      {error ? (
        <div className="shrink-0 rounded-[22px] border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.08)] px-4 py-4 text-sm text-[var(--color-error)]">
          {error}
        </div>
      ) : null}

      <WeekGrid
        loading={loading}
        weekStart={weekStart}
        days={days}
        today={weekStart ? new Date() : null}
        allDayByDay={allDayByDay}
        timedByDay={timedByDay}
        gridScrollRef={gridScrollRef}
        onCreate={openCreateModal}
        onEdit={(event) => setModalState({ event, start: null, end: null })}
      />

      {!loading && !error && events.length === 0 ? (
        <p className="shrink-0 text-center text-sm text-[var(--color-app-text-soft)]">
          No events in cache yet. Connect Google Calendar and refresh from the Brief page.
        </p>
      ) : null}

      {modalState ? (
        <EventModal
          initialEvent={modalState.event}
          initialStart={modalState.start}
          initialEnd={modalState.end}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      ) : null}
    </div>
  );
}
