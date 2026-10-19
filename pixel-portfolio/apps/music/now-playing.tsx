"use client";

import { m } from "motion/react";
import { useEffect, useRef, type CSSProperties, type PointerEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import { artwork, formatDuration } from "@/content/music";
import { Glyph } from "@/os/icons";
import { selectTrack, useMedia } from "@/os/media";
import styles from "./now-playing.module.css";

const DISMISS_PX = 110;
// A press only becomes a swipe once it has moved this far, so taps still reach buttons.
const SWIPE_PX = 6;

/**
 * Apple Music's full-screen player: the artwork's own colours drift behind it,
 * the cover shrinks back when paused, and a swipe down puts it away.
 */
export function NowPlaying({ onClose }: { onClose: () => void }) {
  const track = useMedia(selectTrack);
  const { playing, progress, duration, shuffle, repeat } = useMedia(useShallow(s => ({
    playing: s.playing, progress: s.progress, duration: s.duration, shuffle: s.shuffle, repeat: s.repeat,
  })));
  const { toggle, step, seek, setShuffle, setRepeat } = useMedia.getState();
  const closeButton = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const drag = useRef<{ start: number; offset: number; swiping: boolean } | null>(null);

  // Move focus in, and back to where it was when the player closes.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeButton.current?.focus({ preventScroll: true });
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);

  if (!track) return null;
  const art = artwork(track, 600);
  const blur = artwork(track, 100);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("input, a, button:not([data-grabber])")) return;
    drag.current = { start: event.clientY, offset: 0, swiping: false };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || !body.current) return;
    if (!drag.current.swiping) {
      if (event.clientY - drag.current.start < SWIPE_PX) return;
      drag.current.swiping = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    drag.current.offset = Math.max(0, event.clientY - drag.current.start);
    body.current.style.transition = "none";
    body.current.style.transform = `translateY(${drag.current.offset}px)`;
  }

  function onPointerUp() {
    if (!drag.current || !body.current) return;
    const { offset, swiping } = drag.current;
    drag.current = null;
    if (!swiping) return;
    if (offset > DISMISS_PX) return onClose();
    body.current.style.transition = "";
    body.current.style.transform = "";
  }

  return <m.div
    className={styles.sheet}
    role="dialog"
    aria-label="Now Playing"
    initial={{ y: "100%" }}
    animate={{ y: 0 }}
    exit={{ y: "100%" }}
    transition={{ type: "spring", stiffness: 300, damping: 34 }}
    onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}
  >
    <div className={styles.backdrop} aria-hidden="true">
      <img src={blur} alt="" /><img src={blur} alt="" /><img src={blur} alt="" />
    </div>
    <div ref={body} className={styles.body} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <button ref={closeButton} type="button" className={styles.grabber} data-grabber onClick={onClose} aria-label="Close Now Playing"><span /></button>
      <div className={styles.artFrame}>
        <img className={styles.art} data-playing={playing || undefined} src={art} alt={`${track.album} artwork`} draggable={false} />
      </div>
      <div className={styles.meta}>
        <span className={styles.titles}><strong>{track.title}</strong><span>{track.artist}</span></span>
        <a className={styles.apple} href={track.appleMusic} target="_blank" rel="noreferrer" aria-label={`Open ${track.title} in Apple Music`}><Glyph name="arrow" size={16} /></a>
      </div>
      <input
        type="range"
        className={styles.scrub}
        min={0}
        max={duration}
        step={250}
        value={Math.min(progress, duration)}
        onChange={e => seek(Number(e.target.value))}
        aria-label="Position"
        aria-valuetext={`${formatDuration(progress)} of ${formatDuration(duration)}`}
        style={{ "--fill": `${Math.min(100, (progress / duration) * 100)}%` } as CSSProperties}
      />
      <div className={styles.times} aria-hidden="true">
        <time>{formatDuration(progress)}</time>
        <span>Preview</span>
        <time>-{formatDuration(Math.max(0, duration - progress))}</time>
      </div>
      <div className={styles.transport}>
        <button type="button" className={styles.minor} aria-pressed={shuffle} onClick={() => setShuffle(!shuffle)} aria-label="Shuffle"><Glyph name="shuffle" size={20} /></button>
        <button type="button" onClick={() => step(-1)} aria-label="Previous"><Glyph name="prev" size={34} /></button>
        <button type="button" className={styles.play} onClick={toggle} aria-label={playing ? "Pause" : "Play"}><Glyph name={playing ? "pause" : "play"} size={44} /></button>
        <button type="button" onClick={() => step(1)} aria-label="Next"><Glyph name="next" size={34} /></button>
        <button type="button" className={styles.minor} aria-pressed={repeat} onClick={() => setRepeat(!repeat)} aria-label="Repeat"><Glyph name="repeat" size={20} /></button>
      </div>
    </div>
  </m.div>;
}
