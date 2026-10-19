// Plain module (no "use client") so the pre-paint script can validate saved choices.
// Colours live in app/wallpapers.css, keyed by data-wallpaper.

export const wallpapers = [
  { id: "aurora", name: "Aurora", note: "Pastel by day, starry by night" },
  { id: "dune", name: "Dune", note: "Sandstone and terracotta" },
  { id: "lagoon", name: "Lagoon", note: "Shallow water and deep blue" },
  { id: "meadow", name: "Meadow", note: "Long grass in late sun" },
  { id: "dusk", name: "Dusk", note: "The last ten minutes of sunset" },
  { id: "graphite", name: "Graphite", note: "Quiet and neutral" },
  { id: "starfield", name: "Starfield", note: "Night, all day" },
] as const;

export type WallpaperId = (typeof wallpapers)[number]["id"];

export const defaultWallpaper: WallpaperId = "aurora";

export function isWallpaperId(value: unknown): value is WallpaperId {
  return wallpapers.some(w => w.id === value);
}
