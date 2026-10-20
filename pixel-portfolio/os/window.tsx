"use client";

import { m, useReducedMotion } from "motion/react";
import { memo, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { AppContent } from "@/apps";
import { usePrefs } from "./prefs";
import { apps } from "./routes";
import type { Shell } from "./shell";
import { useOS, type Rect, type WindowState } from "./store";
import { layoutRect, layouts, snapAt, usableArea, type Layout } from "./tiling";
import styles from "./window.module.css";

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const edges: Edge[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
const interactive = "button, a, input, textarea, select, [role=button], [data-no-drag]";

type Snap = { move: (event: PointerEvent) => void; end: () => Rect | null };

/** Drags or resizes by writing styles directly, then commits once on release (or snaps into a tile). */
function track(event: ReactPointerEvent, el: HTMLElement, apply: (dx: number, dy: number, start: Rect, bounds: DOMRect) => Rect, commit: (rect: Rect) => void, snap?: Snap) {
  const bounds = (el.offsetParent as HTMLElement).getBoundingClientRect();
  const start: Rect = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
  const origin = { x: event.clientX, y: event.clientY };
  let rect = start;
  document.documentElement.dataset.dragging = "";

  const move = (e: PointerEvent) => {
    rect = apply(e.clientX - origin.x, e.clientY - origin.y, start, bounds);
    Object.assign(el.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` });
    snap?.move(e);
  };
  const end = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    delete document.documentElement.dataset.dragging;
    const snapped = snap?.end();
    if (snapped) commit(snapped);
    else if (rect !== start) commit(rect);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * The genie effect, as keyframes for the Web Animations API. A funnel runs from
 * the window down to its dock icon: first the window stretches into it, its
 * sides curving in to the icon's width, then it pours through the neck.
 */
function genieFrames(win: DOMRect, icon: DOMRect): Keyframe[] {
  const ease = (t: number) => t * t * (3 - 2 * t);
  const between = (from: number, to: number, t: number) => from + (to - from) * t;
  const ramp = (start: number, t: number) => ease(clamp((t - start) / (1 - start), 0, 1));
  const top = win.top, neck = icon.top + icon.height * 0.35;
  const centre = win.left + win.width / 2, iconCentre = icon.left + icon.width / 2;
  // The funnel's left and right edges at depth u (0 at the window's top, 1 at the icon).
  const edges = (u: number, strength: number) => {
    const width = between(win.width, between(win.width, icon.width * 0.9, ramp(0.12, u)), strength);
    const middle = between(centre, between(centre, iconCentre, ramp(0.05, u)), strength);
    return [middle - width / 2 - win.left, middle + width / 2 - win.left];
  };
  const frames: Keyframe[] = [];
  for (let i = 0; i <= 14; i++) {
    const p = i / 14;
    const stretch = ease(clamp(p / 0.42, 0, 1));
    const pour = ease(clamp((p - 0.42) / 0.58, 0, 1));
    const upper = between(top, neck, pour);
    const lower = between(win.bottom, neck + 4, stretch);
    const height = Math.max(lower - upper, 0.5);
    // Sample both sides of the funnel along the window's current extent.
    const left: string[] = [], right: string[] = [];
    for (let j = 0; j <= 12; j++) {
      const v = j / 12;
      const u = clamp((upper + v * height - top) / Math.max(neck - top, 1), 0, 1);
      const [l, r] = edges(u, stretch);
      const y = `${(v * 100).toFixed(2)}%`;
      left.push(`${l.toFixed(1)}px ${y}`);
      right.unshift(`${r.toFixed(1)}px ${y}`);
    }
    frames.push({
      offset: p,
      transform: `translateY(${(upper - top).toFixed(1)}px) scaleY(${(height / win.height).toFixed(4)})`,
      clipPath: `polygon(${[...left, ...right].join(", ")})`,
      opacity: p < 0.85 ? 1 : between(1, 0, (p - 0.85) / 0.15),
    });
  }
  return frames;
}

/** The same path played backwards, for restoring from the dock. */
const reversed = (frames: Keyframe[]) => frames.slice().reverse().map(f => ({ ...f, offset: 1 - (f.offset as number) }));

/** A tiny screen with the layout's area filled in, for the Move & Resize menu. */
function LayoutIcon({ layout }: { layout: Layout }) {
  const area: Record<Layout, [number, number, number, number]> = {
    left: [0, 0, 11, 15], right: [11, 0, 11, 15], top: [0, 0, 22, 7.5], bottom: [0, 7.5, 22, 7.5],
    "top-left": [0, 0, 11, 7.5], "top-right": [11, 0, 11, 7.5], "bottom-left": [0, 7.5, 11, 7.5], "bottom-right": [11, 7.5, 11, 7.5],
    fill: [0, 0, 22, 15], centre: [5, 3, 12, 9],
  };
  const [x, y, w, h] = area[layout];
  return <svg viewBox="-1 -1 24 17" width="26" height="19" aria-hidden="true">
    <rect x="0" y="0" width="22" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <rect x={x + 1.5} y={y + 1.5} width={w - 3} height={h - 3} rx="1.5" fill="currentColor" />
  </svg>;
}

function TrafficLights({ app, zoomed, onTile }: { app: WindowState["app"]; zoomed: boolean; onTile: (layout: Layout) => void }) {
  const close = useOS(s => s.close);
  const minimise = useOS(s => s.minimise);
  const toggleZoom = useOS(s => s.toggleZoom);
  const name = apps[app].name;
  const [menu, setMenu] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Like macOS, resting on the green button offers ways to arrange the window.
  const hover = (open: boolean, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMenu(open), delay);
  };
  return <div className={styles.lights} data-no-drag onPointerLeave={e => e.pointerType === "mouse" && hover(false, 250)}>
    <button type="button" className={styles.close} aria-label={`Close ${name}`} onClick={() => close(app)}>
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 3.5l5 5m0-5-5 5" /></svg>
    </button>
    <button type="button" className={styles.minimise} aria-label={`Minimise ${name}`} onClick={() => minimise(app)}>
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.8 6h6.4" /></svg>
    </button>
    <button type="button" className={styles.zoom} aria-label={zoomed ? `Restore ${name}` : `Zoom ${name}`} onClick={() => { setMenu(false); toggleZoom(app); }}
      onPointerEnter={e => e.pointerType === "mouse" && hover(true, 450)}>
      <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.3 6.9V3.3h3.6zM8.7 5.1v3.6H5.1z" className={styles.fill} /></svg>
    </button>
    {menu && <div className={`${styles.tileMenu} glass`} role="menu" aria-label="Move and Resize" onPointerEnter={() => hover(true, 0)}
      onKeyDown={e => { if (e.key === "Escape") setMenu(false); }}>
      <p className={styles.tileHeading}>Move &amp; Resize</p>
      <div className={styles.tileGrid}>
        {layouts.filter(l => l.id !== "fill" && l.id !== "centre").map(l => <button key={l.id} type="button" role="menuitem" aria-label={`Tile ${l.label}`} title={l.label}
          onClick={() => { setMenu(false); onTile(l.id); }}><LayoutIcon layout={l.id} /></button>)}
      </div>
      <p className={styles.tileHeading}>Fill &amp; Arrange</p>
      <div className={styles.tileRow}>
        {(["fill", "centre"] as const).map(id => <button key={id} type="button" role="menuitem" onClick={() => { setMenu(false); onTile(id); }}>
          <LayoutIcon layout={id} />{id === "fill" ? "Fill" : "Centre"}
        </button>)}
      </div>
    </div>}
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
  const reduceMotion = usePrefs(s => s.reduceMotion);
  const deviceStill = useReducedMotion();
  const genie = desktop && !reduceMotion && !deviceStill;
  const genieAnimation = useRef<Animation | null>(null);
  const spatial = usePrefs(s => s.spatial) && desktop;

  // visionOS mode: windows turn towards you by where they sit, and those behind recede.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!spatial) {
      el.style.removeProperty("--spatial-angle");
      el.style.removeProperty("--spatial-depth");
      return;
    }
    const place = () => {
      const parent = el.offsetParent as HTMLElement | null;
      if (!parent) return;
      const centre = (el.offsetLeft + el.offsetWidth / 2) / parent.clientWidth - 0.5;
      el.style.setProperty("--spatial-angle", `${(-centre * 18).toFixed(2)}deg`);
      el.style.setProperty("--spatial-depth", focused ? "0px" : "-110px");
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [spatial, focused, win.rect, win.zoomed]);
  const settled = useRef(false);

  // Minimising on the Mac pours the window into its dock icon; restoring pours it back.
  useLayoutEffect(() => {
    if (!settled.current) { settled.current = true; return; }
    const el = ref.current;
    const icon = document.querySelector<HTMLElement>(`[data-dock-app="${win.app}"]`);
    const previous = genieAnimation.current;
    // Measure the window as it really is, not mid-genie.
    previous?.cancel();
    genieAnimation.current = null;
    if (!genie || !el) return;
    // Without a dock icon to pour into, slip down and fade instead.
    const frames = icon
      ? genieFrames(el.getBoundingClientRect(), icon.getBoundingClientRect())
      : [{ offset: 0, opacity: 1, transform: "none" }, { offset: 1, opacity: 0, transform: "translateY(40vh) scale(0.3)" }];
    if (win.minimised) {
      el.style.transformOrigin = "50% 0";
      genieAnimation.current = el.animate(frames, { duration: 680, easing: "cubic-bezier(0.4, 0, 0.6, 1)", fill: "forwards" });
    } else if (previous) {
      el.style.transformOrigin = "50% 0";
      const back = el.animate(reversed(frames), { duration: 600, easing: "cubic-bezier(0.3, 0, 0.4, 1)" });
      back.finished.then(() => { el.style.transformOrigin = ""; }, () => {});
    }
  }, [win.minimised, genie, win.app]);

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    focus(win.app);
    const target = event.target as HTMLElement;
    if (!desktop || event.button !== 0 || !ref.current) return;
    if (!target.closest("[data-drag-region]") || target.closest(interactive)) return;
    event.preventDefault();
    const el = ref.current;
    const area = usableArea();
    let landing: Layout | null = null;
    let preview: HTMLDivElement | null = null;
    // Dragging to an edge or corner shows where the window will tile, as on a Mac.
    const snap: Snap | undefined = area ? {
      move: e => {
        const next = snapAt(e.clientX, e.clientY, area);
        if (next === landing) return;
        landing = next;
        if (!next) { preview?.remove(); preview = null; return; }
        const r = layoutRect(next, area, { w: el.offsetWidth, h: el.offsetHeight });
        if (!preview) {
          preview = document.createElement("div");
          preview.className = `${styles.snapPreview} glass`;
          preview.style.zIndex = String(win.z);
          el.before(preview);
        }
        Object.assign(preview.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
      },
      end: () => {
        preview?.remove();
        if (!landing) return null;
        window.dispatchEvent(new CustomEvent("josh:achieve", { detail: "tiling" }));
        return layoutRect(landing, area, { w: el.offsetWidth, h: el.offsetHeight });
      },
    } : undefined;
    track(event, el, (dx, dy, start, bounds) => ({
      ...start,
      x: clamp(start.x + dx, 80 - start.w, bounds.width - 80),
      y: clamp(start.y + dy, 0, bounds.height - 40),
    }), rect => setRect(win.app, rect), snap);
  }

  function tile(layout: Layout) {
    const area = usableArea(), el = ref.current;
    if (!area || !el) return;
    setRect(win.app, layoutRect(layout, area, { w: el.offsetWidth, h: el.offsetHeight }));
    if (layout !== "fill" && layout !== "centre") window.dispatchEvent(new CustomEvent("josh:achieve", { detail: "tiling" }));
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
    data-minimised={win.minimised || undefined}
    inert={win.minimised || (!desktop && shell !== null && !focused)}
    onPointerDown={onPointerDown}
    onDoubleClick={onDoubleClick}
    initial={hidden}
    animate={win.minimised && !genie ? hidden : { opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: desktop ? 0.92 : 0.88, transition: { duration: 0.18 } }}
    transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.9 }}
  >
    <h2 id={titleId} className={styles.srOnly}>{info.name}</h2>
    <TrafficLights app={win.app} zoomed={win.zoomed} onTile={tile} />
    <div className={styles.content}>
      <AppContent app={win.app} sub={win.sub} navigate={sub => navigate(win.app, sub)} />
    </div>
    {desktop && !win.zoomed && edges.map(edge => <div key={edge} className={styles.resize} data-edge={edge} onPointerDown={e => onResizeStart(edge, e)} aria-hidden="true" />)}
  </m.section>;
});
