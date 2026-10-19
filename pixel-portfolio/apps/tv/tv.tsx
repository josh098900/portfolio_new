"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { letterboxdProfile } from "@/content/links";
import { posterAt, type Diary, type Film } from "@/lib/letterboxd";
import { Glyph, type GlyphName } from "@/os/icons";
import { usePrefs } from "@/os/prefs";
import styles from "./tv.module.css";

type View = "home" | "diary" | "top" | "loved";

const views: { id: View; label: string; icon: GlyphName }[] = [
  { id: "home", label: "Home", icon: "tv" },
  { id: "diary", label: "Diary", icon: "calendar" },
  { id: "top", label: "Top Rated", icon: "star" },
  { id: "loved", label: "Loved", icon: "heartFill" },
];

const HERO_SLIDES = 5;
const HERO_MS = 7000;
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const asDate = (day: string) => new Date(`${day}T00:00:00Z`);

function Stars({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  const text = "★".repeat(Math.floor(rating)) + (rating % 1 ? "½" : "");
  return <span className={styles.stars} role="img" aria-label={`Rated ${rating} out of 5`}>{text}</span>;
}

function Badges({ film }: { film: Film }) {
  return <>
    {film.liked && <span className={styles.liked} role="img" aria-label="Loved"><Glyph name="heartFill" size={13} /></span>}
    {film.rewatch && <span className={styles.rewatch} role="img" aria-label="Rewatch"><Glyph name="rewatch" size={13} /></span>}
  </>;
}

/** tvOS-style focus: the poster tilts towards the pointer and catches the light. */
function useTilt() {
  const frame = useRef(0);
  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const el = event.currentTarget;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (event.clientX - left) / width, y = (event.clientY - top) / height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
      el.style.setProperty("--ry", `${(x - 0.5) * 18}deg`);
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
      el.dataset.tilting = "";
    });
  }
  function onPointerLeave(event: ReactPointerEvent<HTMLElement>) {
    cancelAnimationFrame(frame.current);
    const el = event.currentTarget;
    for (const prop of ["--rx", "--ry", "--mx", "--my"]) el.style.removeProperty(prop);
    delete el.dataset.tilting;
  }
  return { onPointerMove, onPointerLeave };
}

function Poster({ film, size = "shelf" }: { film: Film; size?: "shelf" | "grid" }) {
  const tilt = useTilt();
  return <a className={`${styles.card} ${size === "grid" ? styles.gridCard : ""}`} href={film.url} target="_blank" rel="noreferrer" {...tilt}>
    <span className={styles.art}>
      {film.poster
        ? <img src={posterAt(film.poster, "medium")} alt="" loading="lazy" referrerPolicy="no-referrer" />
        : <span className={styles.noPoster}>{film.title}</span>}
      <span className={styles.shine} aria-hidden="true" />
    </span>
    <span className={styles.cardTitle}>{film.title}</span>
    <span className={styles.cardMeta}>
      {film.rating === null && !film.liked ? <span>{film.year ?? ""}</span> : <><Stars rating={film.rating} /><Badges film={film} /></>}
    </span>
  </a>;
}

function Shelf({ title, films }: { title: string; films: Film[] }) {
  if (films.length === 0) return null;
  return <section className={styles.shelfSection} aria-label={title}>
    <h2 className={styles.shelf}>{title}</h2>
    <div className={styles.row}>{films.map(f => <Poster key={f.id} film={f} />)}</div>
  </section>;
}

function Hero({ films }: { films: Film[] }) {
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const reduceMotion = usePrefs(s => s.reduceMotion);
  const tilt = useTilt();
  const film = films[at];

  // Moves on every few seconds, like the Apple TV app, unless the visitor is reading or prefers stillness.
  useEffect(() => {
    if (held || reduceMotion || films.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setAt(i => (i + 1) % films.length), HERO_MS);
    return () => clearTimeout(id);
  }, [at, held, reduceMotion, films.length]);

  if (!film) return null;
  return <section
    className={styles.hero}
    aria-roledescription="carousel"
    aria-label="Recently watched"
    onPointerEnter={() => setHeld(true)}
    onPointerLeave={() => setHeld(false)}
    onFocus={() => setHeld(true)}
    onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHeld(false); }}
  >
    <div className={styles.backdrop} aria-hidden="true">
      {films.map((f, i) => f.poster && <img key={f.id} src={posterAt(f.poster, "medium")} alt="" data-active={i === at || undefined} referrerPolicy="no-referrer" />)}
    </div>
    <div className={styles.heroBody} key={film.id} aria-roledescription="slide" aria-label={`${at + 1} of ${films.length}`}>
      <div className={styles.heroText}>
        <p className={styles.eyebrow}>{at === 0 ? "Just watched" : "Watched"}{film.watched && ` · ${dayMonth.format(asDate(film.watched))}`}</p>
        <h2 className={styles.heroTitle}>{film.title}</h2>
        <p className={styles.heroMeta}>
          {film.year && <span>{film.year}</span>}
          <Stars rating={film.rating} />
          <Badges film={film} />
        </p>
        {film.review && <p className={styles.review}>{film.review}</p>}
        {film.spoilers && <p className={styles.review}>Josh&apos;s review has spoilers, so it stays on Letterboxd.</p>}
        <a className={styles.primary} href={film.url} target="_blank" rel="noreferrer">
          {film.review || film.spoilers ? "Read on Letterboxd" : "View on Letterboxd"} <Glyph name="arrow" size={12} />
        </a>
      </div>
      {film.poster && <a className={`${styles.card} ${styles.heroCard}`} href={film.url} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true" {...tilt}>
        <span className={styles.art}>
          <img src={posterAt(film.poster, "medium")} alt="" referrerPolicy="no-referrer" />
          <span className={styles.shine} />
        </span>
      </a>}
    </div>
    {films.length > 1 && <div className={styles.dots} role="group" aria-label="Choose a film">
      {films.map((f, i) => <button key={f.id} type="button" aria-label={f.title} aria-current={i === at || undefined} onClick={() => setAt(i)} />)}
    </div>}
  </section>;
}

function Stats({ films }: { films: Film[] }) {
  const rated = films.filter(f => f.rating !== null);
  const average = rated.length ? rated.reduce((sum, f) => sum + f.rating!, 0) / rated.length : null;
  const oldest = films.map(f => f.watched).filter((d): d is string => Boolean(d)).sort()[0];
  const items = [
    { value: String(films.length), label: oldest ? `films since ${monthYear.format(asDate(oldest))}` : "films lately" },
    ...(average !== null ? [{ value: `★ ${average.toFixed(1)}`, label: "average rating" }] : []),
    { value: String(films.filter(f => f.liked).length), label: "loved" },
    { value: String(films.filter(f => f.rewatch).length), label: "rewatched" },
  ];
  return <dl className={styles.stats}>
    {items.map(i => <div key={i.label}><dt>{i.label}</dt><dd>{i.value}</dd></div>)}
  </dl>;
}

function DiaryList({ films }: { films: Film[] }) {
  const months = new Map<string, Film[]>();
  for (const f of films) {
    const key = f.watched ? monthYear.format(asDate(f.watched)) : "Undated";
    months.set(key, [...(months.get(key) ?? []), f]);
  }
  return <>{[...months].map(([month, list]) => <section key={month} aria-label={month}>
    <h2 className={styles.month}>{month}</h2>
    <ol className={styles.diary}>
      {list.map(f => <li key={f.id}>
        <span className={styles.day}>{f.watched ? <>{asDate(f.watched).getUTCDate()}<small>{weekday.format(asDate(f.watched))}</small></> : "–"}</span>
        {f.poster ? <img src={posterAt(f.poster, "small")} alt="" width={40} height={60} loading="lazy" referrerPolicy="no-referrer" /> : <span className={styles.thumbEmpty} />}
        <a href={f.url} target="_blank" rel="noreferrer" className={styles.entry}><strong>{f.title}</strong>{f.year && <small>{f.year}</small>}</a>
        <span className={styles.entryMeta}><Stars rating={f.rating} /><Badges film={f} /></span>
      </li>)}
    </ol>
  </section>)}</>;
}

function Grid({ films, empty }: { films: Film[]; empty: string }) {
  return films.length ? <div className={styles.grid}>{films.map(f => <Poster key={f.id} film={f} size="grid" />)}</div> : <p className={styles.empty}>{empty}</p>;
}

export function TV() {
  const [view, setView] = useState<View>("home");
  const [diary, setDiary] = useState<Diary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/letterboxd").then(r => r.ok ? r.json() : Promise.reject()).then(d => alive && setDiary(d)).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, []);

  const films = useMemo(() => diary?.films ?? [], [diary]);
  const topRated = useMemo(() => films.filter(f => f.rating !== null && f.rating >= 4).sort((a, b) => b.rating! - a.rating!), [films]);
  const loved = useMemo(() => films.filter(f => f.liked), [films]);
  const profile = diary?.profile ?? letterboxdProfile;

  let content: ReactNode;
  if (failed) {
    content = <p className={styles.empty}>Letterboxd isn&apos;t answering right now. Try again in a little while.</p>;
  } else if (!diary) {
    content = <div className={styles.loading} aria-busy="true" aria-label="Loading films">
      <span className={styles.heroSkeleton} />
      <div className={styles.row}>{Array.from({ length: 6 }, (_, i) => <span key={i} className={styles.cardSkeleton} />)}</div>
    </div>;
  } else if (view === "home") {
    content = <>
      <Hero films={films.filter(f => f.poster).slice(0, HERO_SLIDES)} />
      <Stats films={films} />
      <Shelf title="Recently Watched" films={films} />
      <Shelf title="Josh's Top Rated" films={topRated} />
      <Shelf title="Loved" films={loved} />
    </>;
  } else if (view === "diary") {
    content = <><h1 className={styles.title}>Diary</h1><DiaryList films={films} /></>;
  } else if (view === "top") {
    content = <><h1 className={styles.title}>Top Rated</h1><Grid films={topRated} empty="Nothing rated four stars or more lately." /></>;
  } else {
    content = <><h1 className={styles.title}>Loved</h1><Grid films={loved} empty="No loved films in the recent diary yet." /></>;
  }

  return <div className={styles.tv}>
    <aside className={styles.sidebar} aria-label="TV" data-drag-region>
      <nav className={styles.nav}>
        {views.map(v => <button key={v.id} type="button" aria-current={view === v.id || undefined} onClick={() => setView(v.id)}>
          <Glyph name={v.icon} size={18} />{v.label}
        </button>)}
      </nav>
      {profile && <a className={styles.profile} href={profile} target="_blank" rel="noreferrer">
        Josh on Letterboxd <Glyph name="arrow" size={11} />
      </a>}
      <p className={styles.credit}>Film data and posters from Letterboxd.</p>
    </aside>

    <section className={styles.main} aria-label="TV">
      <div className={styles.phoneTabs} role="group" aria-label="Library">
        {views.map(v => <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>)}
      </div>
      <div className={styles.scroll} data-drag-region>{content}</div>
    </section>
  </div>;
}
