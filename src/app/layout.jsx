import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Agentation } from "agentation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Relay — Superhuman-Style Email & Calendar",
  description:
    "A premium Gmail and Google Calendar workflow app powered by Corsair. Manage emails, schedule events, and chat with an AI agent — all from one blazing-fast interface.",
  keywords: ["email", "calendar", "gmail", "google calendar", "corsair", "AI", "productivity"],
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
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
              `,
            }}
          />
        </head>
        <body className="min-h-screen bg-[var(--color-app-bg)] text-[var(--color-app-text)] antialiased transition-colors duration-300">
          {children}
          {process.env.NODE_ENV === "development" && <Agentation />}
        </body>
      </html>
    </ClerkProvider>
  );
}
