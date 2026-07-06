"use client";

export function ConnectButtons() {
  function connectGmail() {
    window.location.href = "/api/auth/gmail/connect";
  }

  function connectCalendar() {
    window.location.href = "/api/auth/googlecalendar/connect";
  }

  return (
    <div className="flex gap-4 flex-wrap">
      <button
        type="button"
        onClick={connectGmail}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
      >
        Connect Gmail
      </button>
      <button
        type="button"
        onClick={connectCalendar}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
      >
        Connect Google Calendar
      </button>
    </div>
  );
}
