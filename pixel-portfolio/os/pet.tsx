"use client";

import { useEffect, useRef, useState } from "react";
import { useMedia } from "./media";
import { usePrefs } from "./prefs";
import type { Shell } from "./shell";
import { selectFocused, useOS } from "./store";
import styles from "./pet.module.css";

// A little lab critter that lives on the dock: it wanders, blinks, dances to
// music, naps when you leave it alone, and jumps for joy when you pet it.
// Drawn as pixel art, in the spirit of the critters in Josh's Lab Hangout.

type Mood = "idle" | "walk" | "blink" | "sleep" | "happy" | "dance";

// One character per pixel. b body, d outline, w eye white, k pupil, p cheek, m mouth, a antenna, g glow, f foot.
const BODY = [
  "......g......",
  "......a......",
  "...ddddddd...",
  "..dbbbbbbbd..",
  ".dbbbbbbbbbd.",
  ".dbwwbbbwwbd.",
  ".dbwkbbbwkbd.",
  ".dpbbbmbbbpd.",
  ".dbbbbbbbbbd.",
  "..dbbbbbbbd..",
  "...ddddddd...",
];
const FEET: Record<"a" | "b" | "still", string> = { a: "..ff....ff...", b: "...ff....ff..", still: "...ff...ff..." };
const colours: Record<string, string> = { b: "#8fe3c8", d: "#2e6f63", w: "#fff", k: "#1c1c1e", p: "#ff9fb2", m: "#2e6f63", a: "#2e6f63", g: "#ffd166", f: "#2e6f63" };

function face(mood: Mood) {
  const rows = BODY.slice();
  if (mood === "blink" || mood === "sleep") { rows[5] = ".dbbbbbbbbbd."; rows[6] = ".dbddbbbddbd."; }
  if (mood === "happy" || mood === "dance") { rows[5] = ".dbdbbbbbdbd."; rows[6] = ".ddbdbbbdbdd."; rows[7] = ".dpbbmmmbbpd."; }
  return rows;
}

function Sprite({ mood, step }: { mood: Mood; step: number }) {
  const rows = [...face(mood), mood === "walk" || mood === "dance" ? (step % 2 ? FEET.a : FEET.b) : FEET.still];
  return <svg viewBox="0 0 13 12" className={styles.sprite} shapeRendering="crispEdges" aria-hidden="true">
    {rows.flatMap((row, y) => [...row].map((c, x) => c !== "." && <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={colours[c]} />))}
  </svg>;
}

const SPEED = 34;
const NAP_AFTER = 40_000;

export function Pet({ shell }: { shell: Shell | null }) {
  const [mood, setMood] = useState<Mood>("idle");
  const [step, setStep] = useState(0);
  const [hearts, setHearts] = useState(0);
  const [flip, setFlip] = useState(false);
  const pet = useRef<HTMLButtonElement>(null);
  const x = useRef(0.5);
  const lastActive = useRef(0);
  const playing = useMedia(s => s.playing);
  const still = usePrefs(s => s.reduceMotion);
  const focused = useOS(s => selectFocused(s)?.app ?? null);
  const mode = useRef<Mood>("idle");
  mode.current = mood;

  // Wander between random spots along the dock, napping when left alone.
  useEffect(() => {
    if (!shell || still) return;
    lastActive.current = performance.now();
    let target = x.current, frame = 0, last = performance.now(), waitUntil = last + 1500;
    const dock = () => document.querySelector<HTMLElement>('nav[aria-label="Dock"]');
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const bar = dock();
      const el = pet.current;
      // Hidden (an app is open on a phone) or the dock is away: wait.
      const parent = el?.offsetParent;
      if (bar && el && parent) {
        const box = bar.getBoundingClientRect(), os = parent.getBoundingClientRect();
        const width = Math.max(1, box.width - 60);
        const current = mode.current;
        if (current !== "sleep" && current !== "happy" && current !== "dance" && now - lastActive.current > NAP_AFTER) setMood("sleep");
        else if (current === "idle" && now > waitUntil) {
          target = Math.random();
          setFlip(target < x.current);
          setMood("walk");
        } else if (current === "walk") {
          const dir = Math.sign(target - x.current);
          x.current += (dir * SPEED * dt) / width;
          if (Math.sign(target - x.current) !== dir) { x.current = target; setMood("idle"); waitUntil = now + 2000 + Math.random() * 5000; }
        }
        el.style.left = `${box.left - os.left + 30 + x.current * width}px`;
        el.style.top = `${box.top - os.top}px`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Waking up: a pointer nearby counts as company.
    const onMove = (event: PointerEvent) => {
      const el = pet.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      if (Math.hypot(event.clientX - (box.left + box.width / 2), event.clientY - box.top) < 160) {
        lastActive.current = performance.now();
        if (mode.current === "sleep") setMood("idle");
      }
    };
    window.addEventListener("pointermove", onMove);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", onMove); };
  }, [shell, still]);

  // Little feet patter while walking or dancing; blinks now and then when idle.
  useEffect(() => {
    if (still) return;
    const id = setInterval(() => {
      setStep(s => s + 1);
      if (mode.current === "idle" && Math.random() < 0.08) { setMood("blink"); setTimeout(() => setMood(m => (m === "blink" ? "idle" : m)), 160); }
    }, 220);
    return () => clearInterval(id);
  }, [still]);

  // Music makes it dance.
  useEffect(() => {
    if (playing) setMood("dance");
    else setMood(m => (m === "dance" ? "idle" : m));
  }, [playing]);

  // A hop of excitement when an app opens.
  useEffect(() => {
    if (!focused || still || !pet.current) return;
    pet.current.animate([{ translate: "0 0" }, { translate: "0 -12px" }, { translate: "0 0" }], { duration: 380, easing: "ease-out" });
  }, [focused, still]);

  function onPet() {
    lastActive.current = performance.now();
    setMood("happy");
    setHearts(h => h + 1);
    pet.current?.animate([{ translate: "0 0" }, { translate: "0 -26px" }, { translate: "0 0" }], { duration: 520, easing: "cubic-bezier(0.3, 1.6, 0.5, 1)" });
    setTimeout(() => setMood(m => (m === "happy" ? (useMedia.getState().playing ? "dance" : "idle") : m)), 1400);
    window.dispatchEvent(new CustomEvent("josh:pet"));
  }

  if (!shell) return null;
  return <button ref={pet} type="button" className={styles.pet} data-mood={mood} data-flip={flip || undefined} onClick={onPet}
    aria-label={mood === "sleep" ? "Lab critter, asleep. Pet it" : "Lab critter. Pet it"}>
    <Sprite mood={mood} step={step} />
    {mood === "sleep" && <span className={styles.zzz} aria-hidden="true">z<span>z</span></span>}
    {hearts > 0 && <span key={hearts} className={styles.heart} aria-hidden="true">♥</span>}
  </button>;
}
