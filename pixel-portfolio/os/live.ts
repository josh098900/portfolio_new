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
  /** True while the assistant is writing a reply. */
  thinking: boolean;
  /** Voice: listening, what was heard so far, and what was done. */
  listening: boolean;
  heard: string;
  /** A question for the assistant, asked by voice; Messages sends it when it opens. */
  question: string | null;
  setVoice: (patch: Partial<Pick<Live, "listening" | "heard" | "question">>) => void;
  /** Set while the assistant's voice plays; `stop` silences it. */
  speaking: { stop: () => void } | null;
  alert: Alert | null;
  /** Terminal's rain, snow and clear commands override London's real weather until reload. */
  sky: "live" | "rain" | "snow" | "clear";
  setSky: (sky: Live["sky"]) => void;
  setThinking: (thinking: boolean) => void;
  setSpeaking: (speaking: Live["speaking"]) => void;
  /** Shows an alert now, or with `queue`, after the one showing (and any waiting) has had its turn. */
  flash: (alert: Omit<Alert, "id">, options?: { queue?: boolean }) => void;
  dismiss: () => void;
};

const ALERT_MS = 2800;
let nextId = 1;
let timer: ReturnType<typeof setTimeout> | undefined;

const waiting: Omit<Alert, "id">[] = [];

export const useLive = create<Live>()((set, get) => {
  const show = (alert: Omit<Alert, "id">) => {
    clearTimeout(timer);
    set({ alert: { ...alert, id: nextId++ } });
    timer = setTimeout(next, ALERT_MS);
  };
  // When an alert has had its time, the next one waiting takes its place.
  const next = () => {
    const queued = waiting.shift();
    if (queued) show(queued);
    else set({ alert: null });
  };
  return {
    thinking: false,
    listening: false,
    heard: "",
    question: null,
    setVoice: patch => set(patch),
    speaking: null,
    alert: null,
    sky: "live",
    setSky: sky => set({ sky }),
    setThinking: thinking => set({ thinking }),
    setSpeaking: speaking => set({ speaking }),
    flash: (alert, options) => {
      if (options?.queue && get().alert) {
        waiting.push(alert);
        return;
      }
      show(alert);
    },
    dismiss: () => {
      clearTimeout(timer);
      next();
    },
  };
});
