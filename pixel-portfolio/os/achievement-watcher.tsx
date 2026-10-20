"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect } from "react";
import { achieve, achievements, useAchievements } from "./achievements";
import { Glyph } from "./icons";
import { useLive } from "./live";
import { useMedia } from "./media";
import { readyApps, type AppId } from "./routes";
import type { Shell } from "./shell";
import { useOS, useOSStore } from "./store";
import styles from "./achievement-watcher.module.css";

/** Watches the OS for things worth an achievement, and announces them. */
export function Achievements({ shell }: { shell: Shell | null }) {
  const store = useOSStore();
  const latest = useAchievements(s => s.latest);
  const launch = useOS(s => s.launch);

  useEffect(() => {
    useAchievements.getState().load();
    const seen = new Set<AppId>();
    try { for (const app of JSON.parse(localStorage.getItem("josh-apps-seen") ?? "[]")) seen.add(app); } catch { /* Start fresh. */ }

    const checkOS = () => {
      const { windows, overlay } = store.getState();
      let grew = false;
      for (const w of Object.values(windows)) {
        if (!w) continue;
        if (!seen.has(w.app)) { seen.add(w.app); grew = true; }
        if (w.app === "projects" && w.sub[0]) achieve("case-study");
        if (w.app === "resume") achieve("resume");
        if (w.app === "tv") achieve("film-buff");
        if (w.minimised && shell === "desktop") achieve("genie");
      }
      if (grew) try { localStorage.setItem("josh-apps-seen", JSON.stringify([...seen])); } catch { /* Fine. */ }
      if (seen.size >= 5) achieve("explorer");
      if (readyApps.every(app => seen.has(app))) achieve("completionist");
      if (overlay === "screensaver") achieve("hello");
      if (overlay === "mission-control") achieve("mission-control");
    };
    checkOS();
    const offOS = store.subscribe(checkOS);
    const offMedia = useMedia.subscribe(s => { if (s.playing) achieve("dj"); });
    const offLive = useLive.subscribe(s => { if (s.sky === "rain" || s.sky === "snow") achieve("weather"); });
    const theme = new MutationObserver(() => {
      const root = document.documentElement;
      if (root.dataset.theme === "dark" && !root.hasAttribute("data-spatial")) achieve("night-owl");
      if (root.dataset.wallpaper === "london") achieve("londoner");
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-wallpaper"] });
    const onEvent = (event: Event) => achieve(String((event as CustomEvent).detail));
    const onPet = () => achieve("pet");
    window.addEventListener("josh:achieve", onEvent);
    window.addEventListener("josh:pet", onPet);
    return () => {
      offOS(); offMedia(); offLive(); theme.disconnect();
      window.removeEventListener("josh:achieve", onEvent);
      window.removeEventListener("josh:pet", onPet);
    };
  }, [store, shell]);

  // On a phone the island announces it; elsewhere, a notification slides in.
  useEffect(() => {
    if (!latest) return;
    // Wait for any alert already in the island (like the Dark Mode one that earned this) to finish.
    const show = () => useLive.getState().flash({ glyph: "star", title: latest.title, detail: "Unlocked", tint: "#ffd60a", app: "arcade" });
    let wait: ReturnType<typeof setTimeout> | undefined;
    if (shell === "phone") {
      if (useLive.getState().alert) wait = setTimeout(show, 3000);
      else show();
    }
    const id = setTimeout(() => useAchievements.getState().clearLatest(), 4200);
    return () => { clearTimeout(id); clearTimeout(wait); };
  }, [latest, shell]);

  const count = useAchievements(s => Object.keys(s.earned).length);
  return <div className={styles.anchor} aria-live="polite">
    <AnimatePresence>
      {latest && shell !== "phone" && <m.button key={latest.id} type="button" className={`${styles.banner} glass`}
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
        onClick={() => { useAchievements.getState().clearLatest(); launch("arcade"); }}>
        <span className={styles.medal}><Glyph name={latest.glyph} size={20} /></span>
        <span className={styles.text}>
          <small>Achievement unlocked · {count} of {achievements.length}</small>
          <strong>{latest.title}</strong>
          <span>{latest.hint}</span>
        </span>
      </m.button>}
    </AnimatePresence>
  </div>;
}

