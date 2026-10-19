# Josh's portfolio

A portfolio that feels like the device you open it on: an iPhone-style home screen on phones, iPadOS on tablets and a macOS-style desktop with windows and a dock on computers. It opens on an About note in a Notes-style app.

## Development

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
npm run build
npm run typecheck
```

## How it fits together

- `app/[[...path]]/page.tsx`: one statically generated route for every URL. Each URL is an app (`/projects`, `/notes/curio`), so links can be shared and indexed. Moving between apps updates the address bar without remounting the OS.
- `os/`: the shell. It includes the window manager store, windows with traffic lights, dragging, resizing and zoom, the dock, the menu bar, the home screen, desktop widgets, Spotlight (⌘K) and Control Centre (dark mode, brightness, Reduce Motion).
- `os/preflight.ts` and `os/shell.ts`: choose the phone, tablet or desktop shell before first paint, from width and pointer type. The DOM is the same for all three shells and CSS lays out each one, so server rendering never guesses wrong.
- `apps/`: the twelve apps. They adapt to their window size with container queries, so a narrow desktop window behaves like the iPhone version. To hide an app until it's ready, set `ready: false` in `os/routes.ts`. That removes it from the dock, home screen, Spotlight, menus, sitemap and URLs.
  - **Notes, Projects, Résumé, Contacts:** the About note, case studies, the CV (Save as PDF prints just the page), and the LinkedIn and GitHub links.
  - **Messages:** Josh's assistant, using Claude Haiku 5.5, with ElevenLabs voice.
  - **Terminal:** a virtual filesystem built from `content/`, with commands and hidden extras. `help` lists the visible commands.
  - **Arcade:** Pong, Snake and Bricks on one canvas engine in `apps/arcade/engine.ts`, plus Lab Hangout embedded live.
  - **Activity:** public GitHub data through `/api/github`, cached for an hour.
  - **Maps:** MapLibre with OpenFreeMap tiles (no key). `scripts/copy-vendor.mjs` copies its web worker into `public/vendor/` before every dev run and build.
  - **Music:** the songs in `content/music.json`, with 30-second previews. To change the list, edit the IDs in `scripts/update-music.mjs` and run it.
  - **Photos:** project screenshots plus illustrated placeholders.
  - **Settings:** wallpaper, appearance and accessibility.
- `app/wallpapers.css` and `os/wallpapers.ts`: the wallpapers, drawn with CSS gradients. The saved choice is applied before first paint.
- `app/api/weather/route.ts` and `lib/weather.ts`: London weather for the widgets. It tries Open-Meteo, then MET Norway, and caches successful responses for 30 minutes. Neither needs an API key.
- `content/`: notes and project write-ups. Edit these to change what the site says.

## Messages assistant

- `app/api/chat/route.ts` streams replies from Claude Haiku 5.5. Its instructions are generated from `content/` in `lib/server/assistant.ts` and prompt-cached.
- `app/api/speak/route.ts` reads a reply aloud with ElevenLabs. It accepts only IDs of replies the assistant just wrote, never free text.
- `lib/server/guard.ts` enforces the same-origin check and the rate limits (per visitor and site-wide, per day) in Upstash Redis. Visitors are identified by a hash of their IP address. Locally, without Redis, the limits fall back to memory. On Vercel, without Redis, the endpoints refuse requests.
- Conversations live only in the visitor's browser tab. Usage counts, without message content, are logged for cost tracking.

## Environment variables

Copy `.env.example` to `.env.local` and fill it in. Every key is read only on the server; never give one a `NEXT_PUBLIC_` prefix. Optional: `ELEVENLABS_VOICE_ID` to change the voice, and `GITHUB_TOKEN` (any token with no scopes) to raise the GitHub rate limit for Activity. The Upstash `KV_*` variables come from the Vercel integration.

After every build, `scripts/check-secrets.mjs` scans the build output for the actual secret values and fails the build if any are found.

## Content

The coursework result (90%, highest in the year) and Josh's individual contribution were supplied by Josh. Curio is described only as an in-progress final-year web and iOS project for solo travellers. App icons and wallpaper are original artwork in the spirit of Apple's platforms, not copies of them.
