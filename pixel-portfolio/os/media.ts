"use client";

import { create } from "zustand";
import { tracks, type Track } from "@/content/music";

// The one music player for the whole OS. Music drives it, and the Dynamic
// Island and Control Centre show and control it while Music is out of sight.
// The audio element is created on the first play, inside the visitor's tap,
// which is what lets iPhone Safari start it.

type Media = {
  queue: Track[];
  index: number | null;
  playing: boolean;
  /** Milliseconds into the current preview. */
  progress: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  /** When playback last paused, so the island can linger for a moment before it goes. */
  pausedAt: number | null;
  /** Music's full-screen Now Playing view. */
  nowPlaying: boolean;
  play: (list: Track[], at: number) => void;
  toggle: () => void;
  pause: () => void;
  step: (by: 1 | -1) => void;
  seek: (ms: number) => void;
  setNowPlaying: (open: boolean) => void;
  /** Stops and forgets the track, as when Music quits. */
  stop: () => void;
  setVolume: (volume: number) => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeat: (repeat: boolean) => void;
};

export const PREVIEW_MS = 30_000;

let player: HTMLAudioElement | null = null;

function audio() {
  if (player) return player;
  const el = new Audio();
  el.preload = "auto";
  el.volume = useMedia.getState().volume;
  el.addEventListener("timeupdate", () => useMedia.setState({ progress: el.currentTime * 1000 }));
  el.addEventListener("durationchange", () => {
    if (Number.isFinite(el.duration)) useMedia.setState({ duration: el.duration * 1000 });
  });
  el.addEventListener("play", () => useMedia.setState({ playing: true, pausedAt: null }));
  el.addEventListener("pause", () => useMedia.setState({ playing: false, pausedAt: Date.now() }));
  el.addEventListener("ended", () => {
    const { index, queue, repeat, shuffle, play } = useMedia.getState();
    if (index === null) return;
    if (repeat) {
      el.currentTime = 0;
      el.play().catch(() => {});
      return;
    }
    const next = shuffle ? Math.floor(Math.random() * queue.length) : index + 1;
    if (next < queue.length) play(queue, next);
  });
  player = el;
  return el;
}

export const useMedia = create<Media>()((set, get) => ({
  queue: tracks,
  index: null,
  playing: false,
  progress: 0,
  duration: PREVIEW_MS,
  volume: 0.8,
  shuffle: false,
  repeat: false,
  pausedAt: null,
  nowPlaying: false,
  play: (list, at) => {
    const el = audio();
    set({ queue: list, index: at, progress: 0, duration: PREVIEW_MS });
    el.src = list[at].preview;
    el.play().catch(() => set({ playing: false }));
  },
  toggle: () => {
    const { index, queue, play } = get();
    if (index === null) return play(queue, 0);
    const el = audio();
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  },
  pause: () => player?.pause(),
  step: by => {
    const { index, queue, progress, play } = get();
    if (index === null) return play(queue, 0);
    if (by === -1 && progress > 3000 && player) {
      player.currentTime = 0;
      return;
    }
    play(queue, (index + by + queue.length) % queue.length);
  },
  seek: ms => {
    if (!player) return;
    player.currentTime = ms / 1000;
    set({ progress: ms });
  },
  setNowPlaying: nowPlaying => set({ nowPlaying }),
  stop: () => {
    if (player) {
      player.pause();
      player.removeAttribute("src");
      player.load();
    }
    set({ index: null, playing: false, progress: 0, pausedAt: null, nowPlaying: false });
  },
  setVolume: volume => {
    set({ volume });
    if (player) player.volume = volume;
  },
  setShuffle: shuffle => set({ shuffle }),
  setRepeat: repeat => set({ repeat }),
}));

/** The track loaded in the player, if any. */
export function selectTrack(state: Pick<Media, "queue" | "index">) {
  return state.index === null ? null : state.queue[state.index] ?? null;
}
