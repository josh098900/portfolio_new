"use client";

import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { artists, artwork, formatDuration, playlists, tracks, type Track } from "@/content/music";
import { Glyph, type GlyphName } from "@/os/icons";
import { selectTrack, useMedia } from "@/os/media";
import styles from "./music.module.css";

type View = { kind: "home" } | { kind: "songs" } | { kind: "artists" } | { kind: "artist"; name: string } | { kind: "playlist"; id: string };

function Cover({ track, size, className }: { track: Track; size: number; className?: string }) {
  return <img src={artwork(track, size * 2)} alt="" width={size} height={size} loading="lazy" className={className ?? styles.cover} />;
}

function Mosaic({ list }: { list: Track[] }) {
  return <span className={styles.mosaic} aria-hidden="true">{list.slice(0, 4).map(t => <img key={t.id} src={artwork(t, 200)} alt="" loading="lazy" />)}</span>;
}

export function Music() {
  const [view, setView] = useState<View>({ kind: "home" });
  const [query, setQuery] = useState("");
  const { playing, progress, duration, volume, shuffle, repeat } = useMedia(useShallow(s => ({
    playing: s.playing, progress: s.progress, duration: s.duration, volume: s.volume, shuffle: s.shuffle, repeat: s.repeat,
  })));
  const current = useMedia(selectTrack);
  const { play, toggle, step, setVolume, setShuffle, setRepeat } = useMedia.getState();

  // Quitting Music stops the music, as on a phone. Hiding or minimising it doesn't.
  useEffect(() => () => useMedia.getState().stop(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? tracks.filter(t => `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(q)) : null;
  }, [query]);

  const nav: { label: string; icon: GlyphName; view: View }[] = [
    { label: "Home", icon: "home", view: { kind: "home" } },
    { label: "Songs", icon: "musicNote", view: { kind: "songs" } },
    { label: "Artists", icon: "person", view: { kind: "artists" } },
  ];
  const isActive = (v: View) => !results && v.kind === view.kind && (v.kind !== "playlist" || (view.kind === "playlist" && v.id === view.id));

  // Plain render functions rather than components: the player re-renders several
  // times a second, and components declared here would remount on every render.
  const songList = (list: Track[]) => {
    return <table className={styles.songs}>
      <thead><tr><th scope="col"><span className={styles.srOnly}>Number</span></th><th scope="col">Title</th><th scope="col" className={styles.wide}>Album</th><th scope="col" className={styles.time}>Time</th></tr></thead>
      <tbody>{list.map((t, i) => <tr key={t.id} aria-current={current?.id === t.id || undefined}>
        <td className={styles.num}>{current?.id === t.id && playing ? <Glyph name="speaker" size={13} /> : i + 1}</td>
        <td>
          <button type="button" className={styles.songButton} onClick={() => play(list, i)} aria-label={`Play ${t.title} by ${t.artist}`}>
            <Cover track={t} size={40} className={styles.thumb} />
            <span><strong>{t.title}</strong><small>{t.artist}</small></span>
          </button>
        </td>
        <td className={styles.wide}>{t.album}</td>
        <td className={styles.time}>{formatDuration(t.durationMs)}</td>
      </tr>)}</tbody>
    </table>;
  };

  const header = (title: string, subtitle: string, list: Track[], art: React.ReactNode) => {
    return <div className={styles.pageHead}>
      {art}
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <div className={styles.headButtons}>
          <button type="button" className={styles.primary} onClick={() => play(list, 0)}><Glyph name="play" size={14} /> Play</button>
          <button type="button" className={styles.secondary} onClick={() => { setShuffle(true); play(list, Math.floor(Math.random() * list.length)); }}><Glyph name="shuffle" size={14} /> Shuffle</button>
        </div>
      </div>
    </div>;
  };

  let content: React.ReactNode;
  if (results) {
    content = <><h1 className={styles.title}>Search</h1>{results.length ? songList(results) : <p className={styles.empty}>No songs match “{query}”.</p>}</>;
  } else if (view.kind === "home") {
    content = <>
      <h1 className={styles.title}>Home</h1>
      <h2 className={styles.shelf}>Top Picks for You</h2>
      <div className={styles.picks}>
        {artists.map(a => {
          const list = tracks.filter(t => t.group === a);
          return <button key={a} type="button" className={styles.pick} onClick={() => setView({ kind: "artist", name: a })}>
            <img src={artwork(list[0], 500)} alt="" loading="lazy" />
            <span className={styles.pickText}><small>Josh&apos;s favourites</small><strong>{a} Essentials</strong><span>{list.slice(0, 3).map(t => t.title).join(", ")} and more</span></span>
          </button>;
        })}
      </div>
      <h2 className={styles.shelf}>Recently Played</h2>
      <div className={styles.row}>
        {playlists.map(p => <button key={p.id} type="button" className={styles.tile} onClick={() => setView({ kind: "playlist", id: p.id })}>
          <Mosaic list={p.tracks} /><strong>{p.name}</strong><small>Playlist</small>
        </button>)}
        {tracks.slice(0, 8).map((t, i) => <button key={t.id} type="button" className={styles.tile} onClick={() => play(tracks, i)}>
          <Cover track={t} size={160} /><strong>{t.title}</strong><small>{t.artist}</small>
        </button>)}
      </div>
    </>;
  } else if (view.kind === "songs") {
    content = <><h1 className={styles.title}>Songs</h1>{songList(tracks)}</>;
  } else if (view.kind === "artists") {
    content = <>
      <h1 className={styles.title}>Artists</h1>
      <div className={styles.artistGrid}>
        {artists.map(a => {
          const first = tracks.find(t => t.group === a)!;
          return <button key={a} type="button" className={styles.artist} onClick={() => setView({ kind: "artist", name: a })}>
            <Cover track={first} size={160} className={styles.round} /><strong>{a}</strong>
          </button>;
        })}
      </div>
    </>;
  } else if (view.kind === "artist") {
    const list = tracks.filter(t => t.group === view.name);
    content = <>{header(view.name, `${list.length} songs Josh has on repeat`, list, <Cover track={list[0]} size={150} className={`${styles.headArt} ${styles.round}`} />)}{songList(list)}</>;
  } else {
    const playlist = playlists.find(p => p.id === view.id)!;
    content = <>{header(playlist.name, playlist.note, playlist.tracks, <span className={styles.headArt}><Mosaic list={playlist.tracks} /></span>)}{songList(playlist.tracks)}</>;
  }

  return <div className={styles.music}>
    <aside className={styles.sidebar} aria-label="Music library" data-drag-region>
      <label className={styles.search}>
        <Glyph name="search" size={15} />
        <span className={styles.srOnly}>Search songs</span>
        <input type="search" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} />
      </label>
      <nav className={styles.nav}>
        {nav.map(n => <button key={n.label} type="button" aria-current={isActive(n.view) || undefined} onClick={() => { setQuery(""); setView(n.view); }}>
          <Glyph name={n.icon} size={18} />{n.label}
        </button>)}
        <p className={styles.navHeading}>Playlists</p>
        {playlists.map(p => <button key={p.id} type="button" aria-current={isActive({ kind: "playlist", id: p.id }) || undefined} onClick={() => { setQuery(""); setView({ kind: "playlist", id: p.id }); }}>
          <Mosaic list={p.tracks} />{p.name}
        </button>)}
      </nav>
      <p className={styles.credit}>Previews and artwork courtesy of Apple Music.</p>
    </aside>

    <section className={styles.main} aria-label="Music">
      <div className={styles.phoneTabs} role="group" aria-label="Library">
        {nav.map(n => <button key={n.label} type="button" aria-pressed={isActive(n.view)} onClick={() => { setQuery(""); setView(n.view); }}>{n.label}</button>)}
      </div>
      <div className={styles.scroll} data-drag-region>{content}</div>

      <div className={`${styles.player} glass`} aria-label="Now playing">
        <div className={styles.transport}>
          <button type="button" className={styles.minor} aria-pressed={shuffle} onClick={() => setShuffle(!shuffle)} aria-label="Shuffle"><Glyph name="shuffle" size={16} /></button>
          <button type="button" onClick={() => step(-1)} aria-label="Previous"><Glyph name="prev" size={18} /></button>
          <button type="button" className={styles.playButton} onClick={toggle} aria-label={playing ? "Pause" : "Play"}><Glyph name={playing ? "pause" : "play"} size={20} /></button>
          <button type="button" onClick={() => step(1)} aria-label="Next"><Glyph name="next" size={18} /></button>
          <button type="button" className={styles.minor} aria-pressed={repeat} onClick={() => setRepeat(!repeat)} aria-label="Repeat"><Glyph name="repeat" size={16} /></button>
        </div>
        <div className={styles.now}>
          {current ? <Cover track={current} size={40} className={styles.thumb} /> : <span className={styles.thumbEmpty} aria-hidden="true"><Glyph name={"musicNote"} size={16} /></span>}
          <div className={styles.nowText}>
            <strong>{current?.title ?? "Not Playing"}</strong>
            <small>{current ? `${current.artist} · 30-second preview` : "Pick a song to hear a preview"}</small>
            <span className={styles.progress} aria-hidden="true"><i style={{ width: `${Math.min(100, (progress / duration) * 100)}%` }} /></span>
          </div>
        </div>
        <div className={styles.extras}>
          {current && <a href={current.appleMusic} target="_blank" rel="noreferrer" className={styles.apple}>Open in Apple Music <Glyph name="arrow" size={11} /></a>}
          <label className={styles.volume}>
            <Glyph name="speaker" size={15} />
            <span className={styles.srOnly}>Volume</span>
            <input type="range" min={0} max={1} step={0.05} value={volume} onChange={e => setVolume(Number(e.target.value))} />
          </label>
        </div>
      </div>
    </section>
  </div>;
}
