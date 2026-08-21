"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

const ToastContext = createContext({
  toast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Keep maximum 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const api = useMemo(
    () => ({
      toast: (msg, duration) => addToast(msg, "default", duration),
      showSuccess: (msg, duration) => addToast(msg, "success", duration),
      showError: (msg, duration) => addToast(msg, "error", duration),
      showInfo: (msg, duration) => addToast(msg, "info", duration),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast container floating in bottom-right on desktop, bottom-center on mobile */}
      <aside
        aria-label="Notification alerts"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-50 flex flex-col items-center gap-2.5 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className="animate-fadeInUp pointer-events-auto flex max-w-md items-center gap-3 rounded-[18px] border border-[var(--color-app-border-strong)] bg-[var(--color-app-panel-strong)] px-4 py-3 text-xs font-medium text-[var(--color-app-text)] shadow-[0_16px_36px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-colors"
          >
            {item.type === "success" && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(16,185,129,0.18)] text-[var(--color-success)]">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            {item.type === "error" && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(239,68,68,0.18)] text-[var(--color-error)]">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            {item.type === "info" && (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-app-accent-soft)] text-[var(--color-app-text)]">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            {item.type === "default" && (
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-[var(--color-app-accent)]" />
            )}

            <span className="min-w-0 flex-1 leading-snug">{item.message}</span>

            <button
              type="button"
              onClick={() => removeToast(item.id)}
              aria-label="Dismiss notification"
              className="ml-1 -mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--color-app-text-soft)] transition hover:bg-[var(--color-app-surface)] hover:text-[var(--color-app-text)]"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
