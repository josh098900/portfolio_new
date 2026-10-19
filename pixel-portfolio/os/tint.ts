"use client";

import { useEffect, useState } from "react";

// Picks a vivid colour from an image, the way iOS tints the Dynamic Island's
// waveform with the album art. Apple's artwork server allows cross-origin
// reads, so the pixels can be sampled on a small canvas.

const cache = new Map<string, string>();
const NEUTRAL = "#e5e5ea";

function vivid(image: HTMLImageElement) {
  const size = 24;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return NEUTRAL;
  context.drawImage(image, 0, 0, size, size);
  const { data } = context.getImageData(0, 0, size, size);

  // Average the pixels, weighting colourful mid-tones and ignoring near-black,
  // near-white and grey ones.
  let r = 0, g = 0, b = 0, total = 0;
  for (let i = 0; i < data.length; i += 4) {
    const [pr, pg, pb] = [data[i], data[i + 1], data[i + 2]];
    const max = Math.max(pr, pg, pb), min = Math.min(pr, pg, pb);
    const light = (max + min) / 510;
    const chroma = (max - min) / 255;
    const weight = chroma ** 2 * (1 - Math.abs(light - 0.5) * 1.6);
    if (weight <= 0) continue;
    r += pr * weight; g += pg * weight; b += pb * weight; total += weight;
  }
  if (total < 1.5) return NEUTRAL;

  // Lift dark results so the colour reads on the island's black.
  const [hue, saturation, lightness] = toHsl(r / total, g / total, b / total);
  return `hsl(${Math.round(hue)} ${Math.round(Math.max(saturation, 0.55) * 100)}% ${Math.round(Math.min(0.72, Math.max(lightness, 0.62)) * 100)}%)`;
}

function toHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return [0, 0, lightness];
  const d = max - min;
  const saturation = lightness > 0.5 ? d / (2 - max - min) : d / (max + min);
  const hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hue * 60, saturation, lightness];
}

/** A colour from the image at `src`, or null until it has loaded. */
export function useTint(src: string | null) {
  const [found, setFound] = useState<{ src: string; tint: string } | null>(null);

  useEffect(() => {
    if (!src || cache.has(src)) return;
    let alive = true;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      let tint = NEUTRAL;
      try { tint = vivid(image); } catch { /* A tainted canvas falls back to neutral. */ }
      cache.set(src, tint);
      if (alive) setFound({ src, tint });
    };
    image.src = src;
    return () => { alive = false; };
  }, [src]);

  if (!src) return null;
  return cache.get(src) ?? (found?.src === src ? found.tint : null);
}
