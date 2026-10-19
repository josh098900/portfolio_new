import type { CSSProperties, ReactNode } from "react";
import type { AppId } from "./routes";
import styles from "./icons.module.css";

// Original artwork in the spirit of the platform, not copies of Apple's icons.
const art: Record<AppId, { background: string; glyph: ReactNode }> = {
  notes: {
    background: "linear-gradient(180deg, #fffdf6, #f1ece0)",
    glyph: <>
      <path d="M0 0h60v17H0z" fill="#fbc72e" />
      {[27, 35, 43, 51].map(y => <path key={y} d={`M9 ${y}h42`} stroke="#d8d2c4" strokeWidth="1.4" />)}
    </>,
  },
  projects: {
    background: "linear-gradient(180deg, #6fd0ff, #1f7bf2)",
    glyph: <>
      <path d="M12 19a3 3 0 0 1 3-3h9.5l4 4H45a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z" fill="#fff" opacity=".55" />
      <path d="M12 25a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z" fill="#fff" />
      <path d="M24 33.5h12" stroke="#2f8cf5" strokeWidth="2.6" strokeLinecap="round" />
    </>,
  },
  resume: {
    background: "linear-gradient(180deg, #ffb340, #ff7a00)",
    glyph: <>
      <path d="M18 10h17l9 9v29a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z" fill="#fff" />
      <path d="M35 10v7a2 2 0 0 0 2 2h7" fill="#ffd9a8" />
      <circle cx="23.5" cy="24" r="3.5" fill="#ff8a1f" />
      {[[30, 38, 31], [21, 38, 37], [21, 34, 42]].map(([x1, x2, y]) => <path key={y} d={`M${x1} ${y}H${x2}`} stroke="#ffbf80" strokeWidth="2.2" strokeLinecap="round" />)}
    </>,
  },
  contact: {
    background: "linear-gradient(180deg, #c9a27a, #8c6239)",
    glyph: <>
      <rect x="13" y="10" width="34" height="40" rx="5" fill="#f7efe4" />
      <path d="M13 17h-3M13 25h-3M13 33h-3M13 41h-3" stroke="#f7efe4" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="30" cy="25.5" r="6" fill="#a47a52" />
      <path d="M19.5 42c1.5-6 5.7-9 10.5-9s9 3 10.5 9z" fill="#a47a52" />
    </>,
  },
  messages: {
    background: "linear-gradient(180deg, #6ee774, #19b43a)",
    glyph: <path d="M30 13c-11 0-19.5 7.3-19.5 16.3 0 5 2.7 9.5 7 12.5-.4 2.6-1.7 5-3.8 7 3.7-.2 7-1.6 9.4-3.7 2.2.6 4.5.9 6.9.9 11 0 19.5-7.3 19.5-16.4S41 13 30 13z" fill="#fff" />,
  },
  maps: {
    background: "linear-gradient(160deg, #8ce5a8, #3fbf8a 55%, #2aa3e8)",
    glyph: <>
      <path d="M8 46 22 40l16 6 14-6" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" opacity=".7" />
      <path d="M30 10c-6 0-10.5 4.6-10.5 10.4C19.5 28 30 38 30 38s10.5-10 10.5-17.6C40.5 14.6 36 10 30 10z" fill="#fff" />
      <circle cx="30" cy="20.5" r="4" fill="#3fbf8a" />
    </>,
  },
  photos: {
    background: "linear-gradient(180deg, #ffd56b, #ff7b54)",
    glyph: <>
      <circle cx="40" cy="20" r="6" fill="#fff" />
      <path d="M8 46 22 28l9 11 6-7 15 14z" fill="#fff" />
    </>,
  },
  music: {
    background: "linear-gradient(180deg, #ff6f8e, #f72b4d)",
    glyph: <path d="M25 41.5V18.2l19-4.2v23.5M25 41.5a5.5 4.5 0 1 1-11 0 5.5 4.5 0 0 1 11 0zm19-4a5.5 4.5 0 1 1-11 0 5.5 4.5 0 0 1 11 0zM25 24.5l19-4.2" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
  },
  arcade: {
    background: "linear-gradient(180deg, #b989ff, #6a35f5)",
    glyph: <>
      <path d="M19 20h22c6 0 10 5.5 10 13 0 6-2.7 9.5-6 9.5-3.4 0-5.5-4.5-8-4.5H23c-2.5 0-4.6 4.5-8 4.5-3.3 0-6-3.5-6-9.5 0-7.5 4-13 10-13z" fill="#fff" />
      <path d="M20 26v8m-4-4h8" stroke="#7a48f7" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="38" cy="28" r="2.3" fill="#7a48f7" /><circle cx="43" cy="32.5" r="2.3" fill="#7a48f7" />
    </>,
  },
  activity: {
    background: "linear-gradient(180deg, #2a2a2e, #0b0b0c)",
    glyph: <>
      {[[19, "#ff3d71"], [13.5, "#a6f53b"], [8, "#3de0ff"]].map(([r, color]) =>
        <circle key={color} cx="30" cy="30" r={r} fill="none" stroke={color as string} strokeWidth="4.6" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * (r as number) * 0.78} 999`} transform="rotate(-90 30 30)" />)}
    </>,
  },
  terminal: {
    background: "linear-gradient(180deg, #4a4a4f, #1c1c1f)",
    glyph: <>
      <rect x="9.5" y="12.5" width="41" height="35" rx="5" fill="#0d0d0f" stroke="#6b6b70" />
      <path d="m16 22 6 5-6 5" fill="none" stroke="#e7e7ea" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 33h10" stroke="#e7e7ea" strokeWidth="2.6" strokeLinecap="round" />
    </>,
  },
  settings: {
    background: "linear-gradient(180deg, #d4d4d8, #8d8d93)",
    glyph: <>
      <circle cx="30" cy="30" r="15" fill="none" stroke="#fff" strokeWidth="7" strokeDasharray="5.2 2.65" />
      <circle cx="30" cy="30" r="11.5" fill="#6e6e73" />
      <circle cx="30" cy="30" r="5" fill="#d4d4d8" />
    </>,
  },
};

/** Without a size, the icon takes --icon-size from CSS so layouts can resize it per shell. */
export function AppIcon({ app, size, className }: { app: AppId; size?: number; className?: string }) {
  const { background, glyph } = art[app];
  const style = { background, ...(size ? { "--icon-size": `${size}px` } : null) } as CSSProperties;
  return <span className={`${styles.icon} ${className ?? ""}`} style={style} aria-hidden="true">
    <svg viewBox="0 0 60 60">{glyph}</svg>
  </span>;
}

const glyphs = {
  wifi: <path d="M2.5 8.5a14 14 0 0 1 19 0M5.8 12a9.3 9.3 0 0 1 12.4 0M9.2 15.4a4.4 4.4 0 0 1 5.6 0M12 19h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  search: <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zm4.7-1.8L20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  controls: <path d="M5 8h8m4 0h2M5 16h2m4 0h8M15 8a2 2 0 1 0 0 .01M9 16a2 2 0 1 0 0 .01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  battery: <><rect x="2" y="7" width="18" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x="4" y="9" width="12" height="6" rx="1.5" fill="currentColor" /><path d="M22 10.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
  back: <path d="M15 4.5 7.5 12l7.5 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  forward: <path d="m9 4.5 7.5 7.5L9 19.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  sidebar: <><rect x="3" y="4.5" width="18" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M9.5 4.5v15" stroke="currentColor" strokeWidth="1.8" /></>,
  compose: <path d="M11 4.5H7a3 3 0 0 0-3 3V17a3 3 0 0 0 3 3h9.5a3 3 0 0 0 3-3v-4M17.6 3.6l2.8 2.8L12 14.8l-3.6.8.8-3.6z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  share: <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M8 10.5H6.5a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6.5a2 2 0 0 0-2-2H16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  folder: <path d="M3 7.5a2 2 0 0 1 2-2h4.5l2 2.2H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  pin: <path d="M9 3.5h6M10 3.5v6.2l-3 3.3h10l-3-3.3V3.5M12 13v7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  check: <path d="m6.5 12.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  arrow: <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  checklist: <path d="M3.5 6.5 5 8l2.5-3M10.5 6.5H21M10.5 17H21M6 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  table: <><rect x="3" y="4.5" width="18" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M3 9.5h18M3 14.5h18M9 9.5v10M15 9.5v10" stroke="currentColor" strokeWidth="1.6" /></>,
  paperclip: <path d="m20 11.5-7.6 7.6a5 5 0 0 1-7.1-7.1l8.1-8.1a3.4 3.4 0 0 1 4.8 4.8l-8 8a1.7 1.7 0 0 1-2.4-2.4l7.3-7.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  markup: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m9 16.5 3-9 3 9M10 13.5h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  more: <path d="M6 12h.01M12 12h.01M18 12h.01" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor" />,
  sun: <><circle cx="12" cy="12" r="4.2" fill="currentColor" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  motion: <path d="M4 12c2.5-5 5.5-5 8 0s5.5 5 8 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  prev: <path d="M11 6.5v11L3.5 12zM20.5 6.5v11L13 12z" fill="currentColor" />,
  next: <path d="M13 6.5v11l7.5-5.5zM3.5 6.5v11L11 12z" fill="currentColor" />,
  apps: <path d="M5 4h4.5v4.5H5zM14.5 4H19v4.5h-4.5zM5 15.5h4.5V20H5zM14.5 15.5H19V20h-4.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  note: <path d="M6 3.5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2zM8 8.5h8M8 12.5h8M8 16.5h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  settings: <><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  location: <path d="M20 4 4 11l7 2 2 7z" fill="currentColor" />,
  wallpaper: <><rect x="3" y="4.5" width="18" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m4 17 5-5.5 4 4 2.5-2.5L20 17.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="15.5" cy="9" r="1.6" fill="currentColor" /></>,
  appearance: <><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 3.8a8.2 8.2 0 0 1 0 16.4z" fill="currentColor" /></>,
  accessibility: <><circle cx="12" cy="4.8" r="1.9" fill="currentColor" /><path d="M5 8.5c2.3.7 4.6 1 7 1s4.7-.3 7-1M12 9.5v4.5m0 0-3 6.5m3-6.5 3 6.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></>,
  info: <><circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 11v5.5M12 7.6h.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></>,
  musicNote: <path d="M9 18.5V6.5l10-2.2v11.5M9 18.5a2.5 2 0 1 1-5 0 2.5 2 0 0 1 5 0zm10-2.7a2.5 2 0 1 1-5 0 2.5 2 0 0 1 5 0z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  pause: <path d="M7.5 5h3.2v14H7.5zM13.3 5h3.2v14h-3.2z" fill="currentColor" />,
  shuffle: <path d="M3.5 7h3.2c2.3 0 3.5 1.2 4.8 3.3l1.9 3.3c1.3 2.2 2.5 3.4 4.8 3.4h2.3M3.5 17h3.2c1.4 0 2.4-.5 3.2-1.4M13.3 8.4c.8-.9 1.8-1.4 3.2-1.4h3M17.6 4.5 20.2 7l-2.6 2.5M17.6 14.5l2.6 2.5-2.6 2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  repeat: <path d="M4.5 11V9.5a3 3 0 0 1 3-3h12M16.5 3.5l3 3-3 3M19.5 13v1.5a3 3 0 0 1-3 3h-12M7.5 20.5l-3-3 3-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  home: <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  person: <><circle cx="12" cy="8" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M4.5 20c.9-3.9 3.8-6 7.5-6s6.6 2.1 7.5 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  playlist: <path d="M4 6.5h11M4 11.5h11M4 16.5h6.5M15 18.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 0V10l5-1.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  heart: <path d="M12 19.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 6.7a4.3 4.3 0 0 1 7.5 2.8c0 5.6-7.5 10-7.5 10z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  photo: <><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m3.5 16 5-5 4 4 2.5-2.5 5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="15.5" cy="9.5" r="1.5" fill="currentColor" /></>,
  plus: <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  minus: <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  printer: <path d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v6H7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  mapPin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.3" fill="currentColor" /></>,
  compass: <><circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m12 5.5 2.4 6.5h-4.8z" fill="#ff453a" /><path d="m12 18.5-2.4-6.5h4.8z" fill="currentColor" /></>,
  layers: <path d="M12 4 3.5 8.5 12 13l8.5-4.5zM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  github: <path d="M12 2.8a9.4 9.4 0 0 0-3 18.3c.5.1.7-.2.7-.5v-1.7c-2.6.6-3.2-1.2-3.2-1.2-.4-1.1-1-1.4-1-1.4-.9-.6 0-.6 0-.6 1 .1 1.5 1 1.5 1 .8 1.4 2.2 1 2.8.8.1-.6.3-1 .6-1.2-2.1-.2-4.3-1-4.3-4.6 0-1 .4-1.9 1-2.5-.1-.3-.4-1.2.1-2.5 0 0 .8-.3 2.6 1a8.9 8.9 0 0 1 4.7 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.2.1 2.5.6.7 1 1.5 1 2.5 0 3.6-2.2 4.4-4.3 4.6.3.3.6.9.6 1.7v2.6c0 .3.2.6.7.5A9.4 9.4 0 0 0 12 2.8z" fill="currentColor" />,
  linkedin: <path d="M5 3.5h14A1.5 1.5 0 0 1 20.5 5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5zM7 10v7.5M7 6.8v.1M10.5 17.5V10M10.5 13.2c0-2 1.2-3.2 2.9-3.2 1.7 0 2.6 1.1 2.6 3v4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  gamepad: <path d="M8 8h8c3 0 5 2.8 5 6.4 0 2.6-1.3 4.1-2.8 4.1-1.8 0-2.7-2.3-4.1-2.3h-4.2c-1.4 0-2.3 2.3-4.1 2.3C4.3 18.5 3 17 3 14.4 3 10.8 5 8 8 8zM8 11v4M6 13h4M15.5 12h.01M17.5 14h.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  speaker: <path d="M4 9.5h3l4.5-4v13L7 14.5H4zM15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.4a8 8 0 0 1 0 11.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill="currentColor" />,
  send: <path d="M12 19V5.5M6 11.5l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />,
  trash: <path d="M4.5 6.5h15M9.5 6.5V4.8h5v1.7M6.5 6.5l1 13h9l1-13M10.2 10v6.5M13.8 10v6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  sunny: <><circle cx="12" cy="12" r="4.6" fill="#ffd60a" /><path d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M5.2 18.8l1.7-1.7M17.1 6.9l1.7-1.7" stroke="#ffd60a" strokeWidth="1.9" strokeLinecap="round" /></>,
  night: <path d="M19.5 14.8A7.8 7.8 0 0 1 9.2 4.5a7.8 7.8 0 1 0 10.3 10.3z" fill="#f2f2f7" />,
  cloud: <path d="M7.2 18.5h10.3a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.8 1.4 3.3 3.3 0 0 0 .1 6.6z" fill="#fff" />,
  "cloud-sun": <><circle cx="15.8" cy="7.6" r="3.4" fill="#ffd60a" /><path d="M15.8 1.8v1.2M21.6 7.6h-1.2M19.9 3.5l-.9.9M11.7 3.5l.9.9" stroke="#ffd60a" strokeWidth="1.5" strokeLinecap="round" /><path d="M6.5 20h9a3.6 3.6 0 0 0 .3-7.2 5 5 0 0 0-9.6 1.2 3 3 0 0 0 .3 6z" fill="#fff" /></>,
  "cloud-moon": <><path d="M21 10.5a4.4 4.4 0 0 1-5.8-5.8A4.4 4.4 0 1 0 21 10.5z" fill="#f2f2f7" /><path d="M6.5 20h9a3.6 3.6 0 0 0 .3-7.2 5 5 0 0 0-9.6 1.2 3 3 0 0 0 .3 6z" fill="#fff" /></>,
  fog: <path d="M4 9h16M6 13h12M4 17h16" fill="none" stroke="#e5e5ea" strokeWidth="2" strokeLinecap="round" />,
  rain: <><path d="M7.2 14.5h10.3a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.8 1.4 3.3 3.3 0 0 0 .1 6.6z" fill="#fff" /><path d="m8.5 17.5-1 2.5M12.5 17.5l-1 2.5M16.5 17.5l-1 2.5" stroke="#64d2ff" strokeWidth="1.9" strokeLinecap="round" /></>,
  snow: <><path d="M7.2 14.5h10.3a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.8 1.4 3.3 3.3 0 0 0 .1 6.6z" fill="#fff" /><path d="M8 18.5h.01M12 20.5h.01M16 18.5h.01" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></>,
  thunder: <><path d="M7.2 14.5h10.3a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.8 1.4 3.3 3.3 0 0 0 .1 6.6z" fill="#fff" /><path d="m12.8 15-2.6 4h3l-1.7 3.6" fill="none" stroke="#ffd60a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
} as const;

export type GlyphName = keyof typeof glyphs;

export function Glyph({ name, size = 16 }: { name: GlyphName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{glyphs[name]}</svg>;
}
