"use client";

import { create } from "zustand";
import type { GlyphName } from "./icons";

// Game Center-style achievements for exploring the portfolio. Earned ones are
// kept in this browser only. Anything can award one with achieve(id), or by
// dispatching a "josh:achieve" event with the id as its detail.

export type Achievement = { id: string; title: string; hint: string; glyph: GlyphName };

export const achievements: Achievement[] = [
  { id: "explorer", title: "Window Shopper", hint: "Open five different apps.", glyph: "apps" },
  { id: "completionist", title: "Completionist", hint: "Open every app.", glyph: "star" },
  { id: "case-study", title: "Case Closed", hint: "Read one of Josh's case studies.", glyph: "folder" },
  { id: "resume", title: "Hiring Manager", hint: "Open Josh's résumé.", glyph: "note" },
  { id: "airdrop", title: "Special Delivery", hint: "AirDrop the CV to yourself.", glyph: "share" },
  { id: "small-talk", title: "Small Talk", hint: "Ask Josh's assistant a question.", glyph: "bubble" },
  { id: "voice", title: "Voice Activated", hint: "Give a voice command.", glyph: "mic" },
  { id: "hacker", title: "Hacker", hint: "Find a hidden Terminal command.", glyph: "more" },
  { id: "genie", title: "Genie in a Bottle", hint: "Minimise a window on a Mac.", glyph: "minus" },
  { id: "tiling", title: "Neat Freak", hint: "Tile a window to one side.", glyph: "sidebar" },
  { id: "mission-control", title: "Mission Control", hint: "See every window at once.", glyph: "table" },
  { id: "hello", title: "hello", hint: "Watch the screen saver.", glyph: "sun" },
  { id: "spatial", title: "Spatial Computing", hint: "Try visionOS mode.", glyph: "vision" },
  { id: "magnifier", title: "Up Close", hint: "Look through the glass magnifier.", glyph: "search" },
  { id: "night-owl", title: "Night Owl", hint: "Switch to Dark Mode.", glyph: "moon" },
  { id: "londoner", title: "Londoner", hint: "Set the London Sky wallpaper.", glyph: "wallpaper" },
  { id: "weather", title: "Weather Maker", hint: "Make it rain or snow.", glyph: "rain" },
  { id: "dj", title: "DJ", hint: "Play a song.", glyph: "musicNote" },
  { id: "film-buff", title: "Film Buff", hint: "See what Josh has been watching.", glyph: "tv" },
  { id: "pet", title: "Good Critter", hint: "Pet the critter on the dock.", glyph: "heartFill" },
  { id: "snake", title: "Snake Charmer", hint: "Score 10 in Snake.", glyph: "gamepad" },
  { id: "pong", title: "Champion", hint: "Win a game of Pong.", glyph: "gamepad" },
];

const KEY = "josh-achievements";

type State = {
  earned: Record<string, number>;
  /** The newest one, for the notification. */
  latest: Achievement | null;
  load: () => void;
  achieve: (id: string) => void;
  clearLatest: () => void;
};

export const useAchievements = create<State>()((set, get) => ({
  earned: {},
  latest: null,
  load: () => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      if (saved && typeof saved === "object") set({ earned: saved });
    } catch { /* Start fresh. */ }
  },
  achieve: id => {
    const found = achievements.find(a => a.id === id);
    if (!found || get().earned[id]) return;
    const earned = { ...get().earned, [id]: Date.now() };
    set({ earned, latest: found });
    try { localStorage.setItem(KEY, JSON.stringify(earned)); } catch { /* Still shown for this visit. */ }
  },
  clearLatest: () => set({ latest: null }),
}));

export const achieve = (id: string) => useAchievements.getState().achieve(id);
