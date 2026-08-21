"use client";

import { useEffect, useMemo, useRef, useState, useCallback, Suspense } from "react";
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
import { apiFetch } from "../../../lib/api";

function CalendarContent() {
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

  const openCreateModal = useCallback((date, hour) => {
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1, 0, 0, 0);
    setModalState({ event: null, start, end });
  }, []);

  // Handle ?create=true from command palette
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      const now = new Date();
      openCreateModal(now, now.getHours());
    }
  }, [searchParams, openCreateModal]);

  async function loadEvents(signal) {
    try {
      const data = await apiFetch("/api/calendar", { signal });
      setEvents(data.events ?? []);
    } catch (caughtError) {
      if (caughtError.name === "AbortError") return;
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
      const data = await apiFetch("/api/calendar/refresh", { method: "POST" });
      setEvents(data.events ?? []);
      showSuccess(`Calendar synced: ${data.events?.length ?? 0} events loaded`);
    } catch (caughtError) {
      console.error(caughtError);
      const errMsg = caughtError.data?.error ?? CALENDAR_PAGE_ERROR;
      setError(errMsg);
      showError(errMsg);
    } finally {
      setRefreshing(false);
    }
  }, [showSuccess, showError]);

  useEffect(() => {
    const controller = new AbortController();
    loadEvents(controller.signal);
    return () => controller.abort();
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
      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        if (isSameDay(start, day)) {
          if (isAllDay) {
            allDay[i].push(event);
          } else {
            timed[i].push({ event, start, end });
          }
          break;
        }
      }
    }
    return { allDayByDay: allDay, timedByDay: timed };
  }, [events, days]);

  const handleSaved = useCallback((savedEvent) => {
    setEvents((prev) => {
      const existing = prev.some((e) => e.id === savedEvent.id);
      if (existing) {
        return prev.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      }
      return [...prev, savedEvent];
    });
    setModalState(null);
  }, []);

  const handleDeleted = useCallback((deletedId) => {
    setEvents((prev) => prev.filter((e) => e.id !== deletedId));
    setModalState(null);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
      <CalendarHeader
        weekStart={weekStart}
        onPrevWeek={() => setWeekStart((prev) => addDays(prev, -7))}
        onNextWeek={() => setWeekStart((prev) => addDays(prev, 7))}
        onToday={() => setWeekStart(startOfWeek(new Date()))}
        onNewEvent={() => {
          const now = new Date();
          openCreateModal(now, now.getHours() + 1);
        }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {error ? (
        <div className="rounded-[18px] border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      ) : null}

      <WeekGrid
        loading={loading}
        weekStart={weekStart}
        days={days}
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

export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarContent />
    </Suspense>
  );
}
