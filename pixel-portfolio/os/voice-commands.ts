import { tracks, artists } from "@/content/music";
import { games } from "@/apps/arcade/games";
import { apps, readyApps, type AppId, type Route } from "./routes";
import type { Layout } from "./tiling";

// Turns what someone said into something the OS can do. Plain code with no
// browser APIs, so it's unit-tested; os/voice.tsx listens and acts.

export type Command =
  | { kind: "open"; route: Route; say: string }
  | { kind: "play"; ids: string[]; say: string }
  | { kind: "pause" | "next" | "previous"; say: string }
  | { kind: "theme"; theme: "light" | "dark"; say: string }
  | { kind: "overlay"; overlay: "screensaver" | "mission-control" | "spotlight"; say: string }
  | { kind: "tile"; layout: Layout; say: string }
  | { kind: "sky"; sky: "rain" | "snow" | "live"; say: string }
  | { kind: "ask"; question: string; say: string };

const names: [AppId, string[]][] = [
  ["resume", ["resume", "résumé", "cv", "c v", "curriculum vitae"]],
  ["projects", ["projects", "project", "work", "case studies", "finder"]],
  ["contact", ["contact", "contacts", "linkedin", "get in touch"]],
  ["messages", ["messages", "assistant", "chat"]],
  ["notes", ["notes", "about", "about josh", "about me"]],
  ["maps", ["maps", "map"]],
  ["photos", ["photos", "pictures"]],
  ["music", ["music", "songs", "apple music"]],
  ["tv", ["tv", "films", "movies", "letterboxd"]],
  ["appstore", ["app store", "store"]],
  ["arcade", ["arcade", "games", "achievements"]],
  ["activity", ["activity", "github", "rings"]],
  ["terminal", ["terminal", "command line", "shell"]],
  ["settings", ["settings", "preferences", "wallpaper"]],
];

function findApp(phrase: string): AppId | null {
  const cleaned = phrase.replace(/^(josh'?s|joshs|your|the|my|me)\s+/g, "").replace(/\s+(app|please)$/g, "").trim();
  for (const [app, words] of names) {
    if (readyApps.includes(app) && words.some(w => cleaned === w || cleaned.endsWith(` ${w}`))) return app;
  }
  return null;
}

const label: Partial<Record<AppId, string>> = { resume: "Josh's résumé", tv: "TV", appstore: "the App Store" };

export function interpret(heard: string): Command {
  const text = heard.toLowerCase().replace(/[.!?,]/g, "").replace(/^(hey |ok |okay )?(josh|siri)\s*/, "").replace(/\b(please|can you|could you)\b/g, "").replace(/\s+/g, " ").trim();

  // Questions are for the assistant, even when they mention an app.
  if (/^(what|who|why|how|where|when|is|are|does|do|did|has|have|can|could|tell|which)\b/.test(text)) return { kind: "ask", question: heard.trim(), say: "Asking Josh's assistant" };

  if (/^(dark mode|turn on dark mode|go dark|lights off)$/.test(text)) return { kind: "theme", theme: "dark", say: "Dark Mode on" };
  if (/^(light mode|turn on light mode|lights on)$/.test(text)) return { kind: "theme", theme: "light", say: "Light Mode on" };
  if (/(screen ?saver|say hello)/.test(text)) return { kind: "overlay", overlay: "screensaver", say: "hello" };
  if (/(mission control|show (all |me )?(my |the )?windows)/.test(text)) return { kind: "overlay", overlay: "mission-control", say: "Mission Control" };
  if (/^(search|spotlight)$/.test(text)) return { kind: "overlay", overlay: "spotlight", say: "Spotlight" };
  const tile = text.match(/^(tile|snap|move)( it| this| the window)?( to the)? (left|right|top|bottom)( half| side)?$/);
  if (tile) return { kind: "tile", layout: tile[4] as Layout, say: `Tiled ${tile[4]}` };
  if (/^(fill( the)? screen|maximi[sz]e)$/.test(text)) return { kind: "tile", layout: "fill", say: "Filled the screen" };
  if (/(make it rain|let it rain|^rain$)/.test(text)) return { kind: "sky", sky: "rain", say: "Making it rain" };
  if (/(let it snow|make it snow|^snow$)/.test(text)) return { kind: "sky", sky: "snow", say: "Let it snow" };
  if (/^(stop the (rain|snow)|clear (the )?(weather|skies))$/.test(text)) return { kind: "sky", sky: "live", say: "Back to London's weather" };
  if (/^(pause|stop)( the)?( music| song)?$/.test(text)) return { kind: "pause", say: "Paused" };
  if (/^(next|skip)( song| track)?$/.test(text)) return { kind: "next", say: "Next song" };
  if (/^(previous|go back|last)( song| track)?$/.test(text)) return { kind: "previous", say: "Previous song" };

  const play = text.match(/^(play|put on)( me)?( some)?( a)? (.+)$/);
  if (play) {
    const wanted = play[5].replace(/^(song|songs|music) (by )?/, "").replace(/ (songs|music)$/, "").trim();
    const game = games.find(g => g.name.toLowerCase() === wanted);
    if (game) return { kind: "open", route: { app: "arcade", sub: [game.id] }, say: `Starting ${game.name}` };
    const artist = artists.find(a => a.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "") === wanted.normalize("NFD").replace(/\p{M}/gu, ""));
    if (artist) return { kind: "play", ids: tracks.filter(t => t.group === artist).map(t => t.id), say: `Playing ${artist}` };
    const song = tracks.find(t => t.title.toLowerCase() === wanted) ?? tracks.find(t => t.title.toLowerCase().includes(wanted));
    if (song) return { kind: "play", ids: [song.id, ...tracks.filter(t => t.id !== song.id).map(t => t.id)], say: `Playing ${song.title}` };
    if (/^(music|something|a song)$/.test(wanted)) return { kind: "play", ids: tracks.map(t => t.id), say: "Playing Josh's music" };
  }

  const open = text.match(/^(open|show( me)?|go to|launch|take me to|start)( up)? (.+)$/);
  if (open) {
    const app = findApp(open[4]);
    if (app) return { kind: "open", route: { app, sub: app === "notes" ? ["about"] : [] }, say: `Opening ${label[app] ?? apps[app].name}` };
  }
  // A bare app name ("films", "Josh's CV") only counts in a short phrase.
  const bare = text.split(" ").length <= 3 ? findApp(text) : null;
  if (bare) return { kind: "open", route: { app: bare, sub: bare === "notes" ? ["about"] : [] }, say: `Opening ${label[bare] ?? apps[bare].name}` };
  if (/(hire josh|contact josh|get in touch)/.test(text)) return { kind: "open", route: { app: "contact", sub: [] }, say: "Opening Josh's contact card" };

  return { kind: "ask", question: heard.trim(), say: "Asking Josh's assistant" };
}
