// Notes app content. Everything here is real and drawn from the projects and
// copy Josh has already published, so add new notes rather than invent facts.

export type NoteBlock =
  | { type: "p"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "checklist"; items: { text: string; done: boolean }[] }
  | { type: "links"; items: { label: string; to: string }[] };

export type Note = {
  id: string;
  folder: string;
  title: string;
  updated: string;
  pinned?: boolean;
  blocks: NoteBlock[];
};

export const folders = ["About", "Curio devlog"] as const;

export const notes: Note[] = [
  {
    id: "about",
    folder: "About",
    title: "Hi, I'm Josh 👋",
    updated: "2026-10-19T09:41:00Z",
    pinned: true,
    blocks: [
      { type: "p", text: "A curious mind. A builder at heart." },
      { type: "p", text: "I'm a third-year software engineering student. I make things for the web, turn ideas into working software, and learn something with every build." },
      { type: "p", text: "My work spans web applications, multiplayer worlds, and relational databases. I like being involved in the whole process: figuring out how the pieces fit together, building them, and making the result feel good to use." },
      { type: "heading", text: "Have a look around" },
      { type: "links", items: [
        { label: "Selected projects", to: "/projects" },
        { label: "What I'm building now", to: "/notes/curio" },
        { label: "My résumé", to: "/resume" },
        { label: "Ask my assistant", to: "/messages" },
        { label: "Get in touch", to: "/contact" },
        { label: "My GitHub", to: "https://github.com/josh098900" },
      ] },
      { type: "p", text: "This whole site is built to feel like the device you're using it on. Open the dock, drag things around, and poke at whatever looks interesting." },
    ],
  },
  {
    id: "highlights",
    folder: "About",
    title: "Highlights",
    updated: "2026-10-14T18:00:00Z",
    blocks: [
      { type: "list", items: [
        "Database Principles coursework: 90%, the highest mark in the year, achieved as a team.",
        "Academy Fantasy ran a full trial season with real players, backed by scoring tests and race-weekend runbooks.",
        "Lab Hangout is a real-time multiplayer pixel world, drawn entirely in code with Canvas 2D.",
      ] },
      { type: "links", items: [{ label: "Read the case studies", to: "/projects" }] },
    ],
  },
  {
    id: "toolbox",
    folder: "About",
    title: "Toolbox",
    updated: "2026-10-14T17:30:00Z",
    blocks: [
      { type: "p", text: "Tools I've shipped real projects with:" },
      { type: "checklist", items: [
        { text: "TypeScript", done: true },
        { text: "Next.js and React", done: true },
        { text: "Supabase: auth, Postgres and Realtime", done: true },
        { text: "PostgreSQL, SQL and data modelling", done: true },
        { text: "Canvas 2D", done: true },
        { text: "iOS, for Curio", done: false },
      ] },
    ],
  },
  {
    id: "curio",
    folder: "Curio devlog",
    title: "Curio: a world to explore, your own way",
    updated: "2026-10-12T20:15:00Z",
    blocks: [
      { type: "p", text: "Curio is my final-year project: a web and iOS app for solo travellers." },
      { type: "p", text: "It's where I'm putting everything I've learned into something new. I'll keep notes here as it comes together." },
      { type: "checklist", items: [
        { text: "Pick the idea", done: true },
        { text: "Web app", done: false },
        { text: "iOS app", done: false },
      ] },
    ],
  },
];

export function findNote(id: string) {
  return notes.find(note => note.id === id);
}

/** All of a note's text, for search and plain-text views. */
export function noteText(note: Note) {
  return [note.title, ...note.blocks.flatMap(block => {
    switch (block.type) {
      case "p": case "heading": return [block.text];
      case "list": return block.items;
      case "checklist": return block.items.map(item => item.text);
      case "links": return block.items.map(item => item.label);
    }
  })].join("\n");
}

export function notePreview(note: Note) {
  for (const block of note.blocks) {
    if (block.type === "p") return block.text;
    if (block.type === "list") return block.items[0];
    if (block.type === "checklist") return block.items[0].text;
  }
  return "";
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
const shortFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/London" });

export function formatNoteDate(iso: string) {
  const date = new Date(iso);
  return `${dateFormat.format(date)} at ${timeFormat.format(date)}`;
}

export function formatNoteShortDate(iso: string) {
  return shortFormat.format(new Date(iso));
}

const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "Europe/London" });

/** Groups by calendar month rather than "Previous 7 days", so server and client always agree. */
export function noteMonth(iso: string) {
  return monthFormat.format(new Date(iso));
}
