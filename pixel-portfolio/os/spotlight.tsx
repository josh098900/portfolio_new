"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { notes, noteText } from "@/content/notes";
import { projects } from "@/content/projects";
import { AppIcon, Glyph, type GlyphName } from "./icons";
import { apps, homeRoute, readyApps, type AppId, type Route } from "./routes";
import { useOS } from "./store";
import styles from "./spotlight.module.css";

type Kind = "App" | "Project" | "Note";
type Entry = { id: string; kind: Kind; title: string; detail: string; text: string; app: AppId; route: Route };

const index: Entry[] = [
  ...readyApps.map(app => ({ id: `app-${app}`, kind: "App" as const, title: apps[app].name, detail: apps[app].description, text: apps[app].description, app, route: { app, sub: app === homeRoute.app ? homeRoute.sub : [] } })),
  ...projects.map(p => ({ id: `project-${p.slug}`, kind: "Project" as const, title: p.title, detail: p.category, text: [p.description, p.intro, ...p.technologies].join(" "), app: "projects" as const, route: { app: "projects" as const, sub: [p.slug] } })),
  ...notes.map(n => ({ id: `note-${n.id}`, kind: "Note" as const, title: n.title, detail: `Note in ${n.folder}`, text: noteText(n), app: "notes" as const, route: { app: "notes" as const, sub: [n.id] } })),
];

const suggestions = (["notes", "projects", "resume", "contact", "messages"] as AppId[])
  .filter(app => apps[app].ready).slice(0, 4).map(app => index.find(e => e.id === `app-${app}`)!);

const filters: { kind: Kind; label: string; icon: GlyphName }[] = [
  { kind: "App", label: "Apps", icon: "apps" },
  { kind: "Project", label: "Projects", icon: "folder" },
  { kind: "Note", label: "Notes", icon: "note" },
];

function score(entry: Entry, query: string) {
  const title = entry.title.toLowerCase();
  if (title.startsWith(query)) return 3;
  if (title.split(/\W+/).some(word => word.startsWith(query))) return 2;
  if (entry.text.toLowerCase().includes(query)) return 1;
  return 0;
}

function SpotlightPanel() {
  const open = useOS(s => s.open);
  const setOverlay = useOS(s => s.setOverlay);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Kind | null>(null);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = filter ? index.filter(e => e.kind === filter) : index;
    if (!q) return filter ? pool : suggestions;
    return pool.map(e => ({ e, s: score(e, q) })).filter(r => r.s > 0).sort((a, b) => b.s - a.s).map(r => r.e).slice(0, 8);
  }, [query, filter]);

  const close = () => setOverlay(null);
  function choose(entry: Entry) {
    close();
    open(entry.route);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(i => results.length ? (i + step + results.length) % results.length : 0);
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      choose(results[active]);
    }
  }

  const heading = query.trim() ? null : filter ? `${filters.find(f => f.kind === filter)!.label}` : "Suggestions";

  return <div className={styles.backdrop} onPointerDown={e => e.target === e.currentTarget && close()}>
    <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Spotlight">
      <div className={styles.top}>
        <label className={`${styles.bar} glass`}>
          <Glyph name="search" size={24} />
          <input
            autoFocus
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="spotlight-results"
            aria-activedescendant={results[active] ? `spotlight-${results[active].id}` : undefined}
            aria-autocomplete="list"
            aria-label="Spotlight search"
            placeholder="Spotlight Search"
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
          />
        </label>
        {filters.map(f => <button key={f.kind} type="button" className={`${styles.filter} glass`} aria-pressed={filter === f.kind} aria-label={`Only ${f.label.toLowerCase()}`} title={f.label}
          onClick={() => { setFilter(current => current === f.kind ? null : f.kind); setActive(0); }}>
          <Glyph name={f.icon} size={24} />
        </button>)}
      </div>
      {results.length > 0
        ? <div className={`${styles.results} glass`}>
          {heading && <p className={styles.heading}>{heading}</p>}
          <ul id="spotlight-results" role="listbox" aria-label="Results">
            {results.map((entry, i) => <li key={entry.id} id={`spotlight-${entry.id}`} role="option" aria-selected={i === active}
              onPointerMove={() => setActive(i)} onClick={() => choose(entry)}>
              <AppIcon app={entry.app} size={30} />
              <span className={styles.title}>{entry.title}</span>
              <span className={styles.detail}>{entry.kind === "App" ? "Application" : entry.detail}</span>
            </li>)}
          </ul>
        </div>
        : <p className={`${styles.results} ${styles.empty} glass`}>No results for “{query.trim()}”</p>}
    </div>
  </div>;
}

/** Mounted only while open, so each visit starts with an empty search. */
export function Spotlight() {
  const isOpen = useOS(s => s.overlay === "spotlight");
  return isOpen ? <SpotlightPanel /> : null;
}
