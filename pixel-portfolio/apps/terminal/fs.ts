// A small read-only filesystem built from the site's real content.

import { githubProfile, linkedInProfile } from "@/content/links";
import { tracks } from "@/content/music";
import { findNote, notes, noteText } from "@/content/notes";
import { projects } from "@/content/projects";
import { resumeText } from "@/content/resume";
import { routeToPath } from "@/os/routes";

export type FsFile = { kind: "file"; text: () => string; route?: string };
export type FsDir = { kind: "dir"; children: Record<string, FsNode> };
export type FsNode = FsFile | FsDir;

const file = (text: () => string, route?: string): FsFile => ({ kind: "file", text, route });
const dir = (children: Record<string, FsNode>): FsDir => ({ kind: "dir", children });

const about = () => noteText(findNote("about")!).replace(/^.*\n/, "");

export const root: FsDir = dir({
  "about.txt": file(about, "/"),
  "resume.txt": file(resumeText, "/resume"),
  "contact.txt": file(() => `LinkedIn: ${linkedInProfile}\nGitHub:   ${githubProfile}\n\nThe quickest way to reach Josh is a message on LinkedIn.`, "/contact"),
  projects: dir(Object.fromEntries(projects.map(p => [`${p.slug}.md`, file(() => [
    `# ${p.title}`,
    `${p.category} · ${p.role} · ${p.status}`,
    `Built with: ${p.technologies.join(", ")}`,
    "",
    p.intro,
    ...p.sections.flatMap(s => ["", `## ${s.heading}`, s.body]),
  ].join("\n"), `/projects/${p.slug}`)]))),
  notes: dir(Object.fromEntries(notes.map(n => [`${n.id}.md`, file(() => noteText(n), routeToPath({ app: "notes", sub: [n.id] }))]))),
  music: dir({
    "on-repeat.txt": file(() => tracks.slice(0, 12).map(t => `♪ ${t.title} · ${t.artist}`).join("\n"), "/music"),
  }),
  ".secrets": dir({
    "README.txt": file(() => "If you're reading this, you're exactly the kind of curious person Josh likes working with.\nThere are more hidden commands. Try being polite to sudo, or ask for coffee."),
    "konami.txt": file(() => "↑ ↑ ↓ ↓ ← → ← → B A\n(Type it on your keyboard while the terminal is focused.)"),
  }),
});

export function resolve(cwd: string[], input = ""): string[] | null {
  const parts = input.startsWith("/") || input.startsWith("~") ? [] : [...cwd];
  for (const part of input.replace(/^~\/?/, "").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return nodeAt(parts) ? parts : null;
}

export function nodeAt(path: string[]): FsNode | null {
  let node: FsNode = root;
  for (const part of path) {
    if (node.kind !== "dir" || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

export const pretty = (path: string[]) => (path.length ? `~/${path.join("/")}` : "~");
