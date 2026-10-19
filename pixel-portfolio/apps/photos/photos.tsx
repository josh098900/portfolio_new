"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { projects } from "@/content/projects";
import { Glyph, type GlyphName } from "@/os/icons";
import styles from "./photos.module.css";

type Photo = { id: string; title: string; image?: string; alt?: string; scene?: CSSProperties; favourite?: boolean; album?: "projects" };

// Placeholder "photos": small illustrated scenes until real photos are added.
const skies = [["#ffb88c", "#ffdcb4"], ["#6fb7ff", "#cfe8ff"], ["#3b2b6b", "#e07a7a"], ["#0d1b3d", "#2e4a7d"], ["#ff9a8b", "#ffe1a8"], ["#7fd1c7", "#e3f6f1"]];
const hills = ["#2f6b4f", "#3c5a7a", "#6b4a3a", "#1f3b2d", "#5a4b7a", "#2d5d6b"];
const placeholders: Photo[] = Array.from({ length: 20 }, (_, i) => {
  const [top, bottom] = skies[i % skies.length];
  const sunX = 20 + ((i * 37) % 60);
  const sunY = 22 + ((i * 17) % 30);
  const hill = hills[(i * 5) % hills.length];
  return {
    id: `placeholder-${i}`,
    title: `Placeholder ${i + 1}`,
    favourite: i % 7 === 2,
    scene: {
      background: [
        `radial-gradient(circle at ${sunX}% ${sunY}%, rgb(255 255 255 / 0.9) 0 5%, transparent 5.5%)`,
        `radial-gradient(ellipse 80% 45% at ${30 + (i % 3) * 20}% 105%, ${hill} 0 60%, transparent 61%)`,
        `radial-gradient(ellipse 70% 35% at ${70 - (i % 4) * 10}% 108%, color-mix(in srgb, ${hill} 70%, black) 0 60%, transparent 61%)`,
        `linear-gradient(180deg, ${top}, ${bottom})`,
      ].join(", "),
    },
  };
});

const screenshots: Photo[] = projects.filter(p => p.image).map(p => ({ id: p.slug, title: p.title, image: p.image, alt: p.imageAlt, album: "projects", favourite: true }));

const library = [...screenshots, ...placeholders];

const views: { id: string; label: string; icon: GlyphName; photos: Photo[] }[] = [
  { id: "library", label: "Library", icon: "photo", photos: library },
  { id: "favourites", label: "Favourites", icon: "heart", photos: library.filter(p => p.favourite) },
  { id: "projects", label: "Projects", icon: "folder", photos: screenshots },
];

function Thumb({ photo, sizes }: { photo: Photo; sizes: string }) {
  return photo.image
    ? <Image src={photo.image} alt={photo.alt ?? photo.title} width={1280} height={720} sizes={sizes} className={styles.img} />
    : <span className={styles.scene} style={photo.scene} role="img" aria-label={`${photo.title}: an illustrated landscape`} />;
}

export function Photos() {
  const [viewId, setViewId] = useState("library");
  const [size, setSize] = useState(150);
  const [open, setOpen] = useState<number | null>(null);
  const view = views.find(v => v.id === viewId)!;
  const photo = open === null ? null : view.photos[open];

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); setOpen(null); }
      if (e.key === "ArrowRight") setOpen(i => i === null ? i : Math.min(view.photos.length - 1, i + 1));
      if (e.key === "ArrowLeft") setOpen(i => i === null ? i : Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, view.photos.length]);

  return <div className={styles.photos} style={{ "--tile": `${size}px` } as CSSProperties}>
    <aside className={styles.sidebar} aria-label="Photos" data-drag-region>
      <div className={styles.sidebarInner}>
        <p className={styles.section}>Photos</p>
        {views.map(v => <button key={v.id} type="button" aria-current={v.id === viewId || undefined} onClick={() => { setViewId(v.id); setOpen(null); }}>
          <Glyph name={v.icon} size={16} />{v.label}<span>{v.photos.length}</span>
        </button>)}
      </div>
    </aside>

    <section className={styles.main} aria-label={view.label}>
      <header className={styles.toolbar} data-drag-region>
        <div className={styles.heading}><strong>{view.label}</strong><span>{view.photos.length} items</span></div>
        <span className={styles.spacer} />
        <div className={styles.segmented} role="group" aria-label="Albums">
          {views.map(v => <button key={v.id} type="button" aria-pressed={v.id === viewId} onClick={() => setViewId(v.id)}>{v.label}</button>)}
        </div>
        <label className={styles.zoom}>
          <span className={styles.srOnly}>Thumbnail size</span>
          <Glyph name="minus" size={12} />
          <input type="range" min={90} max={260} value={size} onChange={e => setSize(Number(e.target.value))} />
          <Glyph name="plus" size={12} />
        </label>
      </header>

      <div className={styles.scroll}>
        {viewId !== "projects" && <p className={styles.banner}>More photos are on the way. For now, here are some placeholders and screenshots from Josh&apos;s projects.</p>}
        <ul className={styles.grid}>
          {view.photos.map((p, i) => <li key={p.id}>
            <button type="button" className={styles.tile} onClick={() => setOpen(i)} aria-label={`Open ${p.title}`}>
              <Thumb photo={p} sizes="260px" />
              {p.favourite && <span className={styles.heart} aria-hidden="true"><Glyph name="heart" size={12} /></span>}
            </button>
          </li>)}
        </ul>
      </div>

      {photo && <div className={styles.viewer} role="dialog" aria-modal="true" aria-label={photo.title}>
        <div className={styles.viewerBar}>
          <button type="button" onClick={() => setOpen(null)} aria-label="Back to grid"><Glyph name="back" size={18} /></button>
          <strong>{photo.title}</strong>
          <span>{(open ?? 0) + 1} of {view.photos.length}</span>
        </div>
        <div className={styles.stage}><Thumb photo={photo} sizes="100vw" /></div>
        <div className={styles.viewerNav}>
          <button type="button" disabled={open === 0} onClick={() => setOpen(i => (i ?? 1) - 1)} aria-label="Previous photo"><Glyph name="back" size={18} /></button>
          <button type="button" disabled={open === view.photos.length - 1} onClick={() => setOpen(i => (i ?? 0) + 1)} aria-label="Next photo"><Glyph name="forward" size={18} /></button>
        </div>
      </div>}
    </section>
  </div>;
}
