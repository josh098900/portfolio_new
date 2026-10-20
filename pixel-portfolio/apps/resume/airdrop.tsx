"use client";

import { useMemo, useState, type DragEvent } from "react";
import { resumePdf } from "@/lib/resume-pdf";
import { Glyph } from "@/os/icons";
import { useShell } from "@/os/shell";
import styles from "./airdrop.module.css";

// "AirDrop" the CV: drag the file onto your own device on the radar (or tap
// it), and a PDF of the résumé downloads while the ring fills.

export function AirDrop({ onClose }: { onClose: () => void }) {
  const shell = useShell();
  const device = shell === "phone" ? "iPhone" : shell === "tablet" ? "iPad" : "Mac";
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [over, setOver] = useState(false);
  const pdf = useMemo(() => resumePdf(), []);

  function send() {
    if (state === "sending") return;
    // The download starts inside the tap or drop, so browsers allow it.
    const url = URL.createObjectURL(new Blob([pdf as BlobPart], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Joshua-Mathers-CV.pdf";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    setState("sending");
    setTimeout(() => setState("sent"), 1400);
    window.dispatchEvent(new CustomEvent("josh:achieve", { detail: "airdrop" }));
  }

  const onDrop = (event: DragEvent) => { event.preventDefault(); setOver(false); send(); };

  return <div className={styles.scrim} onPointerDown={e => e.target === e.currentTarget && onClose()}>
    <div className={`${styles.sheet} glass`} role="dialog" aria-label="AirDrop" onKeyDown={e => e.key === "Escape" && onClose()}>
      <header className={styles.head}>
        <strong>AirDrop</strong>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close AirDrop" autoFocus><Glyph name="plus" size={16} /></button>
      </header>
      <div className={styles.file} draggable onDragStart={e => { e.dataTransfer.setData("text/plain", "Joshua-Mathers-CV.pdf"); e.dataTransfer.effectAllowed = "copy"; }}>
        <span className={styles.pdf} aria-hidden="true">PDF</span>
        <span><strong>Joshua Mathers CV.pdf</strong><small>1 page · {Math.max(1, Math.round(pdf.length / 1024))} KB</small></span>
      </div>
      <p className={styles.hint}>Drag the CV onto your {device}, or tap it.</p>
      <div className={styles.radar} data-state={state}>
        <i /><i /><i />
        <button type="button" className={styles.target} data-over={over || undefined} onClick={send}
          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setOver(true); }} onDragLeave={() => setOver(false)} onDrop={onDrop}
          aria-label={state === "sent" ? `Delivered to your ${device}. Send again` : `Send the CV to your ${device}`}>
          <span className={styles.avatar}>
            <Glyph name={state === "sent" ? "check" : "person"} size={30} />
            {state === "sending" && <svg viewBox="0 0 72 72" className={styles.progress} aria-hidden="true"><circle cx="36" cy="36" r="33" /></svg>}
          </span>
          <strong>Your {device}</strong>
          <small role="status">{state === "sent" ? "Delivered" : state === "sending" ? "Sending…" : "Nearby"}</small>
        </button>
      </div>
    </div>
  </div>;
}
