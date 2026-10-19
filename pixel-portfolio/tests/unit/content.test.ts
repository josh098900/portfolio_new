import { describe, expect, it } from "vitest";
import { allowedExternalLinks } from "@/content/links";
import { artwork, formatDuration, playlists, tracks } from "@/content/music";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";
import { lookingFor, resume } from "@/content/resume";
import { pathFromUrl } from "@/os/routes";

describe("content", () => {
  it("says Josh is looking for graduate roles on the About note and the résumé", () => {
    expect(lookingFor).toMatch(/graduate software engineering roles/);
    const about = notes.find(n => n.id === "about")!;
    expect(JSON.stringify(about.blocks)).toMatch(/graduate software engineering roles/);
    expect(resume.summary).toMatch(/graduate software engineering roles/);
  });

  it("links only to pages that exist or to allowed sites", () => {
    for (const note of notes) {
      for (const block of note.blocks) {
        if (block.type !== "links") continue;
        for (const { to } of block.items) {
          const ok = to.startsWith("/") ? pathFromUrl(to) !== null : allowedExternalLinks.has(to);
          expect(ok, `${note.id}: ${to}`).toBe(true);
        }
      }
    }
  });

  it("gives every project a unique slug and secure links", () => {
    expect(new Set(projects.map(p => p.slug)).size).toBe(projects.length);
    for (const p of projects) for (const href of [p.github, p.website].filter(Boolean)) expect(href).toMatch(/^https:\/\//);
  });

  it("builds every playlist from known songs", () => {
    for (const playlist of playlists) {
      expect(playlist.tracks.length, playlist.id).toBeGreaterThan(0);
      for (const track of playlist.tracks) expect(tracks).toContain(track);
    }
  });

  it("asks Apple for WebP artwork at the right size, changing only the extension", () => {
    const url = artwork(tracks[0], 200);
    expect(url).toMatch(/200x200bb\.webp$/);
    expect(url).not.toContain("{size}");
    expect(url.match(/\.webp/g)).toHaveLength(1);
  });

  it("formats song lengths as minutes and seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(30_000)).toBe("0:30");
    expect(formatDuration(245_400)).toBe("4:05");
  });
});
