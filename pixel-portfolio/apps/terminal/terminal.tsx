"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { pathFromUrl } from "@/os/routes";
import { useOS } from "@/os/store";
import { complete, pretty, run, type Ctx } from "./commands";
import styles from "./terminal.module.css";

type Line = { id: number; node: ReactNode; tone?: "error" | "muted" | "accent" };

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const chips = ["help", "whoami", "projects", "neofetch", "ask what is Curio?"];

function Matrix({ onDone }: { onDone: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const scale = devicePixelRatio || 1;
    el.width = el.clientWidth * scale;
    el.height = el.clientHeight * scale;
    ctx.scale(scale, scale);
    const size = 14;
    const columns = Math.ceil(el.clientWidth / size);
    const drops = Array.from({ length: columns }, () => Math.random() * -40);
    const glyphs = "アイウエオカキクケコサシスセソJOSH01<>/{}";
    const id = setInterval(() => {
      ctx.fillStyle = "rgb(0 0 0 / 0.12)";
      ctx.fillRect(0, 0, el.clientWidth, el.clientHeight);
      ctx.fillStyle = "#30d158";
      ctx.font = `${size}px ui-monospace, Menlo, monospace`;
      drops.forEach((y, i) => {
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * size, y * size);
        drops[i] = y * size > el.clientHeight && Math.random() > 0.975 ? 0 : y + 1;
      });
    }, 50);
    const stop = setTimeout(onDone, 7000);
    const end = () => onDone();
    window.addEventListener("keydown", end);
    return () => { clearInterval(id); clearTimeout(stop); window.removeEventListener("keydown", end); };
  }, [onDone]);
  return <canvas ref={canvas} className={styles.matrix} onClick={onDone} aria-label="Matrix rain. Press any key to stop." />;
}

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [matrix, setMatrix] = useState(false);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(0);
  const konami = useRef<string[]>([]);
  const started = useRef(0);
  const field = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const { open, launch, close } = useOS(useShallow(s => ({ open: s.open, launch: s.launch, close: s.close })));

  const print = (node: ReactNode, tone?: Line["tone"]) => setLines(list => [...list, { id: nextId.current++, node, tone }]);

  // The banner uses the visitor's clock, so it's added after mount.
  useEffect(() => {
    started.current = Date.now();
    const when = new Date().toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    setLines([
      { id: nextId.current++, node: `Last login: ${when} on ttys000`, tone: "muted" },
      { id: nextId.current++, node: <>Welcome to JoshOS. Type <b>help</b> to get started, or try <b>neofetch</b>.</> },
    ]);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines, matrix]);

  // Focus the prompt straight away only with a mouse or trackpad. On touch
  // screens that would pop up the on-screen keyboard before anyone asked.
  useEffect(() => {
    if (matchMedia("(pointer: fine)").matches) field.current?.focus({ preventScroll: true });
  }, []);

  const ctx: Ctx = {
    cwd,
    setCwd,
    print,
    stream: () => {
      const id = nextId.current++;
      let text = "";
      setLines(list => [...list, { id, node: <span className={styles.thinking}>thinking…</span> }]);
      return {
        append: chunk => { text += chunk; setLines(list => list.map(l => l.id === id ? { ...l, node: text } : l)); },
        done: () => { if (!text) setLines(list => list.filter(l => l.id !== id)); },
      };
    },
    clear: () => setLines([]),
    openPath: path => {
      const route = pathFromUrl(path);
      if (route) open(route);
      return Boolean(route);
    },
    launch,
    quit: () => close("terminal"),
    effect: name => {
      if (name === "matrix") setMatrix(true);
      else print(<pre className={styles.train} aria-label="A steam train goes by.">{"      ====        ________                ___________\n  _D _|  |_______/        \\__I_I_____===__|_________|\n   |(_)---  |   H\\________/ |   |        =|___ ___|\n   /     |  |   H  |  |     |   |         ||_| |_||\n  |      |  |   H  |__--------------------| [___] |\n  | ________|___H__/__|_____/[][]~\\_______|       |\n  |/ |   |-----------I_____I [][] []  D   |=======|_\n__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__\n |/-=|___|=    ||    ||    ||    |_____/~\\___/\n  \\_/      \\O=====O=====O=====O_/      \\_/"}</pre>);
    },
    history,
    startedAt: started.current,
  };

  async function submit(text: string) {
    const command = text.trim();
    print(<><span className={styles.prompt}>visitor@portfolio {pretty(cwd)} %</span> {text}</>);
    setInput("");
    setCursor(null);
    if (!command) return;
    setHistory(h => [...h, command]);
    setBusy(true);
    try { await run(command, { ...ctx, history: [...history, command] }); } finally { setBusy(false); }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    konami.current = [...konami.current, event.key].slice(-KONAMI.length);
    if (konami.current.join() === KONAMI.join()) {
      konami.current = [];
      setTimeout(() => setInput(""), 0);
      print(<pre className={`${styles.pre} ${styles.accent}`}>{"★ ★ ★  +30 LIVES  ★ ★ ★\nYou found the Konami code. Josh would like to work with you."}</pre>);
    }
    if (event.key === "Enter") { event.preventDefault(); if (!busy) submit(input); }
    else if (event.key === "Tab") { event.preventDefault(); const done = complete(input, cwd); if (done) setInput(done); }
    else if (event.key === "ArrowUp" && history.length) {
      event.preventDefault();
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(history[next]);
    } else if (event.key === "ArrowDown" && cursor !== null) {
      event.preventDefault();
      const next = cursor + 1;
      if (next >= history.length) { setCursor(null); setInput(""); } else { setCursor(next); setInput(history[next]); }
    } else if (event.key.toLowerCase() === "l" && event.ctrlKey) { event.preventDefault(); setLines([]); }
    else if (event.key.toLowerCase() === "c" && event.ctrlKey) { event.preventDefault(); print(<><span className={styles.prompt}>visitor@portfolio {pretty(cwd)} %</span> {input}^C</>); setInput(""); }
  }

  return <div className={styles.terminal} onClick={() => { if (!getSelection()?.toString()) field.current?.focus({ preventScroll: true }); }}>
    <header className={styles.titlebar} data-drag-region>visitor — zsh — {pretty(cwd)}</header>
    <div ref={scroller} className={styles.screen}>
      <div role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map(line => <div key={line.id} className={`${styles.line} ${line.tone ? styles[line.tone] : ""}`}>{line.node}</div>)}
      </div>
      <label className={styles.inputLine}>
        <span className={styles.prompt}>visitor@portfolio {pretty(cwd)} %</span>
        <input ref={field} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" aria-label="Command" enterKeyHint="send" />
      </label>
      {matrix && <Matrix onDone={() => { setMatrix(false); field.current?.focus({ preventScroll: true }); }} />}
    </div>
    <div className={styles.chips} role="group" aria-label="Suggested commands">
      {chips.map(c => <button key={c} type="button" onClick={e => { e.stopPropagation(); if (!busy) submit(c); }}>{c}</button>)}
    </div>
  </div>;
}
