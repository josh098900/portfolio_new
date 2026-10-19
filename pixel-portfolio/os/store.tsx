"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import { homeRoute, type AppId, type Route } from "./routes";

export type Rect = { x: number; y: number; w: number; h: number };

export type Overlay = "spotlight" | "control-centre" | "screensaver" | null;

export type WindowState = {
  app: AppId;
  sub: string[];
  minimised: boolean;
  zoomed: boolean;
  /** Desktop position. Null until the window is first moved, so CSS can place it. */
  rect: Rect | null;
  z: number;
  /** Order the window was opened in, used to cascade default positions. */
  slot: number;
};

type OSState = {
  windows: Partial<Record<AppId, WindowState>>;
  nextZ: number;
  overlay: Overlay;
  setOverlay: (overlay: Overlay) => void;
  toggleOverlay: (overlay: Exclude<Overlay, null>) => void;
  open: (route: Route) => void;
  /** Dock and home screen: restore the app where it was, or open its default view. */
  launch: (app: AppId) => void;
  navigate: (app: AppId, sub: string[]) => void;
  close: (app: AppId) => void;
  minimise: (app: AppId) => void;
  toggleZoom: (app: AppId) => void;
  focus: (app: AppId) => void;
  setRect: (app: AppId, rect: Rect) => void;
  goHome: () => void;
  /** Closes everything and reopens the About note, as on a first visit. */
  reset: () => void;
};

function createOSStore(initial: Route | null) {
  return createStore<OSState>()((set, get) => {
    const update = (app: AppId, patch: Partial<WindowState>) => set(state => {
      const current = state.windows[app];
      return current ? { windows: { ...state.windows, [app]: { ...current, ...patch } } } : state;
    });

    return {
      windows: initial ? { [initial.app]: { app: initial.app, sub: initial.sub, minimised: false, zoomed: false, rect: null, z: 1, slot: 0 } } : {},
      nextZ: 2,
      overlay: null,
      setOverlay: overlay => set({ overlay }),
      toggleOverlay: overlay => set(state => ({ overlay: state.overlay === overlay ? null : overlay })),
      open: ({ app, sub }) => set(state => {
        const current = state.windows[app];
        const slot = current?.slot ?? Object.keys(state.windows).length;
        const next: WindowState = current
          ? { ...current, sub, minimised: false, z: state.nextZ }
          : { app, sub, minimised: false, zoomed: false, rect: null, z: state.nextZ, slot };
        return { windows: { ...state.windows, [app]: next }, nextZ: state.nextZ + 1 };
      }),
      launch: app => get().open({ app, sub: get().windows[app]?.sub ?? (app === homeRoute.app ? homeRoute.sub : []) }),
      navigate: (app, sub) => update(app, { sub }),
      close: app => set(state => {
        const windows = { ...state.windows };
        delete windows[app];
        return { windows };
      }),
      minimise: app => update(app, { minimised: true }),
      toggleZoom: app => update(app, { zoomed: !get().windows[app]?.zoomed }),
      focus: app => {
        const current = get().windows[app];
        if (!current || current.z === get().nextZ - 1) return;
        set(state => ({ windows: { ...state.windows, [app]: { ...current, z: state.nextZ } }, nextZ: state.nextZ + 1 }));
      },
      setRect: (app, rect) => update(app, { rect, zoomed: false }),
      reset: () => set(state => ({
        windows: { [homeRoute.app]: { app: homeRoute.app, sub: homeRoute.sub, minimised: false, zoomed: false, rect: null, z: state.nextZ, slot: 0 } },
        nextZ: state.nextZ + 1,
        overlay: null,
      })),
      goHome: () => set(state => ({
        windows: Object.fromEntries(Object.entries(state.windows).map(([id, w]) => [id, { ...w, minimised: true }])),
      })),
    };
  });
}

/** The visible window with the highest z-index, which is the focused app. */
export function selectFocused(state: Pick<OSState, "windows">): WindowState | null {
  let top: WindowState | null = null;
  for (const w of Object.values(state.windows)) {
    if (w && !w.minimised && (!top || w.z > top.z)) top = w;
  }
  return top;
}

const OSContext = createContext<StoreApi<OSState> | null>(null);

export function OSProvider({ initial, children }: { initial: Route | null; children: ReactNode }) {
  const [store] = useState(() => createOSStore(initial));
  return <OSContext.Provider value={store}>{children}</OSContext.Provider>;
}

export function useOS<T>(selector: (state: OSState) => T): T {
  const store = useContext(OSContext);
  if (!store) throw new Error("useOS must be used inside OSProvider");
  return useStore(store, selector);
}

export function useOSStore() {
  const store = useContext(OSContext);
  if (!store) throw new Error("useOSStore must be used inside OSProvider");
  return store;
}
