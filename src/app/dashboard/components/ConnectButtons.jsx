"use client";

export function ConnectButtons() {
  function connectGmail() {
    window.location.href = "/api/auth/gmail/connect";
  }

  function connectCalendar() {
    window.location.href = "/api/auth/googlecalendar/connect";
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={connectGmail}
        className="inline-flex min-h-12 items-center justify-center rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-5 py-3 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]"
      >
        Connect Gmail
      </button>
      <button
        type="button"
        onClick={connectCalendar}
        className="inline-flex min-h-12 items-center justify-center rounded-[18px] border border-[var(--color-app-border)] bg-[var(--color-app-chip)] px-5 py-3 text-sm font-medium text-[var(--color-app-text)] transition hover:border-[var(--color-app-border-strong)] hover:bg-[var(--color-app-surface)]"
      >
        Connect Google Calendar
      </button>
    </div>
  );
}
