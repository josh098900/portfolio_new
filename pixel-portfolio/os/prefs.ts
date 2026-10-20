"use client";

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { skyVars } from "./sky";
import { defaultWallpaper, isWallpaperId, type WallpaperId } from "./wallpapers";

// Per-visitor conveniences, kept in localStorage. Theme and wallpaper live on
// <html> attributes so the pre-paint script can apply them before hydration.

export type Theme = "light" | "dark";
export type ThemeMode = Theme | "auto";
const THEME_KEY = "josh-theme";
const WALLPAPER_KEY = "josh-wallpaper";
const PREFS_KEY = "josh-prefs";

type Prefs = {
  brightness: number;
  reduceMotion: boolean;
  themeMode: ThemeMode;
  /** The Mac's "hello" screen saver after a while without activity. */
  screenSaver: boolean;
  /** Mac hot corners: Mission Control, screen saver and Show Desktop. */
  hotCorners: boolean;
  /** Rain and snow on the desktop when it's raining or snowing in London. */
  weatherEffects: boolean;
  /** visionOS mode on the Mac: windows float as glass panes in 3D. Not saved. */
  spatial: boolean;
  setSpatial: (value: boolean) => void;
  setBrightness: (value: number) => void;
  setReduceMotion: (value: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setScreenSaver: (value: boolean) => void;
  setHotCorners: (value: boolean) => void;
  setWeatherEffects: (value: boolean) => void;
  load: () => void;
};

const clampBrightness = (value: unknown) => typeof value === "number" ? Math.min(1, Math.max(0.3, value)) : 1;

function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* Settings still apply for this visit without storage. */ }
}

function read(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}

const systemTheme = (): Theme => matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/** Swaps an attribute on <html>, cross-fading with a view transition where supported. */
function transition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (update: () => void) => unknown };
  const still = usePrefs.getState().reduceMotion || matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (doc.startViewTransition && !still) doc.startViewTransition(update);
  else update();
}

function applyTheme(theme: Theme) {
  if (document.documentElement.dataset.theme !== theme) transition(() => { document.documentElement.dataset.theme = theme; });
}

export const usePrefs = create<Prefs>()((set, get) => {
  const save = () => store(PREFS_KEY, JSON.stringify({ brightness: get().brightness, reduceMotion: get().reduceMotion, screenSaver: get().screenSaver, hotCorners: get().hotCorners, weatherEffects: get().weatherEffects }));
  return {
    brightness: 1,
    reduceMotion: false,
    themeMode: "auto",
    screenSaver: true,
    hotCorners: true,
    weatherEffects: true,
    spatial: false,
    setSpatial: spatial => set({ spatial }),
    setBrightness: brightness => { set({ brightness: clampBrightness(brightness) }); save(); },
    setReduceMotion: reduceMotion => { set({ reduceMotion }); save(); },
    setScreenSaver: screenSaver => { set({ screenSaver }); save(); },
    setHotCorners: hotCorners => { set({ hotCorners }); save(); },
    setWeatherEffects: weatherEffects => { set({ weatherEffects }); save(); },
    setThemeMode: themeMode => {
      set({ themeMode });
      store(THEME_KEY, themeMode === "auto" ? null : themeMode);
      applyTheme(themeMode === "auto" ? systemTheme() : themeMode);
    },
    load: () => {
      const theme = read(THEME_KEY);
      set({ themeMode: theme === "light" || theme === "dark" ? theme : "auto" });
      try {
        const saved = JSON.parse(read(PREFS_KEY) ?? "null");
        if (saved) set({ brightness: clampBrightness(saved.brightness), reduceMotion: saved.reduceMotion === true, screenSaver: saved.screenSaver !== false, hotCorners: saved.hotCorners !== false, weatherEffects: saved.weatherEffects !== false });
      } catch { /* Ignore unreadable preferences. */ }
    },
  };
});

/** Control Centre's switch: picks an explicit theme, leaving Auto. */
export function setTheme(theme: Theme) {
  usePrefs.getState().setThemeMode(theme);
}

/** Resolves once the page is showing `theme`; the cross-fade can take a moment to swap it in. */
export function whenTheme(theme: Theme) {
  return new Promise<void>(resolve => {
    const root = document.documentElement;
    if (root.dataset.theme === theme) return resolve();
    const observer = new MutationObserver(() => {
      if (root.dataset.theme !== theme) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  });
}

export function setWallpaper(id: WallpaperId) {
  store(WALLPAPER_KEY, id === defaultWallpaper ? null : id);
  transition(() => { document.documentElement.dataset.wallpaper = id; });
}

function subscribeRoot(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-wallpaper"] });
  return () => observer.disconnect();
}

/** The theme on screen; null during server rendering. */
export function useTheme(): Theme | null {
  return useSyncExternalStore(subscribeRoot, () => document.documentElement.dataset.theme === "dark" ? "dark" : "light", () => null);
}

/** The wallpaper on screen; null during server rendering. */
export function useWallpaper(): WallpaperId | null {
  return useSyncExternalStore(subscribeRoot, () => {
    const id = document.documentElement.dataset.wallpaper;
    return isWallpaperId(id) ? id : defaultWallpaper;
  }, () => null);
}

/** Loads saved preferences, and follows the system theme while the mode is Auto. */
export function usePrefsSync() {
  useEffect(() => {
    usePrefs.getState().load();
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    const follow = () => {
      if (usePrefs.getState().themeMode === "auto") applyTheme(systemTheme());
    };
    scheme.addEventListener("change", follow);
    return () => scheme.removeEventListener("change", follow);
  }, []);

  // Keeps the London Sky wallpaper (and its Settings preview) in step with the real sky.
  useEffect(() => {
    const paint = () => {
      for (const [name, value] of Object.entries(skyVars(Date.now()))) document.documentElement.style.setProperty(name, value);
    };
    paint();
    const id = setInterval(paint, 60_000);
    document.addEventListener("visibilitychange", paint);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", paint);
    };
  }, []);

  const reduceMotion = usePrefs(s => s.reduceMotion);
  useEffect(() => {
    if (reduceMotion) document.documentElement.dataset.reduceMotion = "";
    else delete document.documentElement.dataset.reduceMotion;
  }, [reduceMotion]);
}
