import { Inter, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Agentation } from "agentation";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
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
      <html
        lang="en"
        className={`${inter.variable} ${geistMono.variable} dark`}
      >
        <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
          {children}
          {process.env.NODE_ENV === "development" && <Agentation />}
        </body>
      </html>
    </ClerkProvider>
  );
}
