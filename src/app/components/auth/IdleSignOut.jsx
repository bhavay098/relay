"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000;
const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"];

export function IdleSignOut() {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const timeoutRef = useRef(null);
  const signOutRef = useRef(signOut);

  useEffect(() => {
    signOutRef.current = signOut;
  }, [signOut]);

  useEffect(() => {
    if (!isSignedIn) {
      return undefined;
    }

    let cancelled = false;

    const clearIdleTimer = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const scheduleSignOut = () => {
      clearIdleTimer();
      timeoutRef.current = window.setTimeout(() => {
        if (!cancelled) {
          signOutRef.current({ redirectUrl: "/sign-in" });
        }
      }, IDLE_TIMEOUT_MS);
    };

    scheduleSignOut();

    const handleActivity = () => {
      scheduleSignOut();
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      cancelled = true;
      clearIdleTimer();

      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [isSignedIn]);

  return null;
}
