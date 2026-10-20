"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { artwork } from "@/content/music";
import { Glyph } from "./icons";
import { selectTrack, useMedia } from "./media";
import type { Shell } from "./shell";
import { selectFocused, useOS } from "./store";
import { useWeather } from "./widgets";
import styles from "./standby.module.css";

// iPhone StandBy: turn the phone on its side on the home screen and it becomes
// a bedside clock, with music or London's weather beside it. Red at night.

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  const id = setInterval(onChange, 1000);
  return () => { window.removeEventListener("resize", onChange); clearInterval(id); };
}

const landscape = () => innerWidth > innerHeight;
const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const day = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });

export function StandBy({ shell }: { shell: Shell | null }) {
  const sideways = useSyncExternalStore(subscribe, landscape, () => false);
  const clock = useSyncExternalStore(subscribe, () => time.format(Date.now()), () => "");
  const home = useOS(s => selectFocused(s) === null);
  const track = useMedia(selectTrack);
  const playing = useMedia(s => s.playing);
  const weather = useWeather();
  const [dismissed, setDismissed] = useState(false);

  // Turning the phone upright resets it, so the next turn shows StandBy again.
  useEffect(() => { if (!sideways) setDismissed(false); }, [sideways]);

  if (shell !== "phone" || !sideways || !home || dismissed) return null;
  const hour = new Date().getHours();
  const night = hour >= 22 || hour < 6;
  const [hh, mm] = clock.split(":");

  return <div className={styles.standby} data-night={night || undefined} role="dialog" aria-label="StandBy">
    <button type="button" className={styles.clock} onClick={() => setDismissed(true)} aria-label={`${clock}. Close StandBy`}>
      <span>{hh}</span><span className={styles.colon}>:</span><span>{mm}</span>
      <small suppressHydrationWarning>{day.format(new Date())}</small>
    </button>
    <div className={styles.widget}>
      {track ? <div className={styles.music}>
        <img src={artwork(track, 300)} alt="" />
        <strong>{track.title}</strong>
        <span>{track.artist}</span>
        <div className={styles.controls}>
          <button type="button" onClick={() => useMedia.getState().step(-1)} aria-label="Previous"><Glyph name="prev" size={22} /></button>
          <button type="button" onClick={() => useMedia.getState().toggle()} aria-label={playing ? "Pause" : "Play"}><Glyph name={playing ? "pause" : "play"} size={30} /></button>
          <button type="button" onClick={() => useMedia.getState().step(1)} aria-label="Next"><Glyph name="next" size={22} /></button>
        </div>
      </div> : weather.status === "ready" ? <div className={styles.weather}>
        <span className={styles.place}>London</span>
        <strong>{Math.round(weather.weather.temperature)}°</strong>
        <span>H:{Math.round(weather.weather.high)}° L:{Math.round(weather.weather.low)}°</span>
      </div> : <div className={styles.weather}><span className={styles.place}>London</span><strong>–°</strong></div>}
    </div>
  </div>;
}
