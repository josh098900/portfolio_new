"use client";

import type { CSSProperties } from "react";
import { Glyph } from "./icons";
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

  return <div className={styles.backdrop} onPointerDown={e => e.target === e.currentTarget && close()}>
    <div className={styles.panel} role="dialog" aria-label="Control Centre">
      <button type="button" autoFocus className={`${styles.tile} ${styles.toggle} glass`} aria-pressed={dark} onClick={() => setTheme(dark ? "light" : "dark")}>
        <span className={styles.toggleIcon}><Glyph name={dark ? "moon" : "sun"} size={20} /></span>
        <span className={styles.label}><strong>Dark Mode</strong><small>{dark ? "On" : "Off"}</small></span>
      </button>

      <button type="button" className={`${styles.tile} ${styles.media} glass`} onClick={() => { close(); launch("music"); }}>
        <span className={styles.artwork} aria-hidden="true" />
        <strong>Not Playing</strong>
        <span className={styles.transport} aria-hidden="true"><Glyph name="prev" size={18} /><Glyph name="play" size={22} /><Glyph name="next" size={18} /></span>
        <span className={styles.srOnly}>Open Music</span>
      </button>

      <button type="button" className={`${styles.tile} ${styles.toggle} glass`} aria-pressed={reduceMotion} onClick={() => setReduceMotion(!reduceMotion)}>
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
