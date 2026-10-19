import { letterboxdUser } from "@/content/links";
import { findNote, notes } from "@/content/notes";
import { projects } from "@/content/projects";
import { findGame, games } from "@/apps/arcade/games";
import { findSection, settingsSections } from "@/apps/settings/sections";

export const appIds = ["notes", "projects", "resume", "contact", "messages", "maps", "photos", "music", "tv", "arcade", "activity", "terminal", "settings"] as const;
export type AppId = (typeof appIds)[number];

export type AppInfo = {
  name: string;
  description: string;
  /** Default desktop window size in px; clamped to the viewport by CSS. */
  size: { w: number; h: number };
  minSize: { w: number; h: number };
  /** Unfinished apps stay hidden everywhere (dock, home screen, Spotlight, URLs) until ready. */
  ready: boolean;
};

export const apps: Record<AppId, AppInfo> = {
  notes: { name: "Notes", description: "About me, highlights and the Curio devlog.", size: { w: 960, h: 620 }, minSize: { w: 360, h: 320 }, ready: true },
  projects: { name: "Projects", description: "Case studies of the things I've built.", size: { w: 1040, h: 660 }, minSize: { w: 360, h: 320 }, ready: true },
  resume: { name: "Résumé", description: "My CV, ready to read or save as a PDF.", size: { w: 760, h: 820 }, minSize: { w: 340, h: 320 }, ready: true },
  contact: { name: "Contacts", description: "How to reach me: LinkedIn and GitHub.", size: { w: 620, h: 560 }, minSize: { w: 340, h: 320 }, ready: true },
  messages: { name: "Messages", description: "Ask my AI assistant about my work.", size: { w: 760, h: 560 }, minSize: { w: 340, h: 320 }, ready: true },
  maps: { name: "Maps", description: "A map of the world to explore.", size: { w: 980, h: 640 }, minSize: { w: 360, h: 320 }, ready: true },
  photos: { name: "Photos", description: "Screenshots and photos.", size: { w: 960, h: 640 }, minSize: { w: 360, h: 320 }, ready: true },
  music: { name: "Music", description: "What I'm listening to: Avicii, Tiësto and Gigi Perez.", size: { w: 1060, h: 680 }, minSize: { w: 360, h: 360 }, ready: true },
  tv: { name: "TV", description: "Films I've watched lately, from my Letterboxd.", size: { w: 1080, h: 700 }, minSize: { w: 360, h: 360 }, ready: Boolean(letterboxdUser) },
  arcade: { name: "Arcade", description: "Pong, Snake, Bricks and Lab Hangout.", size: { w: 900, h: 640 }, minSize: { w: 360, h: 360 }, ready: true },
  activity: { name: "Activity", description: "My GitHub activity as rings.", size: { w: 760, h: 640 }, minSize: { w: 340, h: 320 }, ready: true },
  terminal: { name: "Terminal", description: "Explore this portfolio from the command line.", size: { w: 720, h: 460 }, minSize: { w: 340, h: 240 }, ready: true },
  settings: { name: "Settings", description: "Appearance, wallpaper and accessibility.", size: { w: 780, h: 660 }, minSize: { w: 360, h: 320 }, ready: true },
};

export const readyApps = appIds.filter(app => apps[app].ready);

/** An app plus its internal location, e.g. notes + ["curio"]. */
export type Route = { app: AppId; sub: string[] };

export const homeRoute: Route = { app: "notes", sub: ["about"] };

function isReadyApp(value: string): value is AppId {
  return (appIds as readonly string[]).includes(value) && apps[value as AppId].ready;
}

export function parsePath(segments: readonly string[]): Route | null {
  if (segments.length === 0) return homeRoute;
  const [first, ...sub] = segments;
  if (!isReadyApp(first)) return null;
  if (first === "notes") {
    if (sub.length === 0) return { app: "notes", sub };
    return sub.length === 1 && findNote(sub[0]) ? { app: "notes", sub } : null;
  }
  if (first === "projects") {
    if (sub.length === 0) return { app: "projects", sub };
    return sub.length === 1 && projects.some(p => p.slug === sub[0]) ? { app: "projects", sub } : null;
  }
  if (first === "arcade" && sub.length === 1) {
    return findGame(sub[0]) ? { app: "arcade", sub } : null;
  }
  if (first === "settings" && sub.length === 1) {
    return findSection(sub[0]) ? { app: "settings", sub } : null;
  }
  return sub.length === 0 ? { app: first, sub } : null;
}

export function pathFromUrl(pathname: string) {
  return parsePath(pathname.split("/").filter(Boolean).map(decodeURIComponent));
}

export function routeToPath({ app, sub }: Route) {
  if (app === homeRoute.app && sub.join("/") === homeRoute.sub.join("/")) return "/";
  return "/" + [app, ...sub].map(encodeURIComponent).join("/");
}

/** Every non-home URL, for static generation. */
export function allPaths(): string[][] {
  return [
    ...readyApps.map(app => [app]),
    ...notes.filter(note => note.id !== "about").map(note => ["notes", note.id]),
    ...projects.map(project => ["projects", project.slug]),
    ...settingsSections.map(section => ["settings", section.id]),
    ...games.map(game => ["arcade", game.id]),
  ];
}

export function routeTitle(route: Route): { title: string; description: string } {
  if (route.app === "notes" && route.sub[0]) {
    const note = findNote(route.sub[0])!;
    if (note.id !== "about") return { title: note.title, description: apps.notes.description };
  }
  if (route.app === "projects" && route.sub[0]) {
    const project = projects.find(p => p.slug === route.sub[0])!;
    return { title: project.title, description: project.description };
  }
  if (route.app === "arcade" && route.sub[0]) {
    return { title: findGame(route.sub[0])!.name, description: findGame(route.sub[0])!.blurb };
  }
  if (route.app === "settings" && route.sub[0]) {
    return { title: `${findSection(route.sub[0])!.name} Settings`, description: apps.settings.description };
  }
  if (route.app === "notes" && route.sub[0] === "about") {
    return { title: "Josh, software engineering student", description: "I'm Josh, a third-year software engineering student looking for graduate software engineering roles. Explore my projects, see what I'm building, or get in touch." };
  }
  return { title: apps[route.app].name, description: apps[route.app].description };
}
