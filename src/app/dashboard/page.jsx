// DASHBOARD PAGE
// src/app/dashboard/page.jsx

import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { ConnectButtons } from "./components/ConnectButtons";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { GmailRefreshButton } from "./components/GmailRefreshButton";
import { CalendarRefreshButton } from "./components/CalendarRefreshButton";
import { QuickActions } from "./components/QuickActions";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relay</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-2">
            Welcome, {user.firstName || "there"}!
          </h2>
          <p className="text-gray-600">
            Email: {user.emailAddresses[0]?.emailAddress}
          </p>
          <p className="text-gray-400 text-sm">User ID: {user.id}</p>
        </section>

        <section className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Connected Services</h2>

          <div className="mb-8">
            <ConnectionStatus />
          </div>

          <div className="mb-8">
            <ConnectButtons />
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Gmail Sync</h3>
            <GmailRefreshButton />
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">
              Google Calendar Sync
            </h3>
            <CalendarRefreshButton />
          </div>

          <hr className="my-6" />
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <QuickActions />
        </section>
      </div>
    </main>
  );
}
