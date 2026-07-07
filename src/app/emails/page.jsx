"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function EmailsPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEmails() {
      try {
        const res = await fetch("/api/gmail");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to load emails");
          return;
        }

        setMessages(data.messages ?? []);
      } catch (err) {
        setError("Failed to load emails");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEmails();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Emails</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {loading && <p className="text-gray-500">Loading emails...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && messages.length === 0 && (
          <p className="text-gray-500">No emails in cache. Connect Gmail and refresh.</p>
        )}

        <ul className="space-y-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className="bg-white rounded-lg shadow p-4 border border-gray-100"
            >
              <p className="font-semibold">
                {message.subject ?? "(no subject)"}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {message.snippet ?? ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
