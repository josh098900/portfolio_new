"use client";

import { githubProfile, linkedInProfile } from "@/content/links";
import { AppLink } from "@/os/app-link";
import { Glyph, type GlyphName } from "@/os/icons";
import { useOS } from "@/os/store";
import styles from "./contact.module.css";

export function Contacts() {
  const launch = useOS(s => s.launch);

  const actions: { label: string; icon: GlyphName; href?: string; onClick?: () => void }[] = [
    { label: "LinkedIn", icon: "linkedin", href: linkedInProfile },
    { label: "GitHub", icon: "github", href: githubProfile },
    { label: "Message", icon: "compose", onClick: () => launch("messages") },
    { label: "Résumé", icon: "note", onClick: () => launch("resume") },
  ];

  return <div className={styles.contacts}>
    <aside className={styles.sidebar} aria-label="Contacts" data-drag-region>
      <div className={styles.sidebarInner}>
        <p className={styles.section}>All Contacts</p>
        <div className={styles.row} aria-current="true">
          <span className={styles.mini} aria-hidden="true">J</span>
          Joshua Mathers
        </div>
      </div>
    </aside>

    <section className={styles.detail} aria-labelledby="contact-name">
      <div className={styles.toolbar} data-drag-region />
      <div className={styles.scroll}>
        <div className={styles.card}>
          <span className={styles.avatar} aria-hidden="true">J</span>
          <h1 id="contact-name">Joshua Mathers</h1>
          <p className={styles.role}>Software Engineering student · University of Portsmouth</p>

          <div className={styles.actions}>
            {actions.map(a => {
              const inner = <><span className={styles.actionIcon}><Glyph name={a.icon} size={20} /></span>{a.label}</>;
              return a.href
                ? <a key={a.label} className={styles.action} href={a.href} target="_blank" rel="noreferrer">{inner}</a>
                : <button key={a.label} type="button" className={styles.action} onClick={a.onClick}>{inner}</button>;
            })}
          </div>

          <dl className={styles.fields}>
            <div><dt>LinkedIn</dt><dd><a href={linkedInProfile} target="_blank" rel="noreferrer">linkedin.com/in/joshua-mathers-3410a7219</a></dd></div>
            <div><dt>GitHub</dt><dd><a href={githubProfile} target="_blank" rel="noreferrer">github.com/josh098900</a></dd></div>
            <div><dt>Résumé</dt><dd><AppLink to="/resume">Open résumé</AppLink></dd></div>
            <div><dt>Studying</dt><dd>BSc (Hons) Software Engineering, University of Portsmouth</dd></div>
          </dl>

          <p className={styles.note}>The quickest way to reach Josh is a message on LinkedIn.</p>
        </div>
      </div>
    </section>
  </div>;
}
