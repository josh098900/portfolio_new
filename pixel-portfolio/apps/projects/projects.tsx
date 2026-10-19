"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { projects, type Project } from "@/content/projects";
import { Glyph, type GlyphName } from "@/os/icons";
import type { AppProps } from "..";
import { SchemaArt } from "./schema-art";
import styles from "./projects.module.css";

type View = "gallery" | "icons" | "list";
type Scope = "all" | "solo" | "team";

const views: { id: View; label: string; icon: GlyphName }[] = [
  { id: "gallery", label: "Gallery", icon: "wallpaper" },
  { id: "icons", label: "Icons", icon: "apps" },
  { id: "list", label: "List", icon: "checklist" },
];

const scopes: { id: Scope; label: string }[] = [
  { id: "all", label: "All Projects" },
  { id: "solo", label: "Solo" },
  { id: "team", label: "Team" },
];

// Finder-style tag colours, one per technology.
const tagColours: Record<string, string> = {
  "Next.js": "#8e8e93",
  TypeScript: "#0a84ff",
  Supabase: "#30d158",
  "Canvas 2D": "#ff9f0a",
  PostgreSQL: "#bf5af2",
  SQL: "#ffd60a",
  "Data modelling": "#ff453a",
  React: "#64d2ff",
  Motion: "#ff375f",
  Zustand: "#a2845e",
};

const allTags = [...new Set(projects.flatMap(p => p.technologies))];

function TagDot({ tag }: { tag: string }) {
  return <span className={styles.dot} style={{ background: tagColours[tag] ?? "#8e8e93" }} aria-hidden="true" />;
}

function Artwork({ project, sizes, priority }: { project: Project; sizes: string; priority?: boolean }) {
  return project.image
    ? <Image src={project.image} alt={project.imageAlt ?? ""} width={1280} height={720} sizes={sizes} priority={priority} className={styles.image} />
    : <SchemaArt label={priority ? "Diagram of the customers and vehicles tables: one customer has many vehicles" : undefined} />;
}

function matches(project: Project, scope: Scope, tag: string | null, query: string) {
  if (scope === "solo" && project.role.startsWith("Team")) return false;
  if (scope === "team" && !project.role.startsWith("Team")) return false;
  if (tag && !project.technologies.includes(tag)) return false;
  if (!query) return true;
  return [project.title, project.category, project.description, ...project.technologies].join(" ").toLowerCase().includes(query);
}

function Facts({ project }: { project: Project }) {
  return <dl className={styles.facts}>
    <div><dt>Kind</dt><dd>{project.category}</dd></div>
    <div><dt>Role</dt><dd>{project.role}</dd></div>
    <div><dt>Status</dt><dd>{project.status}</dd></div>
    <div><dt>Built with</dt><dd><ul className={styles.tags}>{project.technologies.map(t => <li key={t}><TagDot tag={t} />{t}</li>)}</ul></dd></div>
  </dl>;
}

function ExternalLinks({ project }: { project: Project }) {
  return <div className={styles.linkRow}>
    {project.website && <a className={`${styles.pill} ${styles.primary}`} href={project.website} target="_blank" rel="noreferrer">{project.websiteLabel ?? "Visit site"} <Glyph name="arrow" size={13} /></a>}
    <a className={styles.pill} href={project.github} target="_blank" rel="noreferrer">View source <Glyph name="arrow" size={13} /></a>
  </div>;
}

function CaseStudy({ project, onOpen }: { project: Project; onOpen: (slug: string) => void }) {
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return <article className={styles.case} aria-labelledby="case-title">
    <div className={styles.hero}><Artwork project={project} sizes="(max-width: 700px) 100vw, 760px" priority /></div>
    <header className={styles.caseHeader}>
      <span className={styles.eyebrow}>{project.number} · {project.category}</span>
      <h1 id="case-title">{project.title}</h1>
      <p>{project.intro}</p>
      <ExternalLinks project={project} />
    </header>
    <section className={styles.infoCard} aria-label="Project details"><Facts project={project} /></section>
    {project.sections.map(section => <section key={section.heading} className={styles.section}>
      <h2>{section.heading}</h2>
      <p>{section.body}</p>
    </section>)}
    {project.links?.map(link => <a key={link.href} className={styles.textLink} href={link.href} target="_blank" rel="noreferrer">{link.label} <Glyph name="arrow" size={13} /></a>)}
    <button type="button" className={styles.next} onClick={() => onOpen(next.slug)}>
      <span><small>Next project</small>{next.title}</span>
      <Glyph name="forward" size={16} />
    </button>
  </article>;
}

function QuickLook({ project, onOpen, onClose }: { project: Project; onOpen: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // React's autoFocus only applies to form controls, so focus the dialog by hand
  // and hand focus back to the project when it closes.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => previous?.focus();
  }, []);
  return <div className={styles.quickLookScrim} onClick={onClose}>
    <div ref={ref} className={styles.quickLook} role="dialog" aria-modal="true" aria-label={`Quick Look: ${project.title}`} tabIndex={-1} onClick={e => e.stopPropagation()}
      onKeyDown={e => { if (e.key === "Escape" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onClose(); } }}>
      <div className={styles.quickLookArt}><Artwork project={project} sizes="640px" /></div>
      <div className={styles.quickLookBar}>
        <span><strong>{project.title}</strong><small>{project.description}</small></span>
        <button type="button" className={`${styles.pill} ${styles.primary}`} onClick={onOpen}>Open</button>
      </div>
    </div>
  </div>;
}

export function Projects({ sub, navigate }: AppProps) {
  const open = projects.find(p => p.slug === sub[0]);
  const [view, setView] = useState<View>("gallery");
  const [scope, setScope] = useState<Scope>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(projects[0].slug);
  const [quickLook, setQuickLook] = useState(false);
  const [lastOpened, setLastOpened] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = projects.filter(p => matches(p, scope, tag, q));
  const current = visible.find(p => p.slug === selected) ?? visible[0];
  const location = tag ?? scopes.find(s => s.id === scope)!.label;

  function openProject(slug: string) {
    setQuickLook(false);
    setLastOpened(slug);
    navigate([slug]);
  }

  function choose(nextScope: Scope, nextTag: string | null) {
    setScope(nextScope);
    setTag(nextTag);
    setSidebarOpen(false);
  }

  /** Space previews the focused item, as in Finder. */
  function itemKeys(event: KeyboardEvent, slug: string) {
    if (event.key === " ") {
      event.preventDefault();
      setSelected(slug);
      setQuickLook(true);
    }
  }

  const sidebarItem = (active: boolean, onClick: () => void, children: ReactNode) =>
    <li><button type="button" aria-current={active || undefined} onClick={onClick}>{children}</button></li>;

  return <div className={styles.projects} data-view={open ? "case" : "browse"} data-sidebar-open={sidebarOpen || undefined}>
    <aside className={styles.sidebar} aria-label="Locations" data-drag-region>
      <div className={styles.sidebarInner}>
        <h3>Favourites</h3>
        <ul>
          {scopes.map(s => sidebarItem(!open && !tag && scope === s.id, () => { choose(s.id, null); if (open) navigate([]); },
            <><Glyph name="folder" size={16} />{s.label}</>))}
        </ul>
        <h3>Tags</h3>
        <ul>
          {allTags.map(t => <li key={t}><button type="button" aria-current={(!open && tag === t) || undefined} onClick={() => { choose("all", t); if (open) navigate([]); }}>
            <TagDot tag={t} />{t}
          </button></li>)}
        </ul>
      </div>
    </aside>
    {sidebarOpen && <div className={styles.scrim} onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

    <header className={styles.toolbar} data-drag-region>
      <button type="button" className={`${styles.glass} ${styles.circle} ${styles.sidebarToggle}`} onClick={() => setSidebarOpen(o => !o)} aria-label="Show locations" aria-expanded={sidebarOpen}>
        <Glyph name="sidebar" size={18} />
      </button>
      <div className={`${styles.glass} ${styles.capsule} ${styles.history}`}>
        <button type="button" disabled={!open} onClick={() => navigate([])} aria-label="Back"><Glyph name="back" size={16} /></button>
        <button type="button" disabled={Boolean(open) || !lastOpened} onClick={() => lastOpened && navigate([lastOpened])} aria-label="Forward"><Glyph name="forward" size={16} /></button>
      </div>
      <div className={styles.heading}>
        <strong>{open ? open.title : location}</strong>
        {!open && <span>{visible.length} {visible.length === 1 ? "project" : "projects"}</span>}
      </div>
      <span className={styles.spacer} />
      {!open && <>
        <div className={`${styles.glass} ${styles.capsule} ${styles.viewSwitch}`} role="group" aria-label="View">
          {views.map(v => <button key={v.id} type="button" aria-pressed={view === v.id} aria-label={`${v.label} view`} title={v.label} onClick={() => setView(v.id)}>
            <Glyph name={v.icon} size={16} />
          </button>)}
        </div>
        <label className={`${styles.glass} ${styles.capsule} ${styles.search}`}>
          <Glyph name="search" size={15} />
          <span className={styles.srOnly}>Search projects</span>
          <input type="search" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} />
        </label>
      </>}
    </header>

    <main className={styles.main}>
      {open ? <CaseStudy key={open.slug} project={open} onOpen={openProject} /> : <>
        <div className={styles.phoneHeader}>
          <h2>Projects</h2>
          <label className={styles.phoneSearch}>
            <Glyph name="search" size={15} />
            <span className={styles.srOnly}>Search projects</span>
            <input type="search" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} />
          </label>
          <div className={styles.chips} role="group" aria-label="Filter">
            {scopes.map(s => <button key={s.id} type="button" aria-pressed={!tag && scope === s.id} onClick={() => choose(s.id, null)}>{s.id === "all" ? "All" : s.label}</button>)}
            {allTags.map(t => <button key={t} type="button" aria-pressed={tag === t} onClick={() => choose("all", t)}><TagDot tag={t} />{t}</button>)}
          </div>
        </div>

        {visible.length === 0 && <p className={styles.empty}>No projects match.</p>}

        {visible.length > 0 && view === "gallery" && current && <div className={`${styles.gallery} ${styles.wideOnly}`}>
          <div className={styles.galleryStage}>
            <button type="button" className={styles.galleryArt} onClick={() => openProject(current.slug)} aria-label={`Open ${current.title}`}>
              <Artwork project={current} sizes="(max-width: 900px) 100vw, 640px" />
            </button>
            <div className={styles.strip} role="group" aria-label="Projects">
              {visible.map(p => <button key={p.slug} type="button" className={styles.stripItem} aria-pressed={p.slug === current.slug} aria-label={p.title}
                onClick={() => setSelected(p.slug)} onDoubleClick={() => openProject(p.slug)} onKeyDown={e => itemKeys(e, p.slug)}>
                <Artwork project={p} sizes="120px" />
              </button>)}
            </div>
          </div>
          <aside className={styles.inspector} aria-label={`${current.title} details`}>
            <h2>{current.title}</h2>
            <p>{current.description}</p>
            <Facts project={current} />
            <button type="button" className={`${styles.pill} ${styles.primary} ${styles.openButton}`} onClick={() => openProject(current.slug)}>Read the case study</button>
            <ExternalLinks project={current} />
          </aside>
        </div>}

        {/* Always rendered: it is the only layout on narrow windows, and CSS hides it on wide ones unless chosen. */}
        {visible.length > 0 && <ul className={styles.icons} data-chosen={view === "icons" || undefined}>
          {visible.map(p => <li key={p.slug}>
            <button type="button" onClick={() => openProject(p.slug)} onFocus={() => setSelected(p.slug)} onKeyDown={e => itemKeys(e, p.slug)}>
              <span className={styles.iconArt}><Artwork project={p} sizes="(max-width: 640px) 100vw, 240px" /></span>
              <strong>{p.title}</strong>
              <small>{p.category}</small>
            </button>
          </li>)}
        </ul>}

        {visible.length > 0 && view === "list" && <table className={`${styles.list} ${styles.wideOnly}`}>
          <thead><tr><th scope="col">Name</th><th scope="col">Kind</th><th scope="col">Role</th><th scope="col">Tags</th></tr></thead>
          <tbody>{visible.map(p => <tr key={p.slug}>
            <td><button type="button" onClick={() => openProject(p.slug)} onFocus={() => setSelected(p.slug)} onKeyDown={e => itemKeys(e, p.slug)}>
              <span className={styles.listArt}><Artwork project={p} sizes="40px" /></span>{p.title}
            </button></td>
            <td>{p.category}</td>
            <td>{p.role.startsWith("Team") ? "Team" : "Solo"}</td>
            <td><span className={styles.dots}>{p.technologies.map(t => <TagDot key={t} tag={t} />)}</span><span className={styles.srOnly}>{p.technologies.join(", ")}</span></td>
          </tr>)}</tbody>
        </table>}

        <p className={styles.hint}>Tip: press Space on a project for Quick Look</p>
      </>}
    </main>

    {quickLook && current && !open && <QuickLook project={current} onOpen={() => openProject(current.slug)} onClose={() => setQuickLook(false)} />}
  </div>;
}
