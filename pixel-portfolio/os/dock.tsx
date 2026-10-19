"use client";

import { m, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { AppIcon } from "./icons";
import { apps, type AppId } from "./routes";
import type { Shell } from "./shell";
import { useOS } from "./store";
import styles from "./dock.module.css";

// Every item is rendered on every shell and CSS shows the right set, so the
// server and the first client render agree before the shell is known.
export const dockApps: { app: AppId; shells: Shell[] }[] = [
  { app: "notes", shells: ["desktop", "tablet", "phone"] },
  { app: "projects", shells: ["desktop", "tablet", "phone"] },
  { app: "resume", shells: ["desktop", "tablet"] },
  { app: "contact", shells: ["desktop", "tablet", "phone"] },
  { app: "messages", shells: ["desktop", "tablet", "phone"] },
  { app: "maps", shells: ["desktop"] },
  { app: "photos", shells: ["desktop"] },
  { app: "music", shells: ["desktop"] },
  { app: "tv", shells: ["desktop"] },
  { app: "arcade", shells: ["desktop"] },
  { app: "activity", shells: ["desktop"] },
  { app: "terminal", shells: ["desktop", "tablet"] },
  { app: "settings", shells: ["desktop"] },
];

const BASE = 50;
const PEAK = 1.6;
const REACH = 150;

function DockItem({ app, shells, mouseX, magnify }: { app: AppId; shells: Shell[]; mouseX: MotionValue<number>; magnify: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const launch = useOS(s => s.launch);
  const running = useOS(s => Boolean(s.windows[app]));

  const distance = useTransform(mouseX, x => {
    const box = ref.current?.getBoundingClientRect();
    return box && magnify ? x - (box.left + box.width / 2) : Infinity;
  });
  const scale = useSpring(useTransform(distance, [-REACH, 0, REACH], [1, PEAK, 1], { clamp: true }), { stiffness: 380, damping: 28, mass: 0.2 });
  const width = useTransform(scale, s => s * BASE);

  return <m.li className={styles.item} data-shells={shells.join(" ")} style={magnify ? { width } : undefined}>
    <button ref={ref} type="button" className={styles.button} data-dock-app={app} aria-label={running ? `${apps[app].name} (open)` : apps[app].name} onClick={() => launch(app)}>
      <m.span className={styles.iconWrap} style={magnify ? { scale } : undefined}>
        <AppIcon app={app} className={styles.icon} />
      </m.span>
      <span className={styles.tooltip} aria-hidden="true">{apps[app].name}</span>
    </button>
    {running && <span className={styles.running} aria-hidden="true" />}
    <span className={styles.label} aria-hidden="true">{apps[app].name}</span>
  </m.li>;
}

export function Dock({ shell }: { shell: Shell | null }) {
  const mouseX = useMotionValue(Infinity);
  const magnify = shell === "desktop";
  return <nav className={`${styles.dock} glass`} data-liquid aria-label="Dock" onPointerMove={e => e.pointerType === "mouse" && mouseX.set(e.clientX)} onPointerLeave={() => mouseX.set(Infinity)}>
    <ul className={styles.list}>
      {dockApps.filter(item => apps[item.app].ready).map(item => <DockItem key={item.app} {...item} mouseX={mouseX} magnify={magnify} />)}
    </ul>
  </nav>;
}
