"use client";

import { useEffect, useSyncExternalStore } from "react";

export type Shell = "phone" | "tablet" | "desktop";

// Width alone would hand a landscape iPad the desktop, so touch-first
// devices are capped at the tablet shell. Keep in sync with os/preflight.ts.
function detect(): Shell {
  const w = innerWidth, h = innerHeight, coarse = matchMedia("(pointer: coarse)").matches;
  if (w < 640 || (coarse && Math.min(w, h) < 500)) return "phone";
  if (w < 1024 || coarse) return "tablet";
  return "desktop";
}

function subscribe(onChange: () => void) {
  const coarse = matchMedia("(pointer: coarse)");
  window.addEventListener("resize", onChange);
  coarse.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    coarse.removeEventListener("change", onChange);
  };
}

/** Null during server rendering and hydration; CSS handles layout until then. */
export function useShell(): Shell | null {
  const shell = useSyncExternalStore(subscribe, detect, () => null);
  useEffect(() => {
    if (shell) document.documentElement.dataset.shell = shell;
  }, [shell]);
  return shell;
}
