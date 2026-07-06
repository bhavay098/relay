"use client";

import Link from "next/link";

export function QuickActions() {
  return (
    <div className="flex gap-4 flex-wrap">
      <Link
        href="/emails"
        className="px-6 py-3 bg-gray-600 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
      >
        View Emails
      </Link>
      <Link
        href="/calendar"
        className="px-6 py-3 bg-gray-600 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
      >
        View Calendar
      </Link>
      <Link
        href="/ai-chat"
        className="px-6 py-3 bg-gray-600 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
      >
        AI Chat
      </Link>
    </div>
  );
}
