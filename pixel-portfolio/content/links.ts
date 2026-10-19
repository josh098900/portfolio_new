import { projects } from "./projects";

export const githubProfile = "https://github.com/josh098900";
export const linkedInProfile = "https://www.linkedin.com/in/joshua-mathers-3410a7219";

/** External links the assistant may show as clickable. Anything else renders as plain text. */
export const allowedExternalLinks = new Set([
  githubProfile,
  linkedInProfile,
  ...projects.flatMap(p => [p.github, p.website, ...(p.links ?? []).map(l => l.href)]).filter((href): href is string => Boolean(href)),
]);
