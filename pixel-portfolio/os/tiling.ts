import type { Rect } from "./store";

// Window tiling, as in macOS Sequoia: halves, quarters, fill and centre, chosen
// by dragging to an edge or corner, from the green button or the Window menu.

export type Layout = "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "fill" | "centre";

export const layouts: { id: Layout; label: string }[] = [
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "top", label: "Top" },
  { id: "bottom", label: "Bottom" },
  { id: "top-left", label: "Top Left" },
  { id: "top-right", label: "Top Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "bottom-right", label: "Bottom Right" },
  { id: "fill", label: "Fill" },
  { id: "centre", label: "Centre" },
];

const GAP = 8;
const EDGE = 12;
const CORNER = 72;

export type Area = { left: number; top: number; w: number; h: number };

/** The space windows can use: the workspace, down to the top of the dock. */
export function usableArea(): Area | null {
  const main = document.getElementById("main");
  if (!main) return null;
  const box = main.getBoundingClientRect();
  const dock = document.querySelector('nav[aria-label="Dock"]')?.getBoundingClientRect();
  const h = dock && dock.height > 0 ? Math.min(box.height, dock.top - box.top) : box.height;
  return { left: box.left, top: box.top, w: box.width, h };
}

/** Where a window goes for a layout, in workspace coordinates. */
export function layoutRect(layout: Layout, area: Area, current: { w: number; h: number }): Rect {
  const { w: W, h: H } = area;
  const halfW = (W - GAP * 3) / 2, halfH = (H - GAP * 3) / 2;
  const right = GAP * 2 + halfW, lower = GAP * 2 + halfH;
  switch (layout) {
    case "left": return { x: GAP, y: GAP, w: halfW, h: H - GAP * 2 };
    case "right": return { x: right, y: GAP, w: halfW, h: H - GAP * 2 };
    case "top": return { x: GAP, y: GAP, w: W - GAP * 2, h: halfH };
    case "bottom": return { x: GAP, y: lower, w: W - GAP * 2, h: halfH };
    case "top-left": return { x: GAP, y: GAP, w: halfW, h: halfH };
    case "top-right": return { x: right, y: GAP, w: halfW, h: halfH };
    case "bottom-left": return { x: GAP, y: lower, w: halfW, h: halfH };
    case "bottom-right": return { x: right, y: lower, w: halfW, h: halfH };
    case "fill": return { x: GAP, y: GAP, w: W - GAP * 2, h: H - GAP * 2 };
    case "centre": {
      const w = Math.min(current.w, W - GAP * 2), h = Math.min(current.h, H - GAP * 2);
      return { x: (W - w) / 2, y: Math.max(GAP, (H - h) / 2), w, h };
    }
  }
}

/** The layout a window dragged with the pointer at (x, y) would snap to, if any. */
export function snapAt(clientX: number, clientY: number, area: Area): Layout | null {
  const x = clientX - area.left, y = clientY - area.top;
  const nearLeft = x <= EDGE, nearRight = x >= area.w - EDGE, nearTop = y <= EDGE;
  if (nearLeft || nearRight) {
    const side = nearLeft ? "left" : "right";
    if (y < CORNER) return `top-${side}`;
    if (y > area.h - CORNER) return `bottom-${side}`;
    return side;
  }
  if (nearTop) {
    if (x < CORNER) return "top-left";
    if (x > area.w - CORNER) return "top-right";
    return "fill";
  }
  return null;
}
