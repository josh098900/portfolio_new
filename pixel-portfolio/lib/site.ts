// The public address, used for absolute URLs in link previews and the sitemap.
// Vercel provides the production domain; local builds fall back to localhost.
const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = production ? `https://${production}` : "http://localhost:3000";

export const siteName = "Josh's Portfolio";

export const defaultShareImage = { url: "/og.jpg", width: 1200, height: 630, alt: "Josh's portfolio: an About note in a Notes-style window on a Mac-like desktop" };
