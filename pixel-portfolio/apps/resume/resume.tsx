"use client";

import { useEffect, useRef, useState } from "react";
import { resume } from "@/content/resume";
import { AppLink } from "@/os/app-link";
import { Glyph } from "@/os/icons";
import { AirDrop } from "./airdrop";
import styles from "./resume.module.css";

const zooms = [0.75, 0.9, 1, 1.15, 1.3];

/** Preview-style viewer for an A4 résumé. "Save as PDF" prints just the page. */
export function Resume() {
  const [zoom, setZoom] = useState(2);
  const [airdrop, setAirdrop] = useState(false);
  const page = useRef<HTMLElement>(null);

  // Windows clip their content, so printing copies the page into a clean
  // container at the top of the document, where it can flow across pages.
  useEffect(() => {
    const before = () => {
      if (!page.current) return;
      document.getElementById("print-root")?.remove();
      const root = document.createElement("div");
      root.id = "print-root";
      root.append(page.current.cloneNode(true));
      document.body.append(root);
    };
    const after = () => document.getElementById("print-root")?.remove();
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => { window.removeEventListener("beforeprint", before); window.removeEventListener("afterprint", after); after(); };
  }, []);

  return <div className={styles.resume}>
    <header className={styles.toolbar} data-drag-region>
      <div className={styles.heading}>
        <strong>Joshua Mathers – Résumé</strong>
        <span>1 page</span>
      </div>
      <span className={styles.spacer} />
      <div className={`${styles.glass} ${styles.capsule}`} role="group" aria-label="Zoom">
        <button type="button" onClick={() => setZoom(z => Math.max(0, z - 1))} disabled={zoom === 0} aria-label="Zoom out"><Glyph name="minus" size={16} /></button>
        <button type="button" onClick={() => setZoom(z => Math.min(zooms.length - 1, z + 1))} disabled={zoom === zooms.length - 1} aria-label="Zoom in"><Glyph name="plus" size={16} /></button>
      </div>
      <button type="button" className={`${styles.glass} ${styles.save}`} onClick={() => setAirdrop(true)} aria-label="AirDrop the CV as a PDF">
        <Glyph name="share" size={16} /> <span>AirDrop</span>
      </button>
      <button type="button" className={`${styles.glass} ${styles.save}`} onClick={() => window.print()}>
        <Glyph name="printer" size={16} /> <span>Save as PDF</span>
      </button>
    </header>

    <div className={styles.canvas}>
      <article ref={page} className={styles.page} style={{ "--zoom": zooms[zoom] } as React.CSSProperties} aria-label="Résumé">
        <header className={styles.masthead}>
          <h1>{resume.name}</h1>
          <p className={styles.headline}>{resume.headline}</p>
          <p className={styles.contactLine}>
            {resume.links.map((l, i) => <span key={l.href}>{i > 0 && " · "}<a href={l.href} target="_blank" rel="noreferrer">{l.display}</a></span>)}
          </p>
        </header>

        <section>
          <h2>Summary</h2>
          <p>{resume.summary}</p>
        </section>

        <section>
          <h2>Education</h2>
          {resume.education.map(e => <div key={e.title} className={styles.entry}>
            <div className={styles.entryHead}><strong>{e.title}</strong><span>{e.when}</span></div>
            <p className={styles.place}>{e.place}</p>
            <ul>{e.points.map(p => <li key={p}>{p}</li>)}</ul>
          </div>)}
        </section>

        <section>
          <h2>Projects</h2>
          {resume.projects.map(p => <div key={p.slug} className={styles.entry}>
            <div className={styles.entryHead}><strong><AppLink to={`/projects/${p.slug}`}>{p.title}</AppLink></strong><span>{p.stack}</span></div>
            <p>{p.line}</p>
          </div>)}
        </section>

        <section>
          <h2>Experience</h2>
          {resume.experience.map(e => <div key={e.title} className={styles.entry}>
            <div className={styles.entryHead}><strong>{e.title}</strong><span>{e.when}</span></div>
            <p className={styles.place}>{e.place}</p>
            <ul>{e.points.map(p => <li key={p}>{p}</li>)}</ul>
          </div>)}
        </section>

        <section>
          <h2>Skills</h2>
          <dl className={styles.skills}>
            {resume.skills.map(s => <div key={s.label}><dt>{s.label}</dt><dd>{s.items.join(", ")}</dd></div>)}
            <div><dt>Soft skills</dt><dd>{resume.softSkills.join(" · ")}</dd></div>
          </dl>
        </section>

        <p className={styles.references}>References {resume.references.toLowerCase()}</p>
      </article>
    </div>
    {airdrop && <AirDrop onClose={() => setAirdrop(false)} />}
  </div>;
}
