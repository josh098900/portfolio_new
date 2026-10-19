"use client";

import { AppIcon, Glyph } from "./icons";
import { dockApps } from "./dock";
import { apps, readyApps } from "./routes";
import { useOS } from "./store";
import { CalendarWidget, WeatherWidget } from "./widgets";
import styles from "./home-screen.module.css";

/** iPhone and iPad home screen. Apps already in that shell's dock are hidden by CSS. */
export function HomeScreen() {
  const launch = useOS(s => s.launch);
  const setOverlay = useOS(s => s.setOverlay);
  return <>
    <div className={styles.home}>
    <button type="button" className={`${styles.controls} glass`} aria-label="Control Centre" onClick={() => setOverlay("control-centre")}>
      <Glyph name="controls" size={18} />
    </button>
    <div className={styles.widgets}>
      <button type="button" className={`${styles.widget} glass`} onClick={() => launch("notes")}>
        <span className={styles.widgetEyebrow}><span className={styles.dot} /> Open to graduate roles</span>
        <strong>Hi, I&apos;m Josh</strong>
        <span className={styles.widgetText}>Third year, building Curio for solo travellers. Tap to read more.</span>
      </button>
      <WeatherWidget className={styles.small} />
      <CalendarWidget className={styles.small} />
    </div>
    <ul className={styles.grid}>
      {readyApps.map(app => {
        const shells = dockApps.find(d => d.app === app)?.shells ?? [];
        return <li key={app} data-in-dock={shells.filter(s => s !== "desktop").join(" ") || undefined}>
          <button type="button" className={styles.app} onClick={() => launch(app)}>
            <AppIcon app={app} />
            <span>{apps[app].name}</span>
          </button>
        </li>;
      })}
    </ul>
    </div>
    {/* Outside the scrolling home screen, so it stays put and follows the visible area. */}
    <button type="button" className={`${styles.search} glass`} onClick={() => setOverlay("spotlight")}>
      <Glyph name="search" size={14} /> Search
    </button>
  </>;
}
