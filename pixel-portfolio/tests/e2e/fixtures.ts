import { test as base, expect, type Page } from "@playwright/test";

/** A silent 8-bit WAV, standing in for Apple's 30-second song previews. */
function silentWav(seconds: number) {
  const rate = 8000;
  const samples = rate * seconds;
  const wav = Buffer.alloc(44 + samples, 128);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + samples, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate, 28);
  wav.writeUInt16LE(1, 32);
  wav.writeUInt16LE(8, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples, 40);
  return wav;
}

const silence = silentWav(20);

const poster = "https://a.ltrbxd.com/resized/film-poster/1/2/3/123-film-0-600-0-900-crop.jpg";
/** A small, fixed diary, so the TV tests don't depend on Letterboxd. */
export const diary = {
  user: "josh098900",
  profile: "https://letterboxd.com/josh098900/",
  updated: "2026-10-20T00:00:00.000Z",
  films: [
    { id: "1", title: "Tenzing", year: 2026, rating: 5, liked: true, rewatch: false, watched: "2026-10-19", poster, url: "https://letterboxd.com/josh098900/film/tenzing/", review: "A true masterpiece!", spoilers: false },
    { id: "2", title: "Hamnet", year: 2025, rating: 4.5, liked: true, rewatch: false, watched: "2026-08-17", poster, url: "https://letterboxd.com/josh098900/film/hamnet/", review: "That's all I have to say.", spoilers: false },
    { id: "3", title: "F1", year: 2025, rating: 3, liked: false, rewatch: true, watched: "2026-04-11", poster, url: "https://letterboxd.com/josh098900/film/f1/", review: null, spoilers: false },
  ],
};

/**
 * Tests stay off the internet: the site under test answers for itself, song
 * previews are silent stand-ins, and every other outside request is blocked.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("**/api/letterboxd", route => route.fulfill({ json: diary }));
    await page.route(url => url.hostname !== "127.0.0.1", route => {
      if (new URL(route.request().url()).hostname === "audio-ssl.itunes.apple.com") {
        return route.fulfill({ contentType: "audio/wav", body: silence });
      }
      return route.abort();
    });
    await use(page);
  },
});

export { expect };

/** The OS window for an app. */
export const appWindow = (page: Page, app: string) => page.locator(`section[aria-labelledby="window-title-${app}"]`);
