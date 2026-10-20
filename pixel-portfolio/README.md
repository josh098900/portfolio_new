# Josh's portfolio

[![CI](https://github.com/josh098900/portfolio_new/actions/workflows/ci.yml/badge.svg)](https://github.com/josh098900/portfolio_new/actions/workflows/ci.yml)

A portfolio that feels like the device you open it on: an iPhone-style home screen on phones, iPadOS on tablets and a macOS-style desktop with windows and a dock on computers. It opens on an About note in a Notes-style app.

## Development

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
npm run build
npm run typecheck
npm test           # unit tests (Vitest)
npm run test:e2e   # browser tests (Playwright); run `npm run build` first
```

The first time you run the browser tests, install the browsers with `npx playwright install chromium webkit`.

## How it fits together

- `app/[[...path]]/page.tsx`: one statically generated route for every URL. Each URL is an app (`/projects`, `/notes/curio`), so links can be shared and indexed. Moving between apps updates the address bar without remounting the OS.
- `os/`: the shell. It includes the window manager store, windows with traffic lights, dragging, resizing and zoom, the dock, the menu bar, the home screen, desktop widgets, Spotlight (⌘K) and Control Centre (dark mode, brightness, Reduce Motion).
- `os/preflight.ts` and `os/shell.ts`: choose the phone, tablet or desktop shell before first paint, from width and pointer type. The DOM is the same for all three shells and CSS lays out each one, so server rendering never guesses wrong.
- `apps/`: the apps. They adapt to their window size with container queries, so a narrow desktop window behaves like the iPhone version. To hide an app until it's ready, set `ready: false` in `os/routes.ts`. That removes it from the dock, home screen, Spotlight, menus, sitemap and URLs.
  - **Notes, Projects, Résumé, Contacts:** the About note, case studies, the CV (Save as PDF prints just the page), and the LinkedIn and GitHub links.
  - **Messages:** Josh's assistant, using Claude Haiku 5.5, with ElevenLabs voice.
  - **Terminal:** a virtual filesystem built from `content/`, with commands and hidden extras. `help` lists the visible commands.
  - **Arcade:** Pong, Snake and Bricks on one canvas engine in `apps/arcade/engine.ts`, plus Lab Hangout embedded live.
  - **Activity:** public GitHub data through `/api/github`, cached for an hour.
  - **Maps:** MapLibre with OpenFreeMap tiles (no key). `scripts/copy-vendor.mjs` copies its web worker into `public/vendor/` before every dev run and build.
  - **Music:** the songs in `content/music.json`, with 30-second previews. To change the list, edit the IDs in `scripts/update-music.mjs` and run it.
  - **Photos:** project screenshots plus illustrated placeholders.
  - **Settings:** wallpaper, appearance and accessibility.
  - **TV:** recent films from Josh's public Letterboxd RSS feed through `/api/letterboxd`, cached for an hour. The username is `letterboxdUser` in `content/links.ts`; TV stays hidden while it's empty.
- `os/window.tsx`: also the genie effect. Minimising on the Mac builds Web Animations keyframes from the window's and dock icon's positions: a curved `clip-path` funnel plus a stretch, played backwards to restore.
- `os/liquid-glass.tsx`: Liquid Glass refraction. In Chromium on desktop, glass marked `data-liquid` (the dock and widgets) gets an SVG displacement filter as its backdrop filter, sized to its corners. Other browsers keep frosted glass.
- `os/sky.ts`: the London Sky wallpaper. It works out the sun's position over London for the current minute and returns colours as CSS variables. It's self-contained because the pre-paint script inlines it, so the sky is right before the page loads.
- `os/screensaver.tsx`: the Mac's hello screen saver, after two minutes idle (switchable in Settings) or from the  menu.
- `os/glow.tsx`: the Apple Intelligence glow around the screen while the assistant thinks or speaks.
- `apps/music/now-playing.tsx`: the full-screen player, with a backdrop drawn from the album art. Swipe down or press Escape to close it.
- `os/tiling.ts`: window tiling (halves, quarters, fill, centre) from dragging to edges, the green button's menu or the Window menu.
- `os/mission-control.tsx`: Mission Control, hot corners (Mission Control, screen saver, Show Desktop) and Show Desktop.
- `os/weather-fx.tsx`: rain and snow on a canvas behind the windows, following London's live weather (Terminal: `rain`, `snow`, `clear`).
- `os/pet.tsx`: the pixel lab critter on the dock.
- `os/standby.tsx`: iPhone StandBy in landscape on the home screen.
- `os/magnifier.tsx`: the Liquid Glass magnifier (hold ⌥), a displacement-filter lens in Chromium.
- `os/spatial.tsx` and the end of `app/globals.css`: visionOS mode.
- `os/voice.tsx` and `os/voice-commands.ts`: voice commands through the browser's speech recognition; what isn't a command becomes a question for the assistant.
- `os/achievements.ts` and `os/achievement-watcher.tsx`: achievements, kept in the browser, listed in Arcade.
- `apps/appstore/`: the projects as App Store listings. `apps/resume/airdrop.tsx` and `lib/resume-pdf.ts`: AirDrop, and the CV written as a PDF with no library.
- `os/island.tsx`: the iPhone Dynamic Island. It shows music playing (from the shared player in `os/media.ts`), the assistant speaking and short alerts (`os/live.ts`) while their apps are out of sight, and expands into controls when tapped.
- `app/wallpapers.css` and `os/wallpapers.ts`: the wallpapers, drawn with CSS gradients. The saved choice is applied before first paint.
- `app/api/weather/route.ts` and `lib/weather.ts`: London weather for the widgets. It tries Open-Meteo, then MET Norway, and caches successful responses for 30 minutes. Neither needs an API key.
- `content/`: notes and project write-ups. Edit these to change what the site says.

## Messages assistant

- `app/api/chat/route.ts` streams replies from Claude Haiku 5.5. Its instructions are generated from `content/` in `lib/server/assistant.ts` and prompt-cached.
- `app/api/speak/route.ts` reads a reply aloud with ElevenLabs. It accepts only IDs of replies the assistant just wrote, never free text.
- `lib/server/guard.ts` enforces the same-origin check and the rate limits (per visitor and site-wide, per day) in Upstash Redis. Visitors are identified by a hash of their IP address. Locally, without Redis, the limits fall back to memory. On Vercel, without Redis, the endpoints refuse requests.
- Conversations live only in the visitor's browser tab. Usage counts, without message content, are logged for cost tracking.

## Tests

- `tests/unit/` (Vitest): routing, the Letterboxd parser, the weather fallback, the rate limits and same-origin check, the chat API's validation, and content and privacy rules (no email address or phone number anywhere, no `NEXT_PUBLIC_` variables, no published PDFs). None of them call Anthropic, ElevenLabs or Redis.
- `tests/e2e/` (Playwright): a production build driven as a Mac (Chrome), an iPhone (WebKit) and an Android phone (Chrome), plus axe accessibility checks on every app in light and dark mode. The test server runs with every API key blanked, so a run can never spend credit, and outside requests are blocked or stubbed.
- `.github/workflows/ci.yml` runs both on every push and pull request.

## Environment variables

Copy `.env.example` to `.env.local` and fill it in. Every key is read only on the server; never give one a `NEXT_PUBLIC_` prefix. Optional: `ELEVENLABS_VOICE_ID` to change the voice, and `GITHUB_TOKEN` (any token with no scopes) to raise the GitHub rate limit for Activity. The Upstash `KV_*` variables come from the Vercel integration.

After every build, `scripts/check-secrets.mjs` scans the build output for the actual secret values and fails the build if any are found.

## Content

The coursework result (90%, highest in the year) and Josh's individual contribution were supplied by Josh. Curio is described only as an in-progress final-year web and iOS project for solo travellers. App icons and wallpaper are original artwork in the spirit of Apple's platforms, not copies of them.
