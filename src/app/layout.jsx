import { Inter } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import "@/globals.css";
import { Agentation } from "agentation";
import { IdleSignOut } from "./components/auth/IdleSignOut";
import { ToastProvider } from "./components/ToastProvider";
import { GlobalCommandShell } from "./components/GlobalCommandShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Relay — AI Powered Gmail & Calendar",
  description:
    "A premium Gmail and Google Calendar workflow app powered by Corsair. Manage emails, schedule events, and chat with an AI agent — all from one blazing-fast interface.",
  keywords: ["email", "calendar", "gmail", "google calendar", "corsair", "AI", "productivity"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" ui={ui}>
      <html lang="en" data-scroll-behavior="smooth" className={inter.variable} suppressHydrationWarning>
        <head>
          <meta name="darkreader-lock" />
          <Script id="relay-theme-init" strategy="beforeInteractive">
            {`
              (function () {
                try {
                  var theme = localStorage.getItem('relay-theme');
                  if (theme !== 'light' && theme !== 'dark') {
                    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `}
          </Script>
        </head>
        <body className="min-h-[100dvh] overflow-x-clip bg-[var(--color-app-bg)] text-[var(--color-app-text)] antialiased transition-colors duration-300">
          <ToastProvider>
            {children}
            <GlobalCommandShell />
          </ToastProvider>
          <IdleSignOut />
          {process.env.NODE_ENV === "development" && (
            <Agentation className="agentation-toolbar" />
          )}
        </body>
      </html>
    </ClerkProvider>
  );
}
