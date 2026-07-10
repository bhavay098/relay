"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "relay-theme";

function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.75v2.5" />
      <path d="M12 18.75v2.5" />
      <path d="M4.93 4.93l1.77 1.77" />
      <path d="M17.3 17.3l1.77 1.77" />
      <path d="M2.75 12h2.5" />
      <path d="M18.75 12h2.5" />
      <path d="M4.93 19.07l1.77-1.77" />
      <path d="M17.3 6.7l1.77-1.77" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.5 14.1a8.1 8.1 0 1 1-10.6-10.6 9.4 9.4 0 1 0 10.6 10.6Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";

    setTheme(nextTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [mounted, theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-app-border)] bg-[var(--color-app-surface)] text-[var(--color-app-text)] transition hover:bg-[var(--color-app-surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-app-border-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-app-bg)]"
      aria-label="Toggle color theme"
    >
      {mounted && theme === "dark" ? <SunIcon /> : mounted ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
