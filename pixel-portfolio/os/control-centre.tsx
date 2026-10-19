"use client";

import type { CSSProperties } from "react";
import { artwork } from "@/content/music";
import { Glyph } from "./icons";
import { useLive } from "./live";
import { selectTrack, useMedia } from "./media";
import { setTheme, usePrefs, useTheme } from "./prefs";
import { useOS } from "./store";
import styles from "./control-centre.module.css";

function Panel() {
  const theme = useTheme();
  const brightness = usePrefs(s => s.brightness);
  const reduceMotion = usePrefs(s => s.reduceMotion);
  const setBrightness = usePrefs(s => s.setBrightness);
  const setReduceMotion = usePrefs(s => s.setReduceMotion);
  const launch = useOS(s => s.launch);
  const setOverlay = useOS(s => s.setOverlay);
  const close = () => setOverlay(null);
  const dark = theme === "dark";
  const track = useMedia(selectTrack);
  const playing = useMedia(s => s.playing);
  const { toggle, step } = useMedia.getState();
  const flash = useLive(s => s.flash);

  function switchTheme() {
    setTheme(dark ? "light" : "dark");
    flash({ glyph: dark ? "sun" : "moon", title: dark ? "Light Mode" : "Dark Mode", detail: "On", tint: dark ? "#ffd60a" : "#5e9eff" });
  }

  function switchMotion() {
    setReduceMotion(!reduceMotion);
    flash({ glyph: "motion", title: "Reduce Motion", detail: reduceMotion ? "Off" : "On", tint: "#30d158" });
  }

  return <div className={styles.backdrop} onPointerDown={e => e.target === e.currentTarget && close()}>
    <div className={styles.panel} role="dialog" aria-label="Control Centre">
      <button type="button" autoFocus className={`${styles.tile} ${styles.toggle} glass`} aria-pressed={dark} onClick={switchTheme}>
        <span className={styles.toggleIcon}><Glyph name={dark ? "moon" : "sun"} size={20} /></span>
        <span className={styles.label}><strong>Dark Mode</strong><small>{dark ? "On" : "Off"}</small></span>
      </button>

      <div className={`${styles.tile} ${styles.media} glass`} role="group" aria-label="Now Playing">
        <button type="button" className={styles.mediaOpen} onClick={() => { close(); launch("music"); }} aria-label={track ? `Open Music: ${track.title} by ${track.artist}` : "Open Music"}>
          {track ? <img src={artwork(track, 112)} alt="" width={56} height={56} className={styles.artwork} /> : <span className={styles.artwork} />}
          <strong>{track?.title ?? "Not Playing"}</strong>
          {track && <small>{track.artist}</small>}
        </button>
        <span className={styles.transport} data-active={track ? "" : undefined}>
          <button type="button" onClick={() => step(-1)} aria-label="Previous"><Glyph name="prev" size={18} /></button>
          <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"}><Glyph name={playing ? "pause" : "play"} size={22} /></button>
          <button type="button" onClick={() => step(1)} aria-label="Next"><Glyph name="next" size={18} /></button>
        </span>
      </div>

      <button type="button" className={`${styles.tile} ${styles.toggle} glass`} aria-pressed={reduceMotion} onClick={switchMotion}>
        <span className={styles.toggleIcon}><Glyph name="motion" size={20} /></span>
        <span className={styles.label}><strong>Reduce Motion</strong><small>{reduceMotion ? "On" : "Off"}</small></span>
      </button>

      <label className={`${styles.tile} ${styles.slider} glass`}>
        <strong>Display</strong>
        <span className={styles.sliderRow}>
          <Glyph name="sun" size={14} />
          <input type="range" min={30} max={100} value={Math.round(brightness * 100)} onChange={e => setBrightness(Number(e.target.value) / 100)}
            style={{ "--fill": `${((brightness - 0.3) / 0.7) * 100}%` } as CSSProperties} aria-label="Display brightness" />
          <Glyph name="sun" size={20} />
        </span>
      </label>

      <div className={styles.footer}>
        <button type="button" className={`${styles.round} glass`} aria-label="Spotlight" onClick={() => setOverlay("spotlight")}><Glyph name="search" size={20} /></button>
        <button type="button" className={`${styles.pill} glass`} onClick={() => { close(); launch("settings"); }}>Settings…</button>
      </div>
    </div>
  </div>;
}

export function ControlCentre() {
  const isOpen = useOS(s => s.overlay === "control-centre");
  return isOpen ? <Panel /> : null;
}
