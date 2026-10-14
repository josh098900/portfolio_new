# Josh's portfolio

A minimal Next.js portfolio with light and dark themes, three project stories, and a current-work section for Curio.

## Development

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Next.js. The development server binds to `127.0.0.1`.

```sh
npm run build
npm run start
npm run typecheck
```

## Content

- `app/page.tsx`: introduction, database contribution, Curio, and about copy.
- `data/projects.ts`: project links, technologies, and individual project stories.
- `app/globals.css`: responsive layouts and both colour palettes.
- `public/projects`: screenshots from the linked projects, captured in October 2026.

The first visit follows the system colour scheme. The theme button saves an explicit preference locally. Fonts are bundled locally through Fontsource, with no runtime font service dependency. The site has no analytics, contact form, credentials, or database dependency.

## Content sources

- Academy Fantasy repository: https://github.com/josh098900/f1academy
- Academy Fantasy completed trial and standings: https://f1academy-mu.vercel.app/
- Lab Hangout repository and credits: https://github.com/josh098900/clawd_hangout
- Lab Hangout character creator: https://lab-hangout.vercel.app/
- Database coursework schema and ERD: https://github.com/InterMaus1154/dbprin_25_cw

The coursework result (90%, highest in the year) and Josh's individual contribution were supplied by Josh. Curio is described only as an in-progress final-year web/iOS project for solo travellers; its decorative contour graphic is portfolio artwork, not a screenshot of the app.

## Deployment

The application can be deployed as a standard Next.js project, with `pixel-portfolio` as the project root. No environment variables are required. This first version is prepared in the existing local repository for review.
