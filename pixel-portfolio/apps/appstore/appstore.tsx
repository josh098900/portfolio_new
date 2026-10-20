"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { projects, type Project } from "@/content/projects";
import { AppLink } from "@/os/app-link";
import { Glyph, type GlyphName } from "@/os/icons";
import styles from "./appstore.module.css";

// Josh's projects as App Store listings. Everything shown comes from
// content/projects.ts: no ratings, reviews or download counts are invented.

type View = { kind: "today" } | { kind: "apps" } | { kind: "app"; slug: string; from: "today" | "apps" };

const icons: Record<string, { background: string; glyph: ReactNode }> = {
  "academy-fantasy": {
    background: "linear-gradient(160deg, #ff7ac3, #e2186f)",
    glyph: <>
      {[0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => (r + c) % 2 === 0 && <rect key={`${r}${c}`} x={19 + c * 6} y={17 + r * 6} width="6" height="6" fill="#fff" />))}
      <rect x="18" y="16" width="25" height="25" fill="none" stroke="#fff" strokeWidth="1.5" />
      <path d="M18 16v30" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </>,
  },
  "lab-hangout": {
    background: "linear-gradient(160deg, #6a4ba8, #c75b39)",
    glyph: <>
      <rect x="16" y="20" width="28" height="22" rx="7" fill="#9be8cf" />
      <rect x="22" y="27" width="5" height="6" rx="1" fill="#1c1c1e" /><rect x="33" y="27" width="5" height="6" rx="1" fill="#1c1c1e" />
      <path d="M30 20v-7" stroke="#9be8cf" strokeWidth="2.5" strokeLinecap="round" /><circle cx="30" cy="12" r="3" fill="#ffd166" />
      <rect x="20" y="42" width="6" height="4" rx="1" fill="#9be8cf" /><rect x="34" y="42" width="6" height="4" rx="1" fill="#9be8cf" />
    </>,
  },
  "database-principles": {
    background: "linear-gradient(160deg, #3ad0c4, #136f9c)",
    glyph: <>
      <ellipse cx="30" cy="19" rx="13" ry="5" fill="#fff" />
      <path d="M17 19v22c0 2.8 5.8 5 13 5s13-2.2 13-5V19" fill="none" stroke="#fff" strokeWidth="3" />
      <path d="M17 30c0 2.8 5.8 5 13 5s13-2.2 13-5" fill="none" stroke="#fff" strokeWidth="3" />
    </>,
  },
  "this-portfolio": {
    background: "linear-gradient(160deg, #eea6c6, #82a9f6 55%, #6fc4b6)",
    glyph: <>
      <rect x="13" y="17" width="34" height="26" rx="5" fill="#fff" />
      <circle cx="19" cy="22" r="1.8" fill="#ff5f57" /><circle cx="24" cy="22" r="1.8" fill="#febc2e" /><circle cx="29" cy="22" r="1.8" fill="#28c840" />
      <path d="M18 30h18M18 35h12" stroke="#c7cbe0" strokeWidth="2.5" strokeLinecap="round" />
    </>,
  },
};

function ProjectIcon({ project, size }: { project: Project; size: number }) {
  const icon = icons[project.slug] ?? { background: "linear-gradient(160deg, #8e8e93, #3a3a3c)", glyph: null };
  return <span className={styles.icon} style={{ width: size, height: size, background: icon.background }} aria-hidden="true">
    <svg viewBox="0 0 60 60">{icon.glyph}</svg>
  </span>;
}

/** The App Store's Get button: a quick install ring, then Open. */
function GetButton({ project, big }: { project: Project; big?: boolean }) {
  const [state, setState] = useState<"get" | "installing" | "open">("get");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const href = project.website ?? project.github;
  if (state === "open") {
    return <a className={`${styles.get} ${big ? styles.big : ""}`} href={href} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}${project.website ? "" : " on GitHub"}`}>Open</a>;
  }
  if (state === "installing") {
    return <span className={styles.ring} role="progressbar" aria-label={`Getting ${project.title}`}><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" /></svg><i /></span>;
  }
  return <button type="button" className={`${styles.get} ${big ? styles.big : ""}`} aria-label={`Get ${project.title}`}
    onClick={() => { setState("installing"); timer.current = setTimeout(() => setState("open"), 1300); }}>Get</button>;
}

function Today({ onOpen }: { onOpen: (slug: string) => void }) {
  const date = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  return <>
    <p className={styles.date} suppressHydrationWarning>{date.toUpperCase()}</p>
    <h1 className={styles.title}>Today</h1>
    <div className={styles.cards}>
      {projects.map((p, i) => <button key={p.slug} type="button" className={styles.card} onClick={() => onOpen(p.slug)} aria-label={`${p.title}: ${p.description}`}>
        {p.image
          ? <img src={p.image} alt="" className={styles.cardArt} />
          : <span className={styles.cardArt} style={{ background: icons[p.slug]?.background }} />}
        <span className={styles.cardShade} />
        <span className={styles.cardText}>
          <small>{i === 0 ? "APP OF THE DAY" : p.category.toUpperCase()}</small>
          <strong>{p.title}</strong>
          <span>{p.description}</span>
        </span>
        <span className={styles.cardFoot}>
          <ProjectIcon project={p} size={38} />
          <span><strong>{p.title}</strong><small>{p.role}</small></span>
        </span>
      </button>)}
    </div>
  </>;
}

function AllApps({ onOpen }: { onOpen: (slug: string) => void }) {
  return <>
    <h1 className={styles.title}>Apps by Josh</h1>
    <ol className={styles.list}>
      {projects.map((p, i) => <li key={p.slug}>
        <span className={styles.rank}>{i + 1}</span>
        <button type="button" className={styles.listMain} onClick={() => onOpen(p.slug)}>
          <ProjectIcon project={p} size={64} />
          <span className={styles.listText}><strong>{p.title}</strong><small>{p.description}</small></span>
        </button>
        <GetButton project={p} />
      </li>)}
    </ol>
  </>;
}

function Product({ project, onBack, backLabel, onOpen }: { project: Project; onBack: () => void; backLabel: string; onOpen: (slug: string) => void }) {
  const facts: { label: string; value: string; glyph?: GlyphName }[] = [
    { label: "ROLE", value: project.role.replace(", pair-programmed with Claude Code", "") },
    { label: "STATUS", value: project.status },
    { label: "BUILT WITH", value: project.technologies.slice(0, 2).join(" · ") + (project.technologies.length > 2 ? ` +${project.technologies.length - 2}` : "") },
    { label: "CATEGORY", value: project.category },
  ];
  const others = projects.filter(p => p.slug !== project.slug);
  return <article className={styles.product} aria-labelledby="appstore-product">
    <button type="button" className={styles.back} onClick={onBack}><Glyph name="back" size={14} /> {backLabel}</button>
    <header className={styles.productHead}>
      <ProjectIcon project={project} size={128} />
      <div className={styles.productText}>
        <h1 id="appstore-product">{project.title}</h1>
        <p>{project.description}</p>
        <p className={styles.developer}>Joshua Mathers</p>
        <div className={styles.actions}>
          <GetButton project={project} big />
          <AppLink to={`/projects/${project.slug}`} className={styles.secondaryLink}>Read the case study</AppLink>
        </div>
      </div>
    </header>
    <dl className={styles.strip}>
      {facts.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
    </dl>
    {project.image && <section aria-label="Screenshots" className={styles.shots}>
      <h2>Screenshots</h2>
      <img src={project.image} alt={project.imageAlt ?? ""} />
    </section>}
    <section className={styles.block}>
      <h2>What&apos;s New</h2>
      <p className={styles.status}>{project.status}</p>
      <p>{project.intro}</p>
    </section>
    <section className={styles.block}>
      <h2>About this app</h2>
      {project.sections.map(s => <p key={s.heading}><strong>{s.heading}.</strong> {s.body}</p>)}
    </section>
    <section className={styles.block}>
      <h2>Information</h2>
      <dl className={styles.info}>
        <div><dt>Developer</dt><dd>Joshua Mathers</dd></div>
        <div><dt>Category</dt><dd>{project.category}</dd></div>
        <div><dt>Made with</dt><dd>{project.technologies.join(", ")}</dd></div>
        <div><dt>Price</dt><dd>Free</dd></div>
        <div><dt>Source code</dt><dd><a href={project.github} target="_blank" rel="noreferrer">GitHub <Glyph name="arrow" size={11} /></a></dd></div>
        {project.website && <div><dt>Website</dt><dd><a href={project.website} target="_blank" rel="noreferrer">{project.websiteLabel ?? "Visit"} <Glyph name="arrow" size={11} /></a></dd></div>}
      </dl>
    </section>
    <section className={styles.block}>
      <h2>More by Joshua Mathers</h2>
      <div className={styles.more}>
        {others.map(p => <button key={p.slug} type="button" onClick={() => onOpen(p.slug)}>
          <ProjectIcon project={p} size={56} /><strong>{p.title}</strong><small>{p.category}</small>
        </button>)}
      </div>
    </section>
  </article>;
}

export function AppStore() {
  const [view, setView] = useState<View>({ kind: "today" });
  const scroller = useRef<HTMLDivElement>(null);
  const open = (slug: string) => {
    setView(v => ({ kind: "app", slug, from: v.kind === "app" ? v.from : v.kind }));
    scroller.current?.scrollTo({ top: 0 });
  };
  const section = view.kind === "app" ? view.from : view.kind;
  const nav: { id: "today" | "apps"; label: string; glyph: GlyphName }[] = [
    { id: "today", label: "Today", glyph: "note" },
    { id: "apps", label: "Apps", glyph: "apps" },
  ];

  let content: ReactNode;
  if (view.kind === "app") {
    const project = projects.find(p => p.slug === view.slug)!;
    content = <Product project={project} onBack={() => setView({ kind: view.from })} backLabel={view.from === "today" ? "Today" : "Apps"} onOpen={open} />;
  } else if (view.kind === "apps") {
    content = <AllApps onOpen={open} />;
  } else {
    content = <Today onOpen={open} />;
  }

  return <div className={styles.store}>
    <aside className={styles.sidebar} aria-label="App Store" data-drag-region>
      <nav className={styles.nav}>
        {nav.map(n => <button key={n.id} type="button" aria-current={section === n.id || undefined} onClick={() => setView({ kind: n.id })}>
          <Glyph name={n.glyph} size={18} />{n.label}
        </button>)}
      </nav>
      <p className={styles.credit}>Every app here is something Josh has built.</p>
    </aside>
    <section className={styles.main} aria-label="App Store">
      <div className={styles.phoneTabs} role="group" aria-label="Sections">
        {nav.map(n => <button key={n.id} type="button" aria-pressed={section === n.id} onClick={() => setView({ kind: n.id })}>{n.label}</button>)}
      </div>
      <div ref={scroller} className={styles.scroll} data-drag-region>{content}</div>
    </section>
  </div>;
}
