"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect } from "react";
import { usePrefs } from "./prefs";
import type { Shell } from "./shell";
import { useOS } from "./store";
import styles from "./screensaver.module.css";

// The Mac's "hello" screen saver: after two minutes without activity on the
// desktop (or from the  menu), "hello" is written out in one cursive stroke.
// Any movement, click or key brings the desktop back.

const IDLE_MS = 120_000;
const ACTIVITY = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;

/** Drawn as a single stroke so it can be written out from left to right. */
const HELLO = "M40 190C70 180 112 128 128 84C140 50 138 22 120 22C100 22 96 60 96 110C96 150 94 178 92 196C104 160 122 132 146 132C168 132 166 160 164 176C162 192 172 198 190 192C212 184 236 166 250 146C262 128 256 112 240 116C220 122 214 160 226 182C238 200 270 196 292 172C318 144 344 90 346 54C348 28 334 18 322 30C306 48 304 120 310 168C314 196 336 200 356 184C380 164 404 110 406 72C408 44 394 32 382 44C366 62 366 130 372 170C376 196 398 200 418 186C432 176 440 162 446 150C452 132 470 124 486 128C510 134 516 170 496 188C478 204 452 196 456 172C460 148 486 128 508 132C528 136 548 136 572 120";

export function ScreenSaver({ shell }: { shell: Shell | null }) {
  const open = useOS(s => s.overlay === "screensaver");
  const overlay = useOS(s => s.overlay);
  const setOverlay = useOS(s => s.setOverlay);
  const enabled = usePrefs(s => s.screenSaver);

  // Start after a while without activity, unless another overlay is open or the tab is hidden.
  useEffect(() => {
    if (shell !== "desktop" || !enabled || overlay) return;
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (!document.hidden) setOverlay("screensaver"); }, IDLE_MS);
    };
    for (const type of ACTIVITY) window.addEventListener(type, arm, { passive: true });
    arm();
    return () => {
      clearTimeout(timer);
      for (const type of ACTIVITY) window.removeEventListener(type, arm);
    };
  }, [shell, enabled, overlay, setOverlay]);

  // Wake on real activity. The key or click that wakes it isn't passed on.
  useEffect(() => {
    if (!open) return;
    const shownAt = performance.now();
    let moved = 0;
    const wake = (event: Event) => {
      if (performance.now() - shownAt < 500) return;
      if (event instanceof PointerEvent && event.type === "pointermove") {
        moved += Math.abs(event.movementX) + Math.abs(event.movementY);
        if (moved < 10) return;
      }
      if (event.type === "keydown" || event.type === "pointerdown") {
        event.preventDefault();
        event.stopPropagation();
      }
      setOverlay(null);
    };
    for (const type of ACTIVITY) window.addEventListener(type, wake, { capture: true });
    return () => { for (const type of ACTIVITY) window.removeEventListener(type, wake, { capture: true }); };
  }, [open, setOverlay]);

  return <AnimatePresence>
    {open && <m.div
      key="screensaver"
      className={styles.saver}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1.2 } }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 640 240" className={styles.hello}>
        <path d={HELLO} pathLength={1} />
      </svg>
    </m.div>}
  </AnimatePresence>;
}
