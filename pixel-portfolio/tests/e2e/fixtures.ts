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

/**
 * Tests stay off the internet: the site under test answers for itself, song
 * previews are silent stand-ins, and every other outside request is blocked.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
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
