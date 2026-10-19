"use client";

import { useEffect } from "react";

// Real Liquid Glass bends what's behind it at the edges, like a lens. Chromium
// can run an SVG displacement filter as a backdrop filter, so on desktop Chrome
// and Edge each glass surface marked data-liquid (the dock and the desktop
// widgets, which carry little text) gets one, shaped to its own size and corner
// radius. Elsewhere, and on surfaces with text over busy windows, glass stays frosted.

const NS = "http://www.w3.org/2000/svg";
const MIN_SIZE = 40;

function supported() {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands ?? [];
  return brands.some(b => b.brand === "Chromium")
    && matchMedia("(pointer: fine)").matches
    && !matchMedia("(prefers-reduced-transparency: reduce)").matches;
}

/**
 * One axis of the displacement map, in grey: neutral in the middle, pushing
 * inwards near both edges, so the rim magnifies what's behind it.
 */
function lensMap(width: number, height: number, radius: number, axis: "x" | "y") {
  const size = axis === "x" ? width : height;
  const f = Math.max(10, Math.min(radius * 1.2, 32, width / 3, height / 3)) / size;
  // Grey levels along a quarter circle, like the curve of a glass bevel.
  const profile = [0, 0.2, 0.4, 0.6, 0.8, 1].map(t => [t, 128 + 127 * (1 - Math.sin((t * Math.PI) / 2))] as const);
  const grey = (v: number) => `rgb(${Math.round(v)},${Math.round(v)},${Math.round(v)})`;
  const stops = profile.map(([t, v]) => `<stop offset="${t * f}" stop-color="${grey(v)}"/>`).join("")
    + profile.slice().reverse().map(([t, v]) => `<stop offset="${1 - t * f}" stop-color="${grey(256 - v)}"/>`).join("");
  const svg = `<svg xmlns="${NS}" width="${width}" height="${height}"><defs><linearGradient id="g"${axis === "y" ? ' x2="0" y2="1"' : ""}>${stops}</linearGradient></defs>`
    + `<rect width="100%" height="100%" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const primitive = (name: string, attrs: Record<string, string>) => {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
};

let nextId = 0;

function attach(el: HTMLElement, defs: SVGSVGElement) {
  const id = `liquid-glass-${++nextId}`;
  const filter = document.createElementNS(NS, "filter");
  filter.id = id;
  filter.setAttribute("x", "0");
  filter.setAttribute("y", "0");
  filter.setAttribute("width", "1");
  filter.setAttribute("height", "1");
  filter.setAttribute("color-interpolation-filters", "sRGB");
  // A grey map per axis, moved into the red (x) and green (y) channels and
  // added together, then used to displace the backdrop.
  const mapX = primitive("feImage", { preserveAspectRatio: "none", result: "greyX" });
  const mapY = primitive("feImage", { preserveAspectRatio: "none", result: "greyY" });
  const shift = primitive("feDisplacementMap", { in: "SourceGraphic", in2: "map", xChannelSelector: "R", yChannelSelector: "G" });
  filter.append(
    mapX,
    primitive("feColorMatrix", { in: "greyX", values: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1", result: "red" }),
    mapY,
    primitive("feColorMatrix", { in: "greyY", values: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 0 1", result: "green" }),
    primitive("feComposite", { in: "red", in2: "green", operator: "arithmetic", k2: "1", k3: "1", result: "map" }),
    shift,
  );
  defs.append(filter);

  // Liquid Glass is clearer than frosted glass: keep the colour boost, soften the blur.
  const frosted = getComputedStyle(el).backdropFilter;
  const clear = (frosted && frosted !== "none" ? frosted : "blur(16px)").replace(/blur\(([\d.]+)px\)/, (_, px) => `blur(${Math.min(Number(px), 4)}px)`);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const shape = () => {
    const { width, height } = el.getBoundingClientRect();
    if (width < MIN_SIZE || height < MIN_SIZE) return;
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 16;
    mapX.setAttribute("href", lensMap(width, height, radius, "x"));
    mapY.setAttribute("href", lensMap(width, height, radius, "y"));
    shift.setAttribute("scale", String(Math.min(48, Math.max(18, Math.min(width, height) * 0.6))));
    el.style.setProperty("backdrop-filter", `url(#${id}) ${clear}`);
  };
  shape();
  // Reshape once a resize settles (the dock resizes constantly while magnifying).
  const observer = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(shape, 150);
  });
  observer.observe(el);

  return () => {
    clearTimeout(timer);
    observer.disconnect();
    filter.remove();
    el.style.removeProperty("backdrop-filter");
  };
}

/** Mounted once: gives each data-liquid glass surface a lens edge. */
export function LiquidGlass() {
  useEffect(() => {
    if (!supported()) return;
    const defs = document.createElementNS(NS, "svg");
    defs.setAttribute("aria-hidden", "true");
    defs.setAttribute("width", "0");
    defs.setAttribute("height", "0");
    defs.style.position = "absolute";
    document.body.append(defs);
    document.documentElement.dataset.refraction = "";

    const attached = new Map<HTMLElement, () => void>();
    const scan = () => {
      for (const el of document.querySelectorAll<HTMLElement>(".glass[data-liquid]")) {
        if (!attached.has(el)) attached.set(el, attach(el, defs));
      }
      for (const [el, detach] of attached) {
        if (!el.isConnected) { detach(); attached.delete(el); }
      }
    };
    scan();
    let queued = 0;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(scan);
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      cancelAnimationFrame(queued);
      for (const detach of attached.values()) detach();
      defs.remove();
      delete document.documentElement.dataset.refraction;
    };
  }, []);
  return null;
}
