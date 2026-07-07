"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/calendar");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to load events");
          return;
        }

        setEvents(data.events ?? []);
      } catch (err) {
        setError("Failed to load events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {loading && <p className="text-gray-500">Loading events...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <p className="text-gray-500">
            No events in cache. Connect Google Calendar and refresh.
          </p>
        )}

        <ul className="space-y-4">
          {events.map((event) => (
            <li
              key={event.id}
              className="bg-white rounded-lg shadow p-4 border border-gray-100"
            >
              <p className="font-semibold">
                {event.summary ?? "(no title)"}
              </p>
              <p className="text-sm text-gray-500">
                {event.start?.dateTime ?? event.start?.date ?? ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
