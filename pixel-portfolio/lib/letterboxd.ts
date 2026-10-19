// Josh's recent films for the TV app, from the public Letterboxd RSS feed
// (no key needed). Successful responses are cached for an hour.

import { letterboxdUser } from "@/content/links";

const HOUR = 3600;
const MAX_REVIEW = 420;

export type Film = {
  id: string;
  title: string;
  year: number | null;
  /** Josh's rating out of 5, in half stars. */
  rating: number | null;
  liked: boolean;
  rewatch: boolean;
  /** YYYY-MM-DD */
  watched: string | null;
  poster: string | null;
  url: string;
  review: string | null;
  spoilers: boolean;
};

export type Diary = { user: string; profile: string; films: Film[]; updated: string };

const xmlEntities: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: "\u00a0",
  lsquo: "\u2018", rsquo: "\u2019", ldquo: "\u201c", rdquo: "\u201d", hellip: "\u2026", ndash: "\u2013", mdash: "\u2014",
};

export function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === "#") {
      const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : whole;
    }
    return xmlEntities[code.toLowerCase()] ?? whole;
  });
}

function tag(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  if (!match) return null;
  const raw = match[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return cdata ? cdata[1] : decodeEntities(raw);
}

function shorten(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[\s,.;:–-]+$/, "")}…`;
}

/** Splits the item's HTML description into the poster and Josh's review, as plain text. */
function readDescription(html: string) {
  const poster = html.match(/<img[^>]+src="(https:\/\/a\.ltrbxd\.com\/[^"]+)"/)?.[1] ?? null;
  let spoilers = false;
  const paragraphs = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map(m => m[1])
    .filter(p => !p.includes("<img"))
    .map(p => decodeEntities(p.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "")).trim())
    .filter(p => {
      if (/^This review may contain spoilers\.?$/i.test(p)) { spoilers = true; return false; }
      return p && !/^(Re)?watched on /i.test(p);
    });
  const review = paragraphs.length ? shorten(paragraphs.join("\n\n"), MAX_REVIEW) : null;
  return { poster, review, spoilers };
}

/** Diary entries from a Letterboxd RSS feed, newest first. Lists and other items are skipped. */
export function parseFeed(xml: string): Film[] {
  const films: Film[] = [];
  for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = tag(item, "letterboxd:filmTitle");
    const url = tag(item, "link");
    if (!title || !url?.startsWith("https://letterboxd.com/")) continue;
    const year = Number(tag(item, "letterboxd:filmYear"));
    const rating = Number(tag(item, "letterboxd:memberRating"));
    const watched = tag(item, "letterboxd:watchedDate");
    const { poster, review, spoilers } = readDescription(tag(item, "description") ?? "");
    films.push({
      id: tag(item, "guid") ?? url,
      title,
      year: Number.isInteger(year) && year > 1800 ? year : null,
      rating: rating >= 0.5 && rating <= 5 ? Math.round(rating * 2) / 2 : null,
      liked: tag(item, "letterboxd:memberLike") === "Yes",
      rewatch: tag(item, "letterboxd:rewatch") === "Yes",
      watched: watched && /^\d{4}-\d{2}-\d{2}$/.test(watched) ? watched : null,
      poster,
      url,
      review: spoilers ? null : review,
      spoilers,
    });
  }
  return films;
}

/** Letterboxd serves posters at fixed sizes; this picks one from the URL in the feed. */
export function posterAt(url: string, size: "small" | "medium" | "large") {
  const dims = { small: "0-150-0-225", medium: "0-460-0-690", large: "0-1000-0-1500" }[size];
  return url.replace(/-0-\d+-0-\d+-crop/, `-${dims}-crop`);
}

export async function getDiary(): Promise<Diary | null> {
  if (!letterboxdUser) return null;
  const profile = `https://letterboxd.com/${letterboxdUser}/`;
  try {
    const res = await fetch(`${profile}rss/`, {
      headers: { "user-agent": "josh-portfolio/1.0 (+https://github.com/josh098900/portfolio_new)" },
      next: { revalidate: HOUR },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`Letterboxd responded ${res.status}`);
    const films = parseFeed(await res.text());
    return { user: letterboxdUser, profile, films, updated: new Date().toISOString() };
  } catch (error) {
    console.warn(`Letterboxd feed failed: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}
