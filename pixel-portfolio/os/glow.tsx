"use client";

import { useLive } from "./live";
import styles from "./glow.module.css";

/**
 * Apple Intelligence's glow: a band of colour around the edge of the screen
 * while the assistant is thinking or listening, breathing gently while it speaks.
 */
export function Glow() {
  const thinking = useLive(s => s.thinking);
  const speaking = useLive(s => Boolean(s.speaking));
  const listening = useLive(s => s.listening);
  const state = listening ? "listening" : thinking ? "thinking" : speaking ? "speaking" : undefined;
  return <div className={styles.glow} data-state={state} aria-hidden="true">
    <div className={styles.bloom}><i className={styles.band} /></div>
    <i className={`${styles.band} ${styles.edge}`} />
  </div>;
}
