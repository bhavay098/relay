"use client";

import { useState, useCallback } from "react";
import { GmailRefreshButton } from "./GmailRefreshButton";
import { CalendarRefreshButton } from "./CalendarRefreshButton";
import { InboxPreview } from "./InboxPreview";
import { CalendarPreview } from "./CalendarPreview";

// Bundles the previews with their matching refresh buttons so that
// clicking "Refresh Gmail" or "Refresh Calendar" immediately updates
// the preview above it, instead of only updating the database cache
// silently in the background.
export function LiveWorkspace() {
  // Bumping these numbers is just a signal to the previews below:
  // "something changed, fetch again." The previews watch this value
  // in their own useEffect dependency array.
  const [gmailRefreshedAt, setGmailRefreshedAt] = useState(0);
  const [calendarRefreshedAt, setCalendarRefreshedAt] = useState(0);

  const handleGmailRefreshed = useCallback(() => {
    setGmailRefreshedAt(Date.now());
  }, []);

  const handleCalendarRefreshed = useCallback(() => {
    setCalendarRefreshedAt(Date.now());
  }, []);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <InboxPreview refreshKey={gmailRefreshedAt} />
        <CalendarPreview refreshKey={calendarRefreshedAt} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <GmailRefreshButton onRefreshed={handleGmailRefreshed} />
        <CalendarRefreshButton onRefreshed={handleCalendarRefreshed} />
      </div>
    </>
  );
}
