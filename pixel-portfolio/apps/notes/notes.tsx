"use client";

import { useRef, useState } from "react";
import { findNote, folders, formatNoteDate, formatNoteShortDate, noteMonth, notePreview, notes, noteText, type Note, type NoteBlock } from "@/content/notes";
import { AppLink } from "@/os/app-link";
import { pathFromUrl } from "@/os/routes";
import { Glyph, type GlyphName } from "@/os/icons";
import type { AppProps } from "..";
import styles from "./notes.module.css";

type Folder = "all" | (typeof folders)[number];

/** Matches the container query below which the folders sidebar becomes an overlay. */
const SIDEBAR_INLINE_MIN = 820;

const formatTools: { label: string; icon: GlyphName | "Aa" }[] = [
  { label: "Text style", icon: "Aa" },
  { label: "Checklist", icon: "checklist" },
  { label: "Table", icon: "table" },
  { label: "Attachment", icon: "paperclip" },
  { label: "Markup", icon: "markup" },
];

function NoteBody({ block }: { block: NoteBlock }) {
  switch (block.type) {
    case "p": return <p>{block.text}</p>;
    case "heading": return <h2>{block.text}</h2>;
    case "list": return <ul>{block.items.map(item => <li key={item}>{item}</li>)}</ul>;
    case "checklist": return <ul className={styles.checklist}>{block.items.map(item =>
      <li key={item.text} data-done={item.done || undefined}>
        <span className={styles.checkbox} aria-hidden="true">{item.done && <Glyph name="check" size={12} />}</span>
        <span>{item.text}<span className={styles.srOnly}>{item.done ? " (done)" : " (not done yet)"}</span></span>
      </li>)}</ul>;
    // External links open in a new tab; links to apps that aren't ready yet are left out.
    case "links": return <ul className={styles.links}>{block.items.filter(item => item.to.startsWith("https://") || pathFromUrl(item.to)).map(item =>
      <li key={item.to}>{item.to.startsWith("https://")
        ? <a href={item.to} target="_blank" rel="noreferrer">{item.label}<Glyph name="arrow" size={12} /></a>
        : <AppLink to={item.to}>{item.label}<Glyph name="forward" size={13} /></AppLink>}</li>)}</ul>;
  }
}

function groupNotes(list: Note[]) {
  const groups: { label: string; notes: Note[] }[] = [];
  const sorted = [...list].sort((a, b) => b.updated.localeCompare(a.updated));
  const pinned = sorted.filter(n => n.pinned);
  if (pinned.length) groups.push({ label: "Pinned", notes: pinned });
  for (const note of sorted.filter(n => !n.pinned)) {
    const label = noteMonth(note.updated);
    let group = groups.find(g => g.label === label);
    if (!group) groups.push(group = { label, notes: [] });
    group.notes.push(note);
  }
  return groups;
}

export function Notes({ sub, navigate }: AppProps) {
  const [folder, setFolder] = useState<Folder>("all");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const root = useRef<HTMLDivElement>(null);

  const openId = sub[0];
  const note = findNote(openId ?? "about")!;
  const search = query.trim().toLowerCase();
  const visible = notes.filter(n => (folder === "all" || n.folder === folder) && (!search || noteText(n).toLowerCase().includes(search)));
  const title = folder === "all" ? "All Notes" : folder;
  const count = `${visible.length} ${visible.length === 1 ? "note" : "notes"}`;

  function say(message: string) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(location.href);
      say("Link copied");
    } catch {
      say("Copy the link from the address bar");
    }
  }

  function chooseFolder(next: Folder) {
    setFolder(next);
    if ((root.current?.offsetWidth ?? 0) < SIDEBAR_INLINE_MIN) setSidebarOpen(false);
  }

  const searchField = (className: string) => <label className={`${styles.capsule} ${styles.search} ${className}`}>
    <Glyph name="search" size={15} />
    <span className={styles.srOnly}>Search notes</span>
    <input type="search" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} />
  </label>;

  return <div ref={root} className={styles.notes} data-view={openId ? "note" : "list"} data-sidebar-open={sidebarOpen || undefined}>
    <header className={styles.toolbar} data-drag-region>
      <div className={styles.lead}>
        <button type="button" className={`${styles.glass} ${styles.circle} ${styles.sidebarToggle}`} onClick={() => setSidebarOpen(open => !open)} aria-label="Folders" aria-expanded={sidebarOpen}>
          <Glyph name="sidebar" size={18} />
        </button>
        <button type="button" className={`${styles.glass} ${styles.circle} ${styles.foldersBack}`} onClick={() => setSidebarOpen(true)} aria-label="Folders">
          <Glyph name="back" size={18} />
        </button>
        <button type="button" className={`${styles.glass} ${styles.circle} ${styles.noteBack}`} onClick={() => navigate([])} aria-label={`Back to ${title}`}>
          <Glyph name="back" size={18} />
        </button>
        <div className={styles.heading}>
          <strong>{title}</strong>
          <span>{count}</span>
        </div>
      </div>
      <div className={styles.tools}>
        <button type="button" className={`${styles.glass} ${styles.circle} ${styles.compose}`} disabled aria-label="New note (this notebook is read-only)">
          <Glyph name="compose" size={18} />
        </button>
        <div className={`${styles.glass} ${styles.capsule} ${styles.format}`} role="group" aria-label="Formatting">
          {formatTools.map(tool => <button key={tool.label} type="button" aria-label={`${tool.label} (read-only)`} onClick={() => say("These notes are read-only")}>
            {tool.icon === "Aa" ? <span className={styles.aa}>Aa</span> : <Glyph name={tool.icon} size={18} />}
          </button>)}
        </div>
        <span className={styles.spacer} />
        <div className={`${styles.glass} ${styles.capsule} ${styles.shareGroup}`}>
          <button type="button" onClick={share} aria-label="Copy link to this note"><Glyph name="share" size={18} /></button>
        </div>
        {searchField(`${styles.glass} ${styles.toolbarSearch}`)}
      </div>
      <span className={styles.toast} role="status">{toast}</span>
    </header>

    <aside className={styles.sidebar} aria-label="Folders">
      <div className={styles.sidebarInner}>
        <div className={styles.sidebarHeader}>
          <button type="button" className={styles.sidebarDone} onClick={() => setSidebarOpen(false)}>Done</button>
        </div>
        <h3 className={styles.sidebarSection}>Josh</h3>
        <ul className={styles.folders}>
          {(["all", ...folders] as Folder[]).map(f => <li key={f}>
            <button type="button" aria-current={folder === f || undefined} onClick={() => chooseFolder(f)}>
              <Glyph name="folder" size={17} />
              <span>{f === "all" ? "All Notes" : f}</span>
              <span className={styles.count}>{f === "all" ? notes.length : notes.filter(n => n.folder === f).length}</span>
            </button>
          </li>)}
        </ul>
      </div>
    </aside>
    {sidebarOpen && <div className={styles.scrim} onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

    <section className={styles.list} aria-label="Notes list">
      <h3 className={styles.largeTitle}>{title}</h3>
      {searchField(styles.listSearch)}
      <div className={styles.listScroll}>
        {groupNotes(visible).map(group => <div key={group.label}>
          <h3 className={styles.group}>{group.label}</h3>
          <ul className={styles.rows}>
            {group.notes.map(n => <li key={n.id}>
              <button type="button" className={styles.row} aria-current={n.id === note.id || undefined} onClick={() => navigate([n.id])}>
                <strong>{n.title}</strong>
                <span className={styles.rowMeta}><time dateTime={n.updated}>{formatNoteShortDate(n.updated)}</time>{notePreview(n)}</span>
                <span className={styles.rowFolder}><Glyph name="folder" size={13} />{n.folder}</span>
              </button>
            </li>)}
          </ul>
        </div>)}
        {visible.length === 0 && <p className={styles.empty}>No results</p>}
      </div>
      <p className={styles.footer}>{count}</p>
    </section>

    <article className={styles.note} aria-labelledby="note-title">
      <div className={styles.noteScroll}>
        <p className={styles.date}><time dateTime={note.updated}>{formatNoteDate(note.updated)}</time></p>
        <div className={styles.noteBody}>
          <h1 id="note-title">{note.title}</h1>
          {note.blocks.map((block, i) => <NoteBody key={i} block={block} />)}
        </div>
      </div>
    </article>
  </div>;
}
