"use client";

import { create } from "zustand";
import type { GlyphName } from "./icons";
import type { AppId } from "./routes";

// Things happening in the background that the Dynamic Island shows: the
// assistant speaking, and short-lived alerts such as a reply arriving.

export type Alert = {
  id: number;
  glyph: GlyphName;
  title: string;
  detail?: string;
  /** Tapping the alert opens this app. */
  app?: AppId;
  tint?: string;
};

type Live = {
  /** Set while the assistant's voice plays; `stop` silences it. */
  speaking: { stop: () => void } | null;
  alert: Alert | null;
  setSpeaking: (speaking: Live["speaking"]) => void;
  flash: (alert: Omit<Alert, "id">) => void;
  dismiss: () => void;
};

const ALERT_MS = 2800;
let nextId = 1;
let timer: ReturnType<typeof setTimeout> | undefined;

export const useLive = create<Live>()(set => ({
  speaking: null,
  alert: null,
  setSpeaking: speaking => set({ speaking }),
  flash: alert => {
    clearTimeout(timer);
    set({ alert: { ...alert, id: nextId++ } });
    timer = setTimeout(() => set({ alert: null }), ALERT_MS);
  },
  dismiss: () => {
    clearTimeout(timer);
    set({ alert: null });
  },
}));
