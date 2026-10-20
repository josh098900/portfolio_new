"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePrefs } from "./prefs";
import { apps, appIds, type AppId } from "./routes";
import type { Shell } from "./shell";
import { useOS, useOSStore } from "./store";
import { usableArea } from "./tiling";
import styles from "./mission-control.module.css";

// Mission Control spreads every open window out so you can pick one, and hot
// corners (Mac only) start it, the screen saver or Show Desktop.

type Cell = { app: AppId; x: number; y: number; w: number; h: number };

const windowEl = (app: AppId) => document.querySelector<HTMLElement>(`section[aria-labelledby="window-title-${app}"]`);

/** A grid of cells, one per window, each window scaled to fit its cell. */
function arrange(open: AppId[]): Cell[] {
  const area = usableArea();
  if (!area || open.length === 0) return [];
  const cols = Math.ceil(Math.sqrt(open.length)), rows = Math.ceil(open.length / cols);
  const pad = 56, cellW = (area.w - pad * 2) / cols, cellH = (area.h - pad * 2) / rows;
  return open.map((app, i) => {
    const el = windowEl(app)!;
    const scale = Math.min(1, (cellW * 0.86) / el.offsetWidth, (cellH * 0.78) / el.offsetHeight);
    const w = el.offsetWidth * scale, h = el.offsetHeight * scale;
    const col = i % cols, row = Math.floor(i / cols);
    // Centre a short last row.
    const inRow = row === rows - 1 ? open.length - row * cols : cols;
    const offset = ((cols - inRow) * cellW) / 2;
    return { app, w, h, x: area.left + pad + offset + col * cellW + (cellW - w) / 2, y: area.top + pad + row * cellH + (cellH - h) / 2 };
  });
}

export function MissionControl({ shell }: { shell: Shell | null }) {
  const active = useOS(s => s.overlay === "mission-control");
  const setOverlay = useOS(s => s.setOverlay);
  const focus = useOS(s => s.focus);
  const visible = useOS(useShallow(s => appIds.filter(app => s.windows[app] && !s.windows[app]!.minimised).sort((a, b) => s.windows[a]!.z - s.windows[b]!.z)));
  const [cells, setCells] = useState<Cell[]>([]);
  const running = useRef(new Map<AppId, Animation>());

  // Fly each window to its cell, and back again on the way out.
  useLayoutEffect(() => {
    if (!active || shell !== "desktop") return;
    const layout = arrange(visible);
    setCells(layout);
    const animations = running.current;
    for (const cell of layout) {
      const el = windowEl(cell.app);
      if (!el) continue;
      const box = el.getBoundingClientRect();
      const scale = cell.w / box.width;
      const dx = cell.x - box.left, dy = cell.y - box.top;
      el.style.transformOrigin = "0 0";
      animations.set(cell.app, el.animate([{ transform: "none" }, { transform: `translate(${dx}px, ${dy}px) scale(${scale})` }], { duration: 380, easing: "cubic-bezier(0.2, 0.9, 0.25, 1)", fill: "forwards" }));
    }
    document.documentElement.dataset.missionControl = "";
    return () => {
      delete document.documentElement.dataset.missionControl;
      setCells([]);
      for (const [app, animation] of animations) {
        animation.reverse();
        animation.finished.then(() => { animation.cancel(); const el = windowEl(app); if (el) el.style.transformOrigin = ""; }, () => {});
      }
      animations.clear();
    };
    // The arrangement is taken once, when Mission Control opens.
  }, [active, shell]);

  if (!active || shell !== "desktop") return null;
  const pick = (app: AppId) => { setOverlay(null); focus(app); };

  return <div className={styles.mission} role="dialog" aria-label="Mission Control" onClick={() => setOverlay(null)}>
    {cells.length === 0 && <p className={styles.empty}>No open windows</p>}
    {cells.map(cell => <button key={cell.app} type="button" className={styles.cell}
      style={{ left: cell.x, top: cell.y, width: cell.w, height: cell.h }}
      onClick={e => { e.stopPropagation(); pick(cell.app); }}>
      <span className={styles.label}>{apps[cell.app].name}</span>
    </button>)}
  </div>;
}

let stashed: AppId[] = [];

/** Hot corners on the Mac: top left Mission Control, bottom left the screen saver, bottom right Show Desktop. */
export function useHotCorners(shell: Shell | null) {
  const store = useOSStore();
  const enabled = usePrefs(s => s.hotCorners);
  useEffect(() => {
    if (shell !== "desktop" || !enabled) return;
    let armed = true, timer: ReturnType<typeof setTimeout> | undefined;
    const ZONE = 4, REARM = 80;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const { clientX: x, clientY: y } = event, w = innerWidth, h = innerHeight;
      const corner = x <= ZONE && y <= ZONE ? "top-left" : x <= ZONE && y >= h - ZONE ? "bottom-left" : x >= w - ZONE && y >= h - ZONE ? "bottom-right" : null;
      if (!corner) {
        clearTimeout(timer);
        if (!armed && x > REARM && y > REARM && x < w - REARM && y < h - REARM) armed = true;
        return;
      }
      if (!armed) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        armed = false;
        const state = store.getState();
        if (corner === "top-left") state.toggleOverlay("mission-control");
        else if (corner === "bottom-left") state.setOverlay("screensaver");
        else showDesktop(store.getState);
      }, 120);
    };
    window.addEventListener("pointermove", onMove);
    return () => { clearTimeout(timer); window.removeEventListener("pointermove", onMove); };
  }, [shell, enabled, store]);
}

/** Moves every window aside to show the desktop, or brings them back. */
export function showDesktop(get: ReturnType<typeof useOSStore>["getState"]) {
  const state = get();
  const showing = appIds.filter(app => state.windows[app] && !state.windows[app]!.minimised);
  if (showing.length) {
    stashed = showing.sort((a, b) => state.windows[a]!.z - state.windows[b]!.z);
    for (const app of stashed) state.minimise(app);
  } else {
    for (const app of stashed) if (get().windows[app]) get().open({ app, sub: get().windows[app]!.sub });
    stashed = [];
  }
}
