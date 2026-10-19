import data from "./music.json";

// What Josh listens to, hard-coded. Track details, artwork and 30-second previews
// come from Apple's public iTunes lookup API via scripts/update-music.mjs.

export type Track = (typeof data.tracks)[number];

export const tracks: Track[] = data.tracks;

export const artists = ["Avicii", "Tiësto", "Gigi Perez"] as const;

/** Apple's image server sizes artwork on request and serves WebP at about half the bytes. */
export function artwork(track: Track, size: number) {
  return track.artwork.replace(/\{size\}/g, String(size)).replace(/\.jpg$/, ".webp");
}

const pick = (...ids: string[]) => ids.map(id => tracks.find(t => t.id === id)!).filter(Boolean);

export const playlists = [
  { id: "on-repeat", name: "On Repeat", note: "The songs Josh plays most.", tracks: pick("1770187510", "1440872929", "1532019310", "1774612172", "1807714119", "1652508861", "1440842496") },
  { id: "car-vibes", name: "Car Vibes", note: "Windows down, volume up.", tracks: pick("1440787349", "1443265809", "1590438674", "1807714126", "1479127509", "1807389983", "1462628896") },
];

export function formatDuration(ms: number) {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
