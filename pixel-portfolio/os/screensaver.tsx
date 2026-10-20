"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
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

/**
 * "hello" as a tube of liquid glass: a lighting filter gives it a curved
 * surface with a bright rim and highlights, a soft shadow and a band of
 * focused light sit beneath it, and a slow ripple keeps it liquid.
 */
function GlassHello({ still }: { still: boolean }) {
  return <svg viewBox="0 0 640 240" className={styles.hello}>
    <defs>
      <filter id="hello-soft" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
      <filter id="hello-glass" x="-10%" y="-20%" width="120%" height="140%" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceAlpha" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 30 0" result="shape" />
        <feGaussianBlur in="shape" stdDeviation="5" result="soft" />
        <feSpecularLighting in="soft" surfaceScale="7" specularConstant="0.95" specularExponent="38" lightingColor="#fff" result="light">
          <feDistantLight azimuth="235" elevation="40" />
        </feSpecularLighting>
        <feComposite in="light" in2="shape" operator="in" result="shine" />
        <feMorphology in="shape" operator="erode" radius="1.4" result="inner" />
        <feComposite in="shape" in2="inner" operator="out" result="ring" />
        <feFlood floodColor="#fff" floodOpacity="0.75" />
        <feComposite in2="ring" operator="in" result="rim" />
        <feOffset in="shape" dy="-5" result="up" />
        <feComposite in="shape" in2="up" operator="out" result="lower" />
        <feGaussianBlur in="lower" stdDeviation="2.5" result="lowerSoft" />
        <feFlood floodColor="#1a1440" floodOpacity="0.28" />
        <feComposite in2="lowerSoft" operator="in" result="depth" />
        <feComposite in="depth" in2="shape" operator="in" result="depthIn" />
        <feGaussianBlur in="shape" stdDeviation="3" result="edgeSoft" />
        <feComposite in="shape" in2="edgeSoft" operator="arithmetic" k2="1" k3="-1" result="innerEdge" />
        <feFlood floodColor="#fff" floodOpacity="0.32" />
        <feComposite in2="innerEdge" operator="in" result="glow" />
        <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="depthIn" /><feMergeNode in="glow" /><feMergeNode in="rim" /><feMergeNode in="shine" /></feMerge>
      </filter>
      <filter id="hello-liquid" x="-5%" y="-10%" width="110%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="4" result="noise">
          {!still && <animate attributeName="baseFrequency" dur="7s" values="0.012 0.02;0.016 0.026;0.012 0.02" repeatCount="indefinite" />}
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
    <g filter="url(#hello-liquid)" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path className={styles.stroke} d={HELLO} pathLength={1} stroke="rgb(20 20 60 / 0.35)" strokeWidth={26} transform="translate(0 12)" filter="url(#hello-soft)" />
      <path className={`${styles.stroke} ${styles.caustic}`} d={HELLO} pathLength={1} stroke="rgb(255 255 255 / 0.5)" strokeWidth={12} transform="translate(4 18)" filter="url(#hello-soft)" />
      <path className={styles.stroke} d={HELLO} pathLength={1} stroke="rgb(255 255 255 / 0.07)" strokeWidth={28} filter="url(#hello-glass)" />
    </g>
  </svg>;
}

export function ScreenSaver({ shell }: { shell: Shell | null }) {
  const open = useOS(s => s.overlay === "screensaver");
  const overlay = useOS(s => s.overlay);
  const setOverlay = useOS(s => s.setOverlay);
  const enabled = usePrefs(s => s.screenSaver);
  const still = usePrefs(s => s.reduceMotion) || Boolean(useReducedMotion());

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
      <GlassHello still={still} />
    </m.div>}
  </AnimatePresence>;
}
