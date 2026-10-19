import { projects } from "./projects";

export const githubProfile = "https://github.com/josh098900";
export const linkedInProfile = "https://www.linkedin.com/in/joshua-mathers-3410a7219";

/** Josh's Letterboxd username. The TV app stays hidden until it's set. */
export const letterboxdUser: string | null = null;
export const letterboxdProfile = letterboxdUser ? `https://letterboxd.com/${letterboxdUser}/` : null;

/** External links the assistant may show as clickable. Anything else renders as plain text. */
export const allowedExternalLinks = new Set([
  githubProfile,
  linkedInProfile,
  ...(letterboxdProfile ? [letterboxdProfile] : []),
  ...projects.flatMap(p => [p.github, p.website, ...(p.links ?? []).map(l => l.href)]).filter((href): href is string => Boolean(href)),
]);
