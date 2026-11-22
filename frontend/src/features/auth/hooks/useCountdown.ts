"use client";

import { useEffect, useState } from "react";

/**
 * Seconds left until `seconds` after the last (re)start; starts running on mount.
 * Counts against the clock (not tick by tick), so a slow or background tab stays accurate.
 */
export function useCountdown(seconds: number) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= endsAt) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [endsAt]);

  const restart = () => {
    const t = Date.now();
    setNow(t);
    setEndsAt(t + seconds * 1000);
  };

  return { secondsLeft: Math.max(0, Math.ceil((endsAt - now) / 1000)), restart };
}

/** 42 → "0:42". */
export const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
