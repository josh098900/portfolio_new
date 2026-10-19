"use client";

import { AnimatePresence, m, type Transition } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { artwork, formatDuration } from "@/content/music";
import { Glyph } from "./icons";
import { useLive } from "./live";
import { selectTrack, useMedia } from "./media";
import { usePrefs } from "./prefs";
import type { Shell } from "./shell";
import { selectFocused, useOS } from "./store";
import { useTint } from "./tint";
import styles from "./island.module.css";

// The iPhone's Dynamic Island. It shows what's happening in apps that are out
// of sight (music playing, the assistant speaking) plus short alerts, and
// grows into controls when tapped. A real iPhone already has its own island
// above the page, so this one only appears while something is happening.

const LINGER_MS = 8000;
const spring: Transition = { type: "spring", stiffness: 420, damping: 32, mass: 0.9 };
const still: Transition = { duration: 0 };

type Kind = "music" | "speaking";

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function useScreenWidth() {
  return useSyncExternalStore(subscribeResize, () => document.documentElement.clientWidth, () => 390);
}

/** True for a few seconds after playback pauses, so the island doesn't vanish the instant you tap pause. */
function useLingering(pausedAt: number | null) {
  const [, rerender] = useState(0);
  useEffect(() => {
    if (pausedAt === null) return;
    const left = pausedAt + LINGER_MS - Date.now();
    if (left <= 0) return;
    const id = setTimeout(() => rerender(n => n + 1), left + 20);
    return () => clearTimeout(id);
  }, [pausedAt]);
  // Reading the clock during render is intended: the timer above re-renders when the answer changes.
  return pausedAt !== null && Date.now() - pausedAt < LINGER_MS;
}

function Bars({ playing, tint }: { playing: boolean; tint: string | null }) {
  return <span className={styles.bars} data-playing={playing || undefined} style={{ color: tint ?? "#fff" }} aria-hidden="true">
    <i /><i /><i /><i /><i />
  </span>;
}

function Orb({ size }: { size: number }) {
  return <span className={styles.orb} style={{ width: size, height: size }} aria-hidden="true"><i /></span>;
}

/** Cross-fades the island's contents as it changes shape. */
function Layer({ id, children }: { id: string; children: ReactNode }) {
  return <m.div
    key={id}
    className={styles.layer}
    initial={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.28, delay: 0.06 } }}
    exit={{ opacity: 0, scale: 0.92, filter: "blur(6px)", transition: { duration: 0.14 } }}
  >{children}</m.div>;
}

export function DynamicIsland({ shell }: { shell: Shell | null }) {
  const focused = useOS(s => selectFocused(s)?.app ?? null);
  const launch = useOS(s => s.launch);
  const track = useMedia(selectTrack);
  const playing = useMedia(s => s.playing);
  const pausedAt = useMedia(s => s.pausedAt);
  const progress = useMedia(s => s.progress);
  const duration = useMedia(s => s.duration);
  const speaking = useLive(s => s.speaking);
  const alert = useLive(s => s.alert);
  const reduceMotion = usePrefs(s => s.reduceMotion);
  const lingering = useLingering(pausedAt);
  const screen = useScreenWidth();
  const [expanded, setExpanded] = useState<Kind | null>(null);
  const island = useRef<HTMLDivElement>(null);
  const art = track ? artwork(track, 120) : null;
  const tint = useTint(shell === "phone" ? art : null);

  // Activities belong to apps that aren't on screen; inside the app, the app shows them itself.
  const music = Boolean(track) && focused !== "music" && (playing || lingering || expanded === "music");
  const voice = Boolean(speaking) && focused !== "messages";
  const open: Kind | null = expanded === "music" && music ? "music" : expanded === "speaking" && voice ? "speaking" : null;

  // Collapse when tapping anywhere else, as on iPhone.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!island.current?.contains(event.target as Node)) setExpanded(null);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (shell !== "phone") return null;

  const wide = Math.min(372, screen - 22);
  const mode = alert ? "alert" : open ? `open-${open}` : voice ? "speaking" : music ? "music" : null;
  const size = {
    alert: { width: Math.min(wide, 290), height: 44, borderRadius: 22 },
    "open-music": { width: wide, height: 172, borderRadius: 44 },
    "open-speaking": { width: wide, height: 80, borderRadius: 40 },
    speaking: { width: music ? 172 : 236, height: 37, borderRadius: 18.5 },
    music: { width: 236, height: 37, borderRadius: 18.5 },
  }[mode ?? "music"];
  // A second, smaller bubble when music plays while the assistant speaks, as iOS splits the island.
  const bubble = mode === "speaking" && music;
  const transition = reduceMotion ? still : spring;
  const openMusic = () => { setExpanded(null); launch("music"); };

  let content: ReactNode = null;
  if (mode === "alert" && alert) {
    content = <Layer id={`alert-${alert.id}`}>
      <button type="button" className={styles.alert} onClick={() => { useLive.getState().dismiss(); if (alert.app) launch(alert.app); }} tabIndex={alert.app ? 0 : -1}>
        <span className={styles.alertGlyph} style={{ color: alert.tint ?? "#fff" }}><Glyph name={alert.glyph} size={18} /></span>
        <strong>{alert.title}</strong>
        {alert.detail && <span className={styles.alertDetail} style={{ color: alert.tint ?? undefined }}>{alert.detail}</span>}
      </button>
    </Layer>;
  } else if (mode === "open-music" && track) {
    content = <Layer id="open-music">
      <div className={styles.player}>
        <div className={styles.playerTop}>
          <button type="button" className={styles.playerArt} onClick={openMusic} aria-label="Open Music">
            <img src={artwork(track, 120)} alt="" width={56} height={56} />
          </button>
          <button type="button" className={styles.playerMeta} onClick={openMusic}>
            <strong>{track.title}</strong>
            <span>{track.artist}</span>
          </button>
          <Bars playing={playing} tint={tint} />
        </div>
        <div className={styles.scrub} aria-hidden="true">
          <time>{formatDuration(progress)}</time>
          <span><i style={{ width: `${Math.min(100, (progress / duration) * 100)}%` }} /></span>
          <time>-{formatDuration(Math.max(0, duration - progress))}</time>
        </div>
        <div className={styles.controls}>
          <button type="button" onClick={() => useMedia.getState().step(-1)} aria-label="Previous"><Glyph name="prev" size={26} /></button>
          <button type="button" onClick={() => useMedia.getState().toggle()} aria-label={playing ? "Pause" : "Play"}><Glyph name={playing ? "pause" : "play"} size={32} /></button>
          <button type="button" onClick={() => useMedia.getState().step(1)} aria-label="Next"><Glyph name="next" size={26} /></button>
        </div>
      </div>
    </Layer>;
  } else if (mode === "open-speaking") {
    content = <Layer id="open-speaking">
      <div className={styles.voice}>
        <Orb size={46} />
        <button type="button" className={styles.voiceText} onClick={() => { setExpanded(null); launch("messages"); }}>
          <strong>Josh&apos;s Assistant</strong>
          <span>Speaking…</span>
        </button>
        <button type="button" className={styles.stop} onClick={() => { speaking?.stop(); setExpanded(null); }} aria-label="Stop speaking">
          <Glyph name="stop" size={20} />
        </button>
      </div>
    </Layer>;
  } else if (mode === "speaking") {
    content = <Layer id="speaking">
      <button type="button" className={styles.compact} onClick={() => setExpanded("speaking")} aria-expanded={false} aria-label="Josh's assistant is speaking. Show controls">
        <Orb size={24} />
        <Bars playing tint="#ff6fd8" />
      </button>
    </Layer>;
  } else if (mode === "music" && track) {
    content = <Layer id="music">
      <button type="button" className={styles.compact} onClick={() => setExpanded("music")} aria-expanded={false}
        aria-label={`${playing ? "Now playing" : "Paused"}: ${track.title} by ${track.artist}. Show controls`}>
        <img src={artwork(track, 60)} alt="" width={24} height={24} className={styles.compactArt} />
        <Bars playing={playing} tint={tint} />
      </button>
    </Layer>;
  }

  return <div className={styles.anchor} role="group" aria-label="Dynamic Island">
    <p className={styles.srOnly} role="status">{alert ? [alert.title, alert.detail].filter(Boolean).join(", ") : ""}</p>
    <AnimatePresence>
      {mode && <m.div
        key="island"
        ref={island}
        className={styles.island}
        data-open={open ? "" : undefined}
        initial={{ width: 126, height: 37, borderRadius: 18.5, opacity: 0, scale: 0.6 }}
        animate={{ ...size, opacity: 1, scale: 1 }}
        exit={{ width: 126, height: 37, borderRadius: 18.5, opacity: 0, scale: 0.6 }}
        transition={transition}
      >
        <AnimatePresence initial={false}>{content}</AnimatePresence>
      </m.div>}
    </AnimatePresence>
    <AnimatePresence>
      {bubble && track && <m.button
        key="bubble"
        type="button"
        className={styles.bubble}
        onClick={() => setExpanded("music")}
        aria-label={`Now playing: ${track.title}. Show controls`}
        initial={{ opacity: 0, scale: 0.4, x: -30 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.4, x: -30 }}
        transition={transition}
      >
        <img src={artwork(track, 60)} alt="" width={23} height={23} />
      </m.button>}
    </AnimatePresence>
  </div>;
}
