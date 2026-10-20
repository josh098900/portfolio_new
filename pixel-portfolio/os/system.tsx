"use client";

import { AnimatePresence, domAnimation, LazyMotion, MotionConfig } from "motion/react";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { Achievements } from "./achievement-watcher";
import { ControlCentre } from "./control-centre";
import { Dock } from "./dock";
import { HomeScreen } from "./home-screen";
import { Glow } from "./glow";
import { DynamicIsland } from "./island";
import { VoiceHUD } from "./voice";
import { LiquidGlass } from "./liquid-glass";
import { Magnifier } from "./magnifier";
import { MenuBar } from "./menu-bar";
import { Pet } from "./pet";
import { MissionControl, useHotCorners } from "./mission-control";
import { usePrefs, usePrefsSync } from "./prefs";
import { appIds, homeRoute, pathFromUrl, routeTitle, routeToPath, type Route } from "./routes";
import { useShell } from "./shell";
import { ScreenSaver } from "./screensaver";
import { useSpatial } from "./spatial";
import { Spotlight } from "./spotlight";
import { StandBy } from "./standby";
import { OSProvider, selectFocused, useOS, useOSStore } from "./store";
import { WeatherEffects } from "./weather-fx";
import { DesktopWidgets } from "./widgets";
import { Window } from "./window";
import styles from "./system.module.css";

/**
 * Keeps the address bar and tab title on the focused app, and follows back/forward.
 * With nothing in front (the home screen), the address is "/", marked as home in
 * history so Back returns to the app you left and Forward comes home again.
 */
function useUrlSync() {
  const store = useOSStore();
  const path = useOS(s => {
    const focused = selectFocused(s);
    return focused ? routeToPath(focused) : null;
  });

  useEffect(() => {
    if (path === null) {
      if (location.pathname !== "/" || !history.state?.home) history.pushState({ home: true }, "", "/");
      document.title = routeTitle(homeRoute).title;
      return;
    }
    if (path !== location.pathname) history.pushState(null, "", path);
    const route = pathFromUrl(path);
    if (route) document.title = path === "/" ? routeTitle(route).title : `${routeTitle(route).title} · Josh`;
  }, [path]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (event.state?.home) return store.getState().goHome();
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

/**
 * When an on-screen keyboard opens, mobile browsers shrink only the visible
 * area and pan the page to keep the focused field in view, which would slide
 * the whole fixed-position OS up. Sizing the OS to the visible area instead
 * keeps it on screen. Pinch-zoom is left alone (scale isn't 1 then).
 */
function useVisibleArea() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;
    const sync = () => {
      if (Math.abs(viewport.scale - 1) > 0.01) {
        root.style.removeProperty("--visible-top");
        root.style.removeProperty("--visible-height");
        return;
      }
      root.style.setProperty("--visible-top", `${viewport.offsetTop}px`);
      root.style.setProperty("--visible-height", `${viewport.height}px`);
    };
    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      root.style.removeProperty("--visible-top");
      root.style.removeProperty("--visible-height");
    };
  }, []);
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
  useVisibleArea();
  useHotCorners(shell);
  useSpatial(shell);
  // Hydrated and interactive: browser tests wait for this before typing or clicking.
  useEffect(() => { document.documentElement.dataset.ready = ""; }, []);
  const windows = useOS(useShallow(s => appIds.flatMap(app => s.windows[app] ?? [])));
  const focused = useOS(s => selectFocused(s)?.app ?? null);

  return <div className={styles.os} data-app-open={focused ? "" : undefined}>
    <div className={`${styles.wallpaper} wallpaper-fill`} aria-hidden="true" />
    <WeatherEffects />
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
    <Pet shell={shell} />
    {focused && <HomeIndicator />}
    <MissionControl shell={shell} />
    <Spotlight />
    <ControlCentre />
    <StandBy shell={shell} />
    <Glow />
    <VoiceHUD />
    <Achievements shell={shell} />
    <ScreenSaver shell={shell} />
    <LiquidGlass />
    <Magnifier shell={shell} />
    <DynamicIsland shell={shell} />
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
