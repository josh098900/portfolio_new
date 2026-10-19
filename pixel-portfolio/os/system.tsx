"use client";

import { AnimatePresence, domAnimation, LazyMotion, MotionConfig } from "motion/react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { ControlCentre } from "./control-centre";
import { Dock } from "./dock";
import { HomeScreen } from "./home-screen";
import { MenuBar } from "./menu-bar";
import { usePrefs, usePrefsSync } from "./prefs";
import { appIds, pathFromUrl, routeTitle, routeToPath, type Route } from "./routes";
import { useShell } from "./shell";
import { Spotlight } from "./spotlight";
import { OSProvider, selectFocused, useOS, useOSStore } from "./store";
import { DesktopWidgets } from "./widgets";
import { Window } from "./window";
import styles from "./system.module.css";

/** Keeps the address bar and tab title on the focused app, and follows back/forward. */
function useUrlSync() {
  const store = useOSStore();
  const path = useOS(s => {
    const focused = selectFocused(s);
    return focused ? routeToPath(focused) : null;
  });

  useEffect(() => {
    if (path === null) return;
    if (path !== location.pathname) history.pushState(null, "", path);
    const route = pathFromUrl(path);
    if (route) document.title = path === "/" ? routeTitle(route).title : `${routeTitle(route).title} · Josh`;
  }, [path]);

  useEffect(() => {
    const onPopState = () => {
      const route = pathFromUrl(location.pathname);
      if (route) store.getState().open(route);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [store]);
}

/** ⌘K or Ctrl+K toggles Spotlight (⌘Space belongs to the visitor's own Mac); Esc closes overlays. */
function useShortcuts() {
  const store = useOSStore();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { overlay, setOverlay, toggleOverlay } = store.getState();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleOverlay("spotlight");
      } else if (event.key === "Escape" && overlay) {
        setOverlay(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [store]);
}

function Dimmer() {
  const brightness = usePrefs(s => s.brightness);
  return <div className={styles.dimmer} style={{ opacity: (1 - brightness) * 0.85 }} aria-hidden="true" />;
}

function HomeIndicator() {
  const goHome = useOS(s => s.goHome);
  const start = useRef<number | null>(null);
  return <button
    type="button"
    className={styles.homeIndicator}
    aria-label="Go to Home Screen"
    onClick={goHome}
    onPointerDown={e => { start.current = e.clientY; }}
    onPointerUp={e => { if (start.current !== null && start.current - e.clientY > 30) goHome(); start.current = null; }}
  ><span /></button>;
}

function Desktop() {
  const shell = useShell();
  useUrlSync();
  useShortcuts();
  usePrefsSync();
  const windows = useOS(useShallow(s => appIds.flatMap(app => s.windows[app] ?? [])));
  const focused = useOS(s => selectFocused(s)?.app ?? null);

  return <div className={styles.os} data-app-open={focused ? "" : undefined}>
    <div className={`${styles.wallpaper} wallpaper-fill`} aria-hidden="true" />
    <MenuBar />
    <main id="main" className={styles.workspace}>
      <div inert={Boolean(focused) && shell !== null && shell !== "desktop"}>
        <HomeScreen />
      </div>
      <DesktopWidgets />
      <AnimatePresence initial={false}>
        {windows.map(w => <Window key={w.app} window={w} focused={w.app === focused} shell={shell} />)}
      </AnimatePresence>
    </main>
    <Dock shell={shell} />
    {focused && <HomeIndicator />}
    <Spotlight />
    <ControlCentre />
    <Dimmer />
  </div>;
}

export function System({ initial }: { initial: Route }) {
  const reduceMotion = usePrefs(s => s.reduceMotion);
  // LazyMotion with `m` components ships only the animation features in use
  // (no layout or drag), which keeps Motion's share of the bundle small.
  return <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <OSProvider initial={initial}>
        <Desktop />
      </OSProvider>
    </MotionConfig>
  </LazyMotion>;
}
