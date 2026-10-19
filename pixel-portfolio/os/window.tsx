"use client";

import { m } from "motion/react";
import { memo, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { AppContent } from "@/apps";
import { apps } from "./routes";
import type { Shell } from "./shell";
import { useOS, type Rect, type WindowState } from "./store";
import styles from "./window.module.css";

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const edges: Edge[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
const interactive = "button, a, input, textarea, select, [role=button], [data-no-drag]";

/** Drags or resizes by writing styles directly, then commits once on release. */
function track(event: ReactPointerEvent, el: HTMLElement, apply: (dx: number, dy: number, start: Rect, bounds: DOMRect) => Rect, commit: (rect: Rect) => void) {
  const bounds = (el.offsetParent as HTMLElement).getBoundingClientRect();
  const start: Rect = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
  const origin = { x: event.clientX, y: event.clientY };
  let rect = start;
  document.documentElement.dataset.dragging = "";

  const move = (e: PointerEvent) => {
    rect = apply(e.clientX - origin.x, e.clientY - origin.y, start, bounds);
    Object.assign(el.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` });
  };
  const end = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    delete document.documentElement.dataset.dragging;
    if (rect !== start) commit(rect);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function TrafficLights({ app, zoomed }: { app: WindowState["app"]; zoomed: boolean }) {
  const close = useOS(s => s.close);
  const minimise = useOS(s => s.minimise);
  const toggleZoom = useOS(s => s.toggleZoom);
  const name = apps[app].name;
  return <div className={styles.lights} data-no-drag>
    <button type="button" className={styles.close} aria-label={`Close ${name}`} onClick={() => close(app)}>
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 3.5l5 5m0-5-5 5" /></svg>
    </button>
    <button type="button" className={styles.minimise} aria-label={`Minimise ${name}`} onClick={() => minimise(app)}>
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.8 6h6.4" /></svg>
    </button>
    <button type="button" className={styles.zoom} aria-label={zoomed ? `Restore ${name}` : `Zoom ${name}`} onClick={() => toggleZoom(app)}>
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.3 6.9V3.3h3.6zM8.7 5.1v3.6H5.1z" className={styles.fill} /></svg>
    </button>
  </div>;
}

export const Window = memo(function Window({ window: win, focused, shell }: { window: WindowState; focused: boolean; shell: Shell | null }) {
  const ref = useRef<HTMLElement>(null);
  const focus = useOS(s => s.focus);
  const setRect = useOS(s => s.setRect);
  const toggleZoom = useOS(s => s.toggleZoom);
  const navigate = useOS(s => s.navigate);
  const info = apps[win.app];
  const desktop = shell === "desktop";
  const titleId = `window-title-${win.app}`;

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    focus(win.app);
    const target = event.target as HTMLElement;
    if (!desktop || event.button !== 0 || !ref.current) return;
    if (!target.closest("[data-drag-region]") || target.closest(interactive)) return;
    event.preventDefault();
    track(event, ref.current, (dx, dy, start, bounds) => ({
      ...start,
      x: clamp(start.x + dx, 80 - start.w, bounds.width - 80),
      y: clamp(start.y + dy, 0, bounds.height - 40),
    }), rect => setRect(win.app, rect));
  }

  function onResizeStart(edge: Edge, event: ReactPointerEvent) {
    if (!ref.current || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    focus(win.app);
    const { w: minW, h: minH } = info.minSize;
    track(event, ref.current, (dx, dy, start, bounds) => {
      let { x, y, w, h } = start;
      if (edge.includes("e")) w = clamp(start.w + dx, minW, bounds.width - start.x);
      if (edge.includes("s")) h = clamp(start.h + dy, minH, bounds.height - start.y);
      if (edge.includes("w")) { w = clamp(start.w - dx, minW, start.x + start.w); x = start.x + start.w - w; }
      if (edge.includes("n")) { h = clamp(start.h - dy, minH, start.y + start.h); y = start.y + start.h - h; }
      return { x, y, w, h };
    }, rect => setRect(win.app, rect));
  }

  function onDoubleClick(event: React.MouseEvent) {
    const target = event.target as HTMLElement;
    if (desktop && target.closest("[data-drag-region]") && !target.closest(interactive)) toggleZoom(win.app);
  }

  const placed = desktop && win.rect && !win.zoomed;
  const style = {
    "--w": `${info.size.w}px`,
    "--h": `${info.size.h}px`,
    "--slot": win.slot,
    zIndex: win.z,
    ...(placed ? { left: win.rect!.x, top: win.rect!.y, width: win.rect!.w, height: win.rect!.h } : null),
  } as CSSProperties;

  // Minimised windows stay mounted (keeping their state) and are made inert, which
  // also removes them from hit-testing and the accessibility tree.
  const hidden = { opacity: 0, scale: desktop ? 0.3 : 0.88, y: desktop ? "45vh" : 0 };

  return <m.section
    ref={ref}
    className={styles.window}
    style={style}
    aria-labelledby={titleId}
    data-focused={focused || undefined}
    data-zoomed={win.zoomed || undefined}
    inert={win.minimised || (!desktop && shell !== null && !focused)}
    onPointerDown={onPointerDown}
    onDoubleClick={onDoubleClick}
    initial={hidden}
    animate={win.minimised ? hidden : { opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: desktop ? 0.92 : 0.88, transition: { duration: 0.18 } }}
    transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.9 }}
  >
    <h2 id={titleId} className={styles.srOnly}>{info.name}</h2>
    <TrafficLights app={win.app} zoomed={win.zoomed} />
    <div className={styles.content}>
      <AppContent app={win.app} sub={win.sub} navigate={sub => navigate(win.app, sub)} />
    </div>
    {desktop && !win.zoomed && edges.map(edge => <div key={edge} className={styles.resize} data-edge={edge} onPointerDown={e => onResizeStart(edge, e)} aria-hidden="true" />)}
  </m.section>;
});
