"use client";

import { useEffect } from "react";
import { usePrefs } from "./prefs";
import type { Shell } from "./shell";

// visionOS mode for the Mac. The look is CSS (globals.css, under
// html[data-spatial]); this keeps the parallax following the pointer and
// borrows dark glass while it's on.

export function useSpatial(shell: Shell | null) {
  const spatial = usePrefs(s => s.spatial);
  const active = spatial && shell === "desktop";

  useEffect(() => {
    const root = document.documentElement;
    if (!active) return;
    root.dataset.spatial = "";
    root.dataset.theme = "dark";
    window.dispatchEvent(new CustomEvent("josh:achieve", { detail: "spatial" }));

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / innerWidth - 0.5, y = event.clientY / innerHeight - 0.5;
        root.style.setProperty("--tilt-x", `${(x * 6).toFixed(2)}deg`);
        root.style.setProperty("--tilt-y", `${(-y * 4).toFixed(2)}deg`);
        root.style.setProperty("--parallax-x", `${(-x * 24).toFixed(1)}px`);
        root.style.setProperty("--parallax-y", `${(-y * 16).toFixed(1)}px`);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      delete root.dataset.spatial;
      for (const name of ["--tilt-x", "--tilt-y", "--parallax-x", "--parallax-y"]) root.style.removeProperty(name);
      // Back to the visitor's own appearance.
      const { themeMode } = usePrefs.getState();
      if (themeMode === "auto") root.dataset.theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      else root.dataset.theme = themeMode;
    };
  }, [active]);

  return active;
}
