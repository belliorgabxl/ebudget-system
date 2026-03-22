"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// Inactivity timeout: 30 minutes
const INACTIVE_MS = 30 * 60 * 1000;
// Proactive refresh: if token expires within 5 minutes, refresh now
const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000;
// How often to check token expiry (every 60 seconds)
const CHECK_INTERVAL_MS = 60 * 1000;

const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

function getTokenExp(): number | null {
  // auth_token is httpOnly, so we read from a lightweight non-httpOnly indicator
  // OR we parse the exp from a cookie we control.
  // Since we don't have a readable exp cookie, we'll rely on the
  // /api/auth/refresh endpoint returning 401 as the signal.
  // This function reads a "token_exp" cookie set during login/refresh.
  const match = document.cookie.match(/(?:^|;\s*)token_exp=([^;]+)/);
  if (!match) return null;
  return parseInt(match[1], 10) || null;
}

export default function SessionGuard() {
  const router = useRouter();
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const logout = useCallback(() => {
    router.push("/login?reason=inactive");
  }, [router]);

  const tryRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(logout, INACTIVE_MS);
  }, [logout]);

  // Check token expiry periodically and proactively refresh
  const checkAndRefresh = useCallback(async () => {
    const exp = getTokenExp();
    if (exp !== null) {
      const msLeft = exp * 1000 - Date.now();
      if (msLeft <= 0) {
        // Already expired — try refresh
        const ok = await tryRefresh();
        if (!ok) logout();
      } else if (msLeft <= REFRESH_BEFORE_EXPIRY_MS) {
        // Proactively refresh while token still valid
        await tryRefresh();
      }
    } else {
      // No exp cookie — just silently try refresh to probe status
      // (only if user is actively using the app)
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs < INACTIVE_MS) {
        const ok = await tryRefresh();
        if (!ok) {
          // Refresh failed: middleware will redirect on next navigation
          // Don't force-logout here; let middleware handle it
        }
      }
    }
  }, [tryRefresh, logout]);

  useEffect(() => {
    // Start inactivity timer
    resetInactivityTimer();

    // Attach activity listeners
    const handleActivity = () => resetInactivityTimer();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));

    // Periodic token check
    checkIntervalRef.current = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [resetInactivityTimer, checkAndRefresh]);

  return null;
}
