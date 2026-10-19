"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { allowedExternalLinks } from "@/content/links";
import { AppLink } from "@/os/app-link";
import { Glyph } from "@/os/icons";
import { pathFromUrl } from "@/os/routes";
import styles from "./messages.module.css";

type Bubble =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string; replyId?: string; pending?: boolean }
  | { id: string; role: "notice"; text: string };

type Turn = Extract<Bubble, { role: "user" | "assistant" }>;

// Kept in sync with the server's limits in app/api/chat/route.ts.
const MAX_CHARS = 500;
const MAX_ASSISTANT_CHARS = 2_000;
const MAX_TURNS = 10;
const STORAGE_KEY = "josh-messages";
// A silent, empty WAV. Playing it inside the tap unlocks audio on iPhone Safari.
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

const greeting = "Hi! I'm Josh's assistant. Ask me about Josh's projects, the tools Josh works with, or what Josh is building now.";
const suggestions = ["What has Josh built?", "Tell me about Academy Fantasy", "What tech does Josh use?", "What is Curio?"];

/** Renders [label](href) as a link only for pages on this site and allow-listed URLs. */
function RichText({ text }: { text: string }) {
  const clean = text.replace(/\*\*/g, "");
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (let match = pattern.exec(clean); match; match = pattern.exec(clean)) {
    const [whole, label, href] = match;
    parts.push(clean.slice(last, match.index));
    if (href.startsWith("/") && pathFromUrl(href)) parts.push(<AppLink key={match.index} to={href}>{label}</AppLink>);
    else if (allowedExternalLinks.has(href)) parts.push(<a key={match.index} href={href} target="_blank" rel="noreferrer">{label}</a>);
    else parts.push(label);
    last = match.index + whole.length;
  }
  parts.push(clean.slice(last));
  return <>{parts}</>;
}

async function errorMessage(response: Response, fallback: string) {
  try {
    const { error } = await response.json();
    return typeof error === "string" ? error : fallback;
  } catch {
    return fallback;
  }
}

export function Messages() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const audioUrls = useRef(new Map<string, string>());
  const request = useRef<AbortController | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // The conversation lasts for this browser tab only and is never stored on the server.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) setBubbles(saved);
    } catch { /* Start fresh. */ }
    const urls = audioUrls.current;
    return () => {
      request.current?.abort();
      audio.current?.pause();
      for (const url of urls.values()) URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bubbles.filter(b => !(b.role === "assistant" && b.pending)))); } catch { /* Storage can be unavailable. */ }
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [bubbles]);

  const notice = (text: string) => setBubbles(list => [...list, { id: crypto.randomUUID(), role: "notice", text }]);

  async function send(text: string) {
    const question = text.trim().slice(0, MAX_CHARS);
    if (!question || busy) return;
    const history = bubbles
      .filter((b): b is Turn => b.role !== "notice" && !(b.role === "assistant" && (b.pending || !b.text)))
      .map(b => ({ role: b.role, content: b.text.slice(0, MAX_ASSISTANT_CHARS) }));
    const replyBubble = crypto.randomUUID();
    const update = (patch: Partial<Turn>) => setBubbles(list => list.map(b => b.id === replyBubble ? { ...b, ...patch } as Bubble : b));

    setBubbles(list => [...list, { id: crypto.randomUUID(), role: "user", text: question }, { id: replyBubble, role: "assistant", text: "", pending: true }]);
    setDraft("");
    setBusy(true);
    const abort = new AbortController();
    request.current = abort;
    let reply = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content: question }].slice(-MAX_TURNS) }),
        signal: abort.signal,
      });
      if (!response.ok || !response.body) {
        const message = await errorMessage(response, "Something went wrong. Please try again.");
        setBubbles(list => list.filter(b => b.id !== replyBubble));
        notice(message);
        return;
      }
      const replyId = response.headers.get("x-reply-id") ?? undefined;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        update({ text: reply });
      }
      update({ text: reply, pending: false, replyId: reply ? replyId : undefined });
    } catch {
      if (abort.signal.aborted) return;
      if (reply) update({ pending: false });
      else setBubbles(list => list.filter(b => b.id !== replyBubble));
      notice("The connection dropped. Please try again.");
    } finally {
      setBusy(false);
      request.current = null;
      input.current?.focus({ preventScroll: true });
    }
  }

  async function speak(bubble: Turn & { role: "assistant" }) {
    if (!bubble.replyId) return;
    // iPhone Safari only starts audio from a tap, and the tap has expired by the
    // time the clip downloads. So one player is unlocked here, synchronously,
    // and reused for the clip once it arrives.
    const player = audio.current ?? new Audio();
    audio.current = player;
    player.pause();
    if (playing === bubble.id) {
      setPlaying(null);
      return;
    }
    let url = audioUrls.current.get(bubble.replyId);
    if (!url) {
      player.src = SILENCE;
      player.play().catch(() => { /* Only needed to unlock playback. */ });
      setLoadingVoice(bubble.id);
      try {
        const response = await fetch("/api/speak", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: bubble.replyId }) });
        if (!response.ok) {
          notice(await errorMessage(response, "The voice isn't available right now."));
          return;
        }
        url = URL.createObjectURL(await response.blob());
        audioUrls.current.set(bubble.replyId, url);
      } catch {
        notice("The voice isn't available right now.");
        return;
      } finally {
        setLoadingVoice(null);
      }
    }
    player.src = url;
    setPlaying(bubble.id);
    player.onended = () => setPlaying(current => current === bubble.id ? null : current);
    player.play().catch(() => setPlaying(null));
  }

  function clear() {
    request.current?.abort();
    audio.current?.pause();
    setPlaying(null);
    setBubbles([]);
  }

  const lastTurn = [...bubbles].reverse().find((b): b is Turn => b.role !== "notice" && Boolean(b.text));

  return <div className={styles.messages}>
    <aside className={styles.sidebar} aria-label="Conversations" data-drag-region>
      <div className={styles.sidebarInner}>
        <div className={styles.thread} aria-current="true">
          <span className={styles.avatar} aria-hidden="true">J</span>
          <span className={styles.threadText}>
            <strong>Josh&apos;s Assistant</strong>
            <small>{lastTurn?.text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") ?? "Ask me anything about Josh"}</small>
          </span>
        </div>
      </div>
    </aside>

    <section className={styles.chat} aria-label="Conversation with Josh's Assistant">
      <header className={styles.header} data-drag-region>
        <span className={styles.who}>
          <span className={styles.avatarSmall} aria-hidden="true">J</span>
          <span><strong>Josh&apos;s Assistant</strong><small>AI assistant</small></span>
        </span>
        <button type="button" className={styles.clear} onClick={clear} disabled={bubbles.length === 0} aria-label="Clear conversation" title="Clear conversation">
          <Glyph name="trash" size={17} />
        </button>
      </header>

      <div ref={scroller} className={styles.scroll} role="log" aria-live="polite" aria-busy={busy}>
        <p className={styles.meta}>An AI that knows Josh&apos;s work. It can make mistakes. Powered by Claude, with voice by ElevenLabs.</p>
        <div className={`${styles.row} ${styles.them}`}><p className={styles.bubble}>{greeting}</p></div>
        {bubbles.map(b => b.role === "notice"
          ? <p key={b.id} className={styles.notice}>{b.text}</p>
          : <div key={b.id} className={`${styles.row} ${b.role === "user" ? styles.me : styles.them}`}>
            <p className={styles.bubble}>
              {b.role === "assistant" && b.pending && !b.text
                ? <span className={styles.typing}><i /><i /><i /><span className={styles.srOnly}>Josh&apos;s assistant is typing</span></span>
                : <RichText text={b.text} />}
            </p>
            {b.role === "assistant" && !b.pending && b.replyId && <button type="button" className={styles.listen} onClick={() => speak(b)} aria-pressed={playing === b.id}>
              <Glyph name={playing === b.id ? "stop" : "speaker"} size={14} />
              {loadingVoice === b.id ? "Loading…" : playing === b.id ? "Stop" : "Listen"}
            </button>}
          </div>)}
        {bubbles.length === 0 && <div className={styles.suggestions} role="group" aria-label="Suggested questions">
          {suggestions.map(s => <button key={s} type="button" onClick={() => send(s)}>{s}</button>)}
        </div>}
      </div>

      <form className={styles.composer} onSubmit={e => { e.preventDefault(); send(draft); }}>
        <label className={styles.field}>
          <span className={styles.srOnly}>Message Josh&apos;s assistant</span>
          <input ref={input} value={draft} onChange={e => setDraft(e.target.value)} maxLength={MAX_CHARS} placeholder="Ask about Josh" autoComplete="off" />
          {draft.length > MAX_CHARS - 100 && <span className={styles.count}>{MAX_CHARS - draft.length}</span>}
        </label>
        <button type="submit" className={styles.send} disabled={!draft.trim() || busy} aria-label="Send">
          <Glyph name="send" size={17} />
        </button>
      </form>
    </section>
  </div>;
}
