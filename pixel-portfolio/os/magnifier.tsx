"use client";

import { useEffect, useRef, useState } from "react";
import { NS, primitive, supported } from "./liquid-glass";
import type { Shell } from "./shell";
import styles from "./magnifier.module.css";

// A Liquid Glass magnifier: hold ⌥ (Option) on the Mac and a glass lens
// follows the pointer, enlarging what's beneath it. The lens is a displacement
// filter that pulls every point towards the centre. Needs Chromium, like the
// rest of the refraction; the Help menu can also switch it on until Esc.

const SIZE = 220;
const ZOOM_SHIFT = SIZE * 0.45; // About 1.8× in the middle.

/** One axis of the lens map: a straight ramp, so the zoom is even across the glass. */
function ramp(axis: "x" | "y") {
  const svg = `<svg xmlns="${NS}" width="${SIZE}" height="${SIZE}"><defs><linearGradient id="g"${axis === "y" ? ' x2="0" y2="1"' : ""}>`
    + `<stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function Magnifier({ shell }: { shell: Shell | null }) {
  const [on, setOn] = useState(false);
  const [sticky, setSticky] = useState(false);
  const lens = useRef<HTMLDivElement>(null);
  const where = useRef({ x: -999, y: -999 });
  const [ok, setOk] = useState(false);

  useEffect(() => { setOk(supported()); }, []);

  // The filter, made once.
  useEffect(() => {
    if (!ok) return;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    const filter = primitive("filter", { id: "magnifier-lens", x: "0", y: "0", width: "1", height: "1", "color-interpolation-filters": "sRGB" });
    filter.append(
      primitive("feImage", { href: ramp("x"), preserveAspectRatio: "none", result: "greyX" }),
      primitive("feColorMatrix", { in: "greyX", values: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1", result: "red" }),
      primitive("feImage", { href: ramp("y"), preserveAspectRatio: "none", result: "greyY" }),
      primitive("feColorMatrix", { in: "greyY", values: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 0 1", result: "green" }),
      primitive("feComposite", { in: "red", in2: "green", operator: "arithmetic", k2: "1", k3: "1", result: "map" }),
      primitive("feDisplacementMap", { in: "SourceGraphic", in2: "map", scale: String(ZOOM_SHIFT), xChannelSelector: "R", yChannelSelector: "G" }),
    );
    svg.append(filter);
    document.body.append(svg);
    return () => svg.remove();
  }, [ok]);

  // Hold Option to look; the Help menu or Terminal can leave it on until Esc.
  useEffect(() => {
    if (!ok || shell !== "desktop") return;
    const place = () => {
      const el = lens.current;
      if (el) el.style.translate = `${where.current.x - SIZE / 2}px ${where.current.y - SIZE / 2}px`;
    };
    const onMove = (event: PointerEvent) => { where.current = { x: event.clientX, y: event.clientY }; place(); };
    const onDown = (event: KeyboardEvent) => {
      if (event.key === "Alt" && !event.repeat) setOn(true);
      if (event.key === "Escape") setSticky(false);
    };
    const onUp = (event: KeyboardEvent) => { if (event.key === "Alt") setOn(false); };
    const onToggle = () => setSticky(s => !s);
    const onBlur = () => setOn(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("josh:magnifier", onToggle);
    place();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("josh:magnifier", onToggle);
    };
  }, [ok, shell, on, sticky]);

  useEffect(() => {
    if (on || sticky) window.dispatchEvent(new CustomEvent("josh:achieve", { detail: "magnifier" }));
  }, [on, sticky]);

  if (!ok || shell !== "desktop" || !(on || sticky)) return null;
  return <div ref={lens} className={styles.lens} style={{ width: SIZE, height: SIZE, translate: `${where.current.x - SIZE / 2}px ${where.current.y - SIZE / 2}px` }} aria-hidden="true" />;
}
