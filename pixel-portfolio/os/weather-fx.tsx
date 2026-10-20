"use client";

import { useEffect, useRef } from "react";
import { useLive } from "./live";
import { usePrefs } from "./prefs";
import { useWeather } from "./widgets";
import styles from "./weather-fx.module.css";

// London's weather, on the desktop: water beads and running drops on the glass
// when it rains (with the odd lightning flash in a storm), drifting snow when it
// snows. Drawn on one canvas behind the windows, paused when the tab is hidden.

type Kind = "rain" | "drizzle" | "storm" | "snow";
type Drop = { x: number; y: number; r: number; vy: number; life: number; trail: number };
type Flake = { x: number; y: number; r: number; vy: number; drift: number; phase: number };

function drawDrop(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha = 1) {
  // A bead of water: a lens that lightens what's behind it, a darker lower
  // edge, a bright rim on the upper side and a glint where the light catches.
  const body = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
  body.addColorStop(0, `rgb(255 255 255 / ${0.32 * alpha})`);
  body.addColorStop(0.55, `rgb(255 255 255 / ${0.12 * alpha})`);
  body.addColorStop(0.85, `rgb(8 14 30 / ${0.22 * alpha})`);
  body.addColorStop(1, `rgb(8 14 30 / ${0.38 * alpha})`);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgb(255 255 255 / ${0.35 * alpha})`;
  ctx.lineWidth = Math.max(0.6, r * 0.12);
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.92, r, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.fillStyle = `rgb(255 255 255 / ${0.9 * alpha})`;
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.4, Math.max(0.8, r * 0.26), 0, Math.PI * 2);
  ctx.fill();
}

function run(canvas: HTMLCanvasElement, kind: Kind, still: boolean) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(2, devicePixelRatio || 1);
  let w = 0, h = 0, frame = 0, last = 0, flash = 0, nextFlash = performance.now() + 6000;
  const beads: Drop[] = [], runners: Drop[] = [], flakes: Flake[] = [];
  const random = (min: number, max: number) => min + Math.random() * (max - min);

  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  // Sizes can settle after the first frame (styles arriving, the window resizing).
  const sizing = new ResizeObserver(() => { resize(); fill(); if (still) step(performance.now()); });
  sizing.observe(canvas);

  // How many beads or flakes the glass holds, from its current size.
  const density = () => (w * h) / (kind === "drizzle" ? 9000 : 5000);
  const fill = () => {
    if (kind === "snow") {
      while (flakes.length < Math.min(240, (w * h) / 8000)) {
        flakes.push({ x: random(0, w), y: random(-h, h), r: random(1, 3.4), vy: random(18, 55), drift: random(10, 30), phase: random(0, 6.3) });
      }
    } else {
      while (beads.length < density()) beads.push({ x: random(0, w), y: random(0, h), r: random(1.4, kind === "drizzle" ? 3.4 : 4.8), vy: 0, life: random(0.5, 1), trail: 0 });
    }
  };
  fill();

  const step = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    ctx.clearRect(0, 0, w, h);

    if (kind === "snow") {
      ctx.fillStyle = "rgb(255 255 255 / 0.85)";
      for (const f of flakes) {
        if (!still) {
          f.y += f.vy * dt;
          f.phase += dt * 0.8;
          if (f.y > h + 5) { f.y = -5; f.x = random(0, w); }
        }
        const x = f.x + Math.sin(f.phase) * f.drift;
        ctx.globalAlpha = 0.5 + f.r / 7;
        ctx.beginPath();
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return;
    }

    // New beads gather on the glass; now and then one grows heavy and runs.
    if (!still) {
      if (beads.length < density() && Math.random() < 0.6) beads.push({ x: random(0, w), y: random(0, h), r: random(1.2, 3), vy: 0, life: 0, trail: 0 });
      if (Math.random() < (kind === "drizzle" ? 0.012 : 0.035)) {
        runners.push({ x: random(0, w), y: random(-20, h * 0.4), r: random(4.5, 8), vy: random(30, 70), life: 1, trail: 0 });
      }
    }
    for (const b of beads) {
      b.life = Math.min(1, b.life + dt * 0.5);
      drawDrop(ctx, b.x, b.y, b.r, b.life);
    }
    for (let i = runners.length - 1; i >= 0; i--) {
      const d = runners[i];
      d.vy = Math.min(420, d.vy + 160 * dt);
      d.y += d.vy * dt;
      d.x += Math.sin(d.y / 23) * 0.4;
      d.trail += d.vy * dt;
      // Drops leave a broken trail of tiny beads, and swallow beads they pass.
      if (d.trail > 9) {
        d.trail = 0;
        if (Math.random() < 0.55) beads.push({ x: d.x + random(-1, 1), y: d.y - d.r * 2, r: random(1, 2), vy: 0, life: 1, trail: 0 });
      }
      for (let j = beads.length - 1; j >= 0; j--) {
        const b = beads[j];
        if (Math.abs(b.x - d.x) < d.r && Math.abs(b.y - d.y) < d.r) { beads.splice(j, 1); d.r = Math.min(10, d.r + b.r * 0.08); }
      }
      drawDrop(ctx, d.x, d.y, d.r);
      if (d.y > h + 20) runners.splice(i, 1);
    }
    while (beads.length > density() * 1.4) beads.shift();

    // Thunderstorms flash now and then.
    if (kind === "storm" && !still) {
      if (now > nextFlash) { flash = 1; nextFlash = now + random(7000, 18000); }
      if (flash > 0) {
        ctx.fillStyle = `rgb(235 240 255 / ${flash * 0.35})`;
        ctx.fillRect(0, 0, w, h);
        flash = Math.max(0, flash - dt * 2.5);
      }
    }
  };

  const loop = (now: number) => {
    // About 30 frames a second is plenty for weather.
    if (now - last > 30) step(now);
    frame = requestAnimationFrame(loop);
  };
  if (still) step(performance.now());
  else frame = requestAnimationFrame(loop);

  const onVisible = () => {
    cancelAnimationFrame(frame);
    if (!document.hidden && !still) { last = performance.now(); frame = requestAnimationFrame(loop); }
  };
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    cancelAnimationFrame(frame);
    sizing.disconnect();
    document.removeEventListener("visibilitychange", onVisible);
  };
}

export function WeatherEffects() {
  const weather = useWeather();
  const sky = useLive(s => s.sky);
  const enabled = usePrefs(s => s.weatherEffects);
  const still = usePrefs(s => s.reduceMotion);
  const canvas = useRef<HTMLCanvasElement>(null);

  const live = weather.status === "ready" ? weather.weather.condition : null;
  let kind: Kind | null = null;
  if (sky === "rain") kind = "rain";
  else if (sky === "snow") kind = "snow";
  else if (sky === "live" && enabled) {
    if (live === "drizzle") kind = "drizzle";
    else if (live === "rain") kind = "rain";
    else if (live === "thunder") kind = "storm";
    else if (live === "snow" || live === "sleet") kind = "snow";
  }

  useEffect(() => {
    if (!kind || !canvas.current) return;
    const deviceStill = matchMedia("(prefers-reduced-motion: reduce)").matches;
    return run(canvas.current, kind, still || deviceStill);
  }, [kind, still]);

  return kind ? <canvas ref={canvas} className={styles.fx} data-weather={kind} aria-hidden="true" /> : null;
}
