"use client";

import { useEffect, useState } from "react";
import { githubProfile } from "@/content/links";
import type { Activity as Data } from "@/lib/github";
import { Glyph } from "@/os/icons";
import styles from "./activity.module.css";

const rings = [
  { key: "pushes", label: "Pushes", unit: "this week", colour: "#ff375f" },
  { key: "days", label: "Active days", unit: "this week", colour: "#a6f53b" },
  { key: "repos", label: "Projects", unit: "this month", colour: "#3de0ff" },
] as const;

function Rings({ data }: { data: Data["rings"] | null }) {
  const size = 220, stroke = 22, gap = 4;
  return <svg viewBox={`0 0 ${size} ${size}`} className={styles.rings} role="img"
    aria-label={data ? rings.map(r => `${r.label}: ${data[r.key].value} of ${data[r.key].goal} ${r.unit}`).join(". ") : "Loading activity"}>
    {rings.map((r, i) => {
      const radius = size / 2 - stroke / 2 - i * (stroke + gap);
      const circumference = 2 * Math.PI * radius;
      const progress = data ? Math.min(1, data[r.key].value / data[r.key].goal) : 0;
      return <g key={r.key} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={r.colour} strokeOpacity={0.2} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={r.colour} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`} className={styles.progress} />
      </g>;
    })}
  </svg>;
}

const dayName = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

function ago(iso: string) {
  const hours = Math.round((Date.now() - Date.parse(iso)) / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export function Activity() {
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/github").then(r => r.ok ? r.json() : Promise.reject()).then(d => alive && setData(d)).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, []);

  const busiest = Math.max(1, ...(data?.days.map(d => d.pushes) ?? [1]));

  return <div className={styles.activity}>
    <header className={styles.toolbar} data-drag-region>
      <strong>Activity</strong>
      <a href={githubProfile} target="_blank" rel="noreferrer">@josh098900 on GitHub <Glyph name="arrow" size={12} /></a>
    </header>
    <div className={styles.scroll}>
      {failed && <p className={styles.notice}>GitHub isn&apos;t answering right now. Try again in a little while.</p>}

      <section className={`${styles.card} ${styles.summary}`} aria-label="This week">
        <Rings data={data?.rings ?? null} />
        <dl className={styles.legend}>
          {rings.map(r => <div key={r.key}>
            <dt style={{ color: r.colour }}>{r.label}</dt>
            <dd><strong>{data ? data.rings[r.key].value : "–"}</strong>/{data ? data.rings[r.key].goal : "–"} <span>{r.unit}</span></dd>
          </div>)}
        </dl>
      </section>

      <section className={styles.card} aria-labelledby="heat-title">
        <h3 id="heat-title">Last four weeks</h3>
        <div className={styles.heat}>
          {(data?.days ?? Array.from({ length: 28 }, (_, i) => ({ date: String(i), pushes: 0 }))).map(d =>
            <span key={d.date} title={data ? `${dayName.format(new Date(d.date))}: ${d.pushes} ${d.pushes === 1 ? "push" : "pushes"}` : undefined}
              style={{ opacity: d.pushes ? 0.35 + 0.65 * (d.pushes / busiest) : 1 }} data-active={d.pushes > 0 || undefined} />)}
        </div>
        <p className={styles.caption}>Each square is a day; brighter means more pushes.</p>
      </section>

      <div className={styles.split}>
        <section className={styles.card} aria-labelledby="lang-title">
          <h3 id="lang-title">Languages</h3>
          <ul className={styles.bars}>
            {(data?.languages ?? []).map(l => <li key={l.name}>
              <span>{l.name}</span>
              <span className={styles.bar}><i style={{ width: `${(l.repos / (data!.languages[0]?.repos || 1)) * 100}%` }} /></span>
              <span className={styles.count}>{l.repos}</span>
            </li>)}
          </ul>
          <p className={styles.caption}>Public repositories by main language.</p>
        </section>
        <section className={styles.card} aria-labelledby="recent-title">
          <h3 id="recent-title">Recently pushed</h3>
          <ul className={styles.recent}>
            {(data?.recent ?? []).map(r => <li key={r.repo}>
              <a href={`${githubProfile}/${r.repo}`} target="_blank" rel="noreferrer">{r.repo}</a>
              <span>{ago(r.at)}</span>
            </li>)}
          </ul>
        </section>
      </div>

      {data && <p className={styles.footer}>{data.user.repos} public repos · {data.user.followers} followers · on GitHub since {data.user.since}</p>}
    </div>
  </div>;
}
