import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "./components/AppSidebar.jsx";
import { AppTopbar } from "./components/AppTopbar.jsx";
import { MobileAppNav } from "./components/MobileAppNav.jsx";

export default async function AppLayout({ children }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="app-page home-grid-bg gradient-mesh min-h-[100dvh] overflow-x-clip bg-[var(--color-app-bg)] text-[var(--color-app-text)]">
      <AppSidebar />

      {/* Content is pushed right by the sidebar's width on large screens */}
      <div className="min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pl-[var(--sidebar-width)] lg:pb-0">
        <AppTopbar />
        <main className="min-w-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      <MobileAppNav />
    </div>
  );
}
