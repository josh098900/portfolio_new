"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Glyph } from "@/os/icons";
import type { AppProps } from "..";
import { engines, HEIGHT, WIDTH, type Game } from "./engine";
import { findGame, games, type GameId } from "./games";
import styles from "./arcade.module.css";

const LAB_HANGOUT = "https://lab-hangout.vercel.app/";
const art: Record<GameId, string> = {
  pong: "linear-gradient(135deg, #0a84ff, #5e5ce6)",
  snake: "linear-gradient(135deg, #30d158, #0e8f6a)",
  bricks: "linear-gradient(135deg, #ff9f0a, #ff375f)",
  "lab-hangout": "linear-gradient(135deg, #3b2a5c, #c75b39)",
};
const glyph: Record<GameId, string> = { pong: "▮ ●  ▮", snake: "▰▰▰▰ ●", bricks: "▬▬▬\n  ●", "lab-hangout": "◉‿◉" };

function readBest(id: string) {
  try { return Number(localStorage.getItem(`josh-arcade-${id}`)) || 0; } catch { return 0; }
}

function Player({ id }: { id: Exclude<GameId, "lab-hangout"> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setBest(readBest(id));
    game.current = engines[id](canvas.current!, {
      score: value => {
        setScore(value);
        setBest(prev => {
          if (value <= prev) return prev;
          try { localStorage.setItem(`josh-arcade-${id}`, String(value)); } catch { /* Scores still show without storage. */ }
          return value;
        });
      },
      status: setStatus,
    });
    canvas.current!.focus({ preventScroll: true });
    return () => game.current?.stop();
  }, [id]);

  // Keys only steer the game while it has focus, so typing elsewhere is unaffected.
  function onKey(event: React.KeyboardEvent, down: boolean) {
    if (game.current?.key(event.key, down)) event.preventDefault();
  }

  function position(event: ReactPointerEvent<HTMLCanvasElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - box.left) / box.width, y: (event.clientY - box.top) / box.height };
  }

  return <div className={styles.player}>
    <div className={styles.scoreboard} aria-live="polite">
      <span>Score <strong>{score}</strong></span>
      <span>Best <strong>{best}</strong></span>
    </div>
    <div className={styles.screen}>
      <canvas
        ref={canvas}
        className={styles.canvas}
        style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
        tabIndex={0}
        aria-label={`${findGame(id)!.name}. ${status ?? "Playing."}`}
        onKeyDown={e => onKey(e, true)}
        onKeyUp={e => onKey(e, false)}
        onPointerMove={e => { const p = position(e); game.current?.pointer(p.x, p.y); }}
        onPointerDown={e => { e.currentTarget.focus(); const p = position(e); swipeStart.current = { x: e.clientX, y: e.clientY }; game.current?.pointer(p.x, p.y); }}
        onPointerUp={e => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const dx = e.clientX - start.x, dy = e.clientY - start.y;
          if (Math.hypot(dx, dy) > 24) game.current?.swipe(dx, dy);
          else game.current?.action();
        }}
      />
      {status && <p className={styles.status}>{status}</p>}
    </div>
    {id === "snake" && <div className={styles.dpad} aria-label="Direction controls">
      {([["ArrowUp", "↑"], ["ArrowLeft", "←"], ["ArrowDown", "↓"], ["ArrowRight", "→"]] as const).map(([key, label]) =>
        <button key={key} type="button" data-dir={key} aria-label={key.replace("Arrow", "")} onPointerDown={e => { e.preventDefault(); game.current?.key(key, true); }}>{label}</button>)}
    </div>}
  </div>;
}

export function Arcade({ sub, navigate }: AppProps) {
  const current = findGame(sub[0]);

  return <div className={styles.arcade} data-view={current ? "game" : "home"}>
    <aside className={styles.sidebar} aria-label="Games" data-drag-region>
      <div className={styles.sidebarInner}>
        <p className={styles.section}>Arcade</p>
        {games.map(g => <button key={g.id} type="button" aria-current={g.id === current?.id || undefined} onClick={() => navigate([g.id])}>
          <span className={styles.mini} style={{ background: art[g.id] }} aria-hidden="true" />
          <span className={styles.gameName}><strong>{g.name}</strong><small>{g.blurb}</small></span>
        </button>)}
      </div>
    </aside>

    <section className={styles.main} aria-label={current?.name ?? "Arcade"}>
      <header className={styles.toolbar} data-drag-region>
        {current && <button type="button" className={styles.back} onClick={() => navigate([])} aria-label="All games"><Glyph name="back" size={18} /></button>}
        <strong>{current?.name ?? "Arcade"}</strong>
        {current?.id === "lab-hangout" && <a className={styles.external} href={LAB_HANGOUT} target="_blank" rel="noreferrer">Open in a new tab <Glyph name="arrow" size={12} /></a>}
      </header>

      {!current && <div className={styles.home}>
        <p className={styles.intro}>Pick a game. Your best scores are saved in this browser.</p>
        <div className={styles.cards}>
          {games.map(g => <button key={g.id} type="button" className={styles.card} onClick={() => navigate([g.id])}>
            <span className={styles.cover} style={{ background: art[g.id] }} aria-hidden="true"><span>{glyph[g.id]}</span></span>
            <strong>{g.name}</strong>
            <small>{g.blurb}</small>
          </button>)}
        </div>
      </div>}

      {current && current.id !== "lab-hangout" && <Player key={current.id} id={current.id} />}
      {current?.id === "lab-hangout" && <iframe className={styles.frame} src={LAB_HANGOUT} title="Lab Hangout, Josh's multiplayer pixel world" allow="fullscreen; autoplay" />}
    </section>
  </div>;
}
