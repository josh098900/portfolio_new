// Regenerates content/music.json from Apple's public iTunes lookup API.
// Edit the IDs below (find them with https://itunes.apple.com/search?term=...&entity=song),
// then run: node scripts/update-music.mjs
import { writeFileSync } from "node:fs";

const picks = {
  Avicii: [1440872929, 1440787349, 1807714119, 1807714126, 1440842496, 1462628896, 1440899202],
  "Tiësto": [1532019310, 1652508861, 1443265809, 1793816548, 1590438674, 1479127509],
  "Gigi Perez": [1770187510, 1774612172, 1807389983, 1770187916, 1827330737],
};

const ids = Object.values(picks).flat();
const res = await fetch(`https://itunes.apple.com/lookup?id=${ids.join(",")}&country=gb`);
if (!res.ok) throw new Error(`iTunes lookup failed: ${res.status}`);
const { results } = await res.json();
const byId = new Map(results.filter(r => r.wrapperType === "track").map(r => [r.trackId, r]));

const tracks = Object.entries(picks).flatMap(([artist, list]) => list.map(id => {
  const r = byId.get(id);
  if (!r) throw new Error(`Track ${id} (${artist}) wasn't found`);
  return {
    id: String(r.trackId),
    title: r.trackName.replace(/ \(feat\..*\)$/, ""),
    artist: r.artistName,
    group: artist,
    album: r.collectionName,
    year: r.releaseDate.slice(0, 4),
    durationMs: r.trackTimeMillis,
    artwork: r.artworkUrl100.replace("100x100bb", "{size}x{size}bb"),
    preview: r.previewUrl,
    appleMusic: r.trackViewUrl.split("?")[0],
  };
}));

writeFileSync(new URL("../content/music.json", import.meta.url), JSON.stringify({ updated: new Date().toISOString().slice(0, 10), tracks }, null, 2) + "\n");
console.log(`Wrote ${tracks.length} tracks.`);
