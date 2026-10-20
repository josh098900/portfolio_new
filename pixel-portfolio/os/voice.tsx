"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { tracks } from "@/content/music";
import { Glyph } from "./icons";
import { useLive } from "./live";
import { useMedia } from "./media";
import { setTheme } from "./prefs";
import { useOSStore } from "./store";
import { layoutRect, usableArea } from "./tiling";
import { interpret, type Command } from "./voice-commands";
import styles from "./voice.module.css";

// Voice control: the browser's own speech recognition (Chrome and Safari)
// hears a command, os/voice-commands.ts works out what it means, and this
// does it. Anything else becomes a question for Josh's assistant.

type Recognition = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; abort: () => void;
};

function recognition(): Recognition | null {
  const w = window as Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

let current: Recognition | null = null;
let reply: (text: string) => void = () => {};

/** Starts listening for one command. */
export function listen(act: (command: Command) => void) {
  if (current) { current.abort(); return; }
  const r = recognition();
  if (!r) return;
  current = r;
  const live = useLive.getState();
  r.lang = "en-GB";
  r.interimResults = true;
  r.continuous = false;
  let finalText = "";
  r.onresult = event => {
    const text = Array.from(event.results).map(result => result[0].transcript).join(" ");
    live.setVoice({ heard: text });
    const last = event.results[event.results.length - 1];
    if (last.isFinal) finalText = text;
  };
  r.onerror = event => reply(event.error === "not-allowed" || event.error === "service-not-allowed" ? "Microphone access is off for this site." : "Sorry, I didn't catch that.");
  r.onend = () => {
    current = null;
    useLive.getState().setVoice({ listening: false });
    if (finalText.trim()) {
      const command = interpret(finalText);
      reply(command.say);
      act(command);
      window.dispatchEvent(new CustomEvent("josh:achieve", { detail: "voice" }));
    }
  };
  live.setVoice({ listening: true, heard: "" });
  r.start();
}

/** Carries out a spoken command. */
export function useVoiceActions() {
  const store = useOSStore();
  return (command: Command) => {
    const os = store.getState();
    switch (command.kind) {
      case "open": os.setOverlay(null); return os.open(command.route);
      case "play": {
        const list = command.ids.map(id => tracks.find(t => t.id === id)!).filter(Boolean);
        return useMedia.getState().play(list, 0);
      }
      case "pause": return useMedia.getState().pause();
      case "next": return useMedia.getState().step(1);
      case "previous": return useMedia.getState().step(-1);
      case "theme": return setTheme(command.theme);
      case "overlay": return os.setOverlay(command.overlay);
      case "sky": return useLive.getState().setSky(command.sky);
      case "tile": {
        const focused = Object.values(os.windows).filter(w => w && !w.minimised).sort((a, b) => b!.z - a!.z)[0];
        const el = focused && document.querySelector<HTMLElement>(`section[aria-labelledby="window-title-${focused.app}"]`);
        const area = usableArea();
        if (focused && el && area) os.setRect(focused.app, layoutRect(command.layout, area, { w: el.offsetWidth, h: el.offsetHeight }));
        if (focused && command.layout !== "fill") window.dispatchEvent(new CustomEvent("josh:achieve", { detail: "tiling" }));
        return;
      }
      case "ask":
        os.setOverlay(null);
        useLive.getState().setVoice({ question: command.question });
        return os.launch("messages");
    }
  };
}

export function useVoiceSupported() {
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported(Boolean(recognition())); }, []);
  return supported;
}

/** The microphone button, for the menu bar and Spotlight. */
export function VoiceButton({ className, size = 15 }: { className?: string; size?: number }) {
  const supported = useVoiceSupported();
  const listening = useLive(s => s.listening);
  const act = useVoiceActions();
  if (!supported) return null;
  return <button type="button" className={className} aria-label={listening ? "Stop listening" : "Voice command"} aria-pressed={listening}
    title="Try “open Josh's CV”, “play some Avicii” or “make it snow”" onClick={() => listen(act)}>
    <Glyph name="mic" size={size} />
  </button>;
}

/** What was heard, and what happened, in a glass pill above the dock. */
export function VoiceHUD() {
  const listening = useLive(s => s.listening);
  const heard = useLive(s => s.heard);
  const [said, setSaid] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    reply = text => {
      setSaid(text);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setSaid(null), 2600);
    };
    return () => { reply = () => {}; clearTimeout(timer.current); };
  }, []);

  const show = listening || said;
  return <div className={styles.anchor} aria-live="polite">
    <AnimatePresence>
      {show && <m.div key="hud" className={`${styles.hud} glass`} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}>
        <span className={styles.orb} data-listening={listening || undefined} aria-hidden="true" />
        <span className={styles.text}>
          {listening ? (heard ? `“${heard}”` : "Listening…") : said}
        </span>
      </m.div>}
    </AnimatePresence>
  </div>;
}
