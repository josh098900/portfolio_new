"use client";

import type { CSSProperties, ReactNode } from "react";
import { Glyph, type GlyphName } from "@/os/icons";
import { setWallpaper, usePrefs, useTheme, useWallpaper, type ThemeMode } from "@/os/prefs";
import { useOS } from "@/os/store";
import { wallpapers } from "@/os/wallpapers";
import type { AppProps } from "..";
import { findSection, settingsSections, type SettingsSection } from "./sections";
import styles from "./settings.module.css";

const sectionIcons: Record<SettingsSection, { glyph: GlyphName; color: string }> = {
  wallpaper: { glyph: "wallpaper", color: "#14b0ec" },
  appearance: { glyph: "appearance", color: "#2c2c2e" },
  accessibility: { glyph: "accessibility", color: "#0a84ff" },
  about: { glyph: "info", color: "#8e8e93" },
};

function SectionIcon({ id }: { id: SettingsSection }) {
  return <span className={styles.sectionIcon} style={{ background: sectionIcons[id].color }} aria-hidden="true">
    <Glyph name={sectionIcons[id].glyph} size={16} />
  </span>;
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={styles.switch} onClick={() => onChange(!checked)}>
    <span />
  </button>;
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return <section className={styles.groupWrap}>
    {title && <h3 className={styles.groupTitle}>{title}</h3>}
    <div className={styles.group}>{children}</div>
  </section>;
}

function WallpaperPane() {
  const current = useWallpaper();
  const theme = useTheme();
  const active = wallpapers.find(w => w.id === current);
  return <>
    <div className={styles.hero}>
      {/* No data-wallpaper here: the preview inherits whatever is on the desktop. */}
      <div className={`${styles.heroPreview} wallpaper-fill`} aria-hidden="true" />
      <div className={styles.heroText}>
        <strong>{active?.name ?? " "}</strong>
        <span>{active?.note ?? " "}</span>
        <small>{theme ? `Showing the ${theme} version. It follows your appearance.` : " "}</small>
      </div>
    </div>
    <h3 className={styles.groupTitle}>Wallpapers</h3>
    <div className={styles.thumbs} role="group" aria-label="Wallpapers">
      {wallpapers.map(w => <button key={w.id} type="button" className={styles.thumb} aria-pressed={current === w.id} onClick={() => setWallpaper(w.id)}>
        <span className={`${styles.thumbFill} wallpaper-fill`} data-wallpaper={w.id} aria-hidden="true" />
        <span className={styles.thumbName}>{w.name}</span>
      </button>)}
    </div>
  </>;
}

const modes: { id: ThemeMode; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

function AppearancePane() {
  const mode = usePrefs(s => s.themeMode);
  const setMode = usePrefs(s => s.setThemeMode);
  return <><Group title="Appearance">
    <div className={styles.modes} role="group" aria-label="Appearance">
      {modes.map(m => <button key={m.id} type="button" className={styles.mode} aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
        <span className={styles.modePreview} data-mode={m.id} aria-hidden="true"><span /></span>
        <span>{m.label}</span>
      </button>)}
    </div>
    <p className={styles.hint}>Auto matches your device and switches when it does.</p>
  </Group><ScreenSaverGroup /></>;
}

function ScreenSaverGroup() {
  const screenSaver = usePrefs(s => s.screenSaver);
  const setScreenSaver = usePrefs(s => s.setScreenSaver);
  const hotCorners = usePrefs(s => s.hotCorners);
  const setHotCorners = usePrefs(s => s.setHotCorners);
  const weatherEffects = usePrefs(s => s.weatherEffects);
  const setWeatherEffects = usePrefs(s => s.setWeatherEffects);
  return <Group title="Desktop">
    <div className={styles.row}>
      <span className={styles.rowText}><strong>Live weather</strong><small>Rain runs down the glass when it&apos;s raining in London, and it snows when London does.</small></span>
      <Switch checked={weatherEffects} onChange={setWeatherEffects} label="Live weather" />
    </div>
    <div className={styles.row}>
      <span className={styles.rowText}><strong>Hello screen saver</strong><small>On a Mac-sized screen, writes “hello” after two minutes without activity.</small></span>
      <Switch checked={screenSaver} onChange={setScreenSaver} label="Hello screen saver" />
    </div>
    <div className={styles.row}>
      <span className={styles.rowText}><strong>Hot corners</strong><small>Top left: Mission Control. Bottom left: screen saver. Bottom right: show the desktop.</small></span>
      <Switch checked={hotCorners} onChange={setHotCorners} label="Hot corners" />
    </div>
  </Group>;
}

function AccessibilityPane() {
  const reduceMotion = usePrefs(s => s.reduceMotion);
  const setReduceMotion = usePrefs(s => s.setReduceMotion);
  const brightness = usePrefs(s => s.brightness);
  const setBrightness = usePrefs(s => s.setBrightness);
  return <>
    <Group title="Motion">
      <div className={styles.row}>
        <span className={styles.rowText}><strong>Reduce Motion</strong><small>Turns off window animations and transitions.</small></span>
        <Switch checked={reduceMotion} onChange={setReduceMotion} label="Reduce Motion" />
      </div>
    </Group>
    <Group title="Display">
      <label className={styles.row}>
        <span className={styles.rowText}><strong>Brightness</strong><small>Dims this site, not your screen.</small></span>
        <span className={styles.slider}>
          <Glyph name="sun" size={12} />
          <input type="range" min={30} max={100} value={Math.round(brightness * 100)} onChange={e => setBrightness(Number(e.target.value) / 100)}
            style={{ "--fill": `${((brightness - 0.3) / 0.7) * 100}%` } as CSSProperties} aria-label="Brightness" />
          <Glyph name="sun" size={17} />
        </span>
      </label>
    </Group>
  </>;
}

const facts: [string, ReactNode][] = [
  ["Built with", "Next.js 16, React 19 and TypeScript"],
  ["Animation", "Motion"],
  ["State", "Zustand"],
  ["Interfaces", "iPhone, iPad and Mac, picked from your screen"],
  ["Assistant", "Claude Haiku 5.5 by Anthropic"],
  ["Voice", "ElevenLabs"],
  ["Weather", "Open-Meteo and MET Norway (CC BY 4.0)"],
  ["Films", "Letterboxd"],
];

function AboutPane() {
  return <>
    <div className={styles.about}>
      <span className={styles.aboutIcon} aria-hidden="true">J</span>
      <strong>Josh&apos;s Portfolio</strong>
      <span>A portfolio that feels like the device you open it on.</span>
    </div>
    <Group>
      {facts.map(([label, value]) => <div key={label} className={styles.row}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowValue}>{value}</span>
      </div>)}
    </Group>
    <Group>
      <a className={styles.row} href="https://github.com/josh098900" target="_blank" rel="noreferrer">
        <span className={styles.rowLabel}>More of my work on GitHub</span>
        <Glyph name="arrow" size={14} />
      </a>
    </Group>
    <p className={styles.hint}>Not affiliated with Apple. Icons and wallpapers are original.</p>
  </>;
}

const panes: Record<SettingsSection, () => ReactNode> = {
  wallpaper: WallpaperPane,
  appearance: AppearancePane,
  accessibility: AccessibilityPane,
  about: AboutPane,
};

export function Settings({ sub, navigate }: AppProps) {
  const open = useOS(s => s.open);
  const chosen = findSection(sub[0]);
  const section = chosen ?? settingsSections[0];
  const Pane = panes[section.id];

  return <div className={styles.settings} data-view={chosen ? "detail" : "list"}>
    <aside className={styles.sidebar} aria-label="Settings sections" data-drag-region>
      <div className={styles.sidebarInner}>
        <h2 className={styles.largeTitle}>Settings</h2>
        <button type="button" className={styles.profile} onClick={() => open({ app: "notes", sub: ["about"] })}>
          <span className={styles.avatar} aria-hidden="true">J</span>
          <span className={styles.profileText}><strong>Josh</strong><small>Software engineering student</small></span>
          <Glyph name="forward" size={13} />
        </button>
        <ul className={styles.nav}>
          {settingsSections.map(s => <li key={s.id}>
            <button type="button" aria-current={s.id === section.id || undefined} onClick={() => navigate([s.id])}>
              <SectionIcon id={s.id} />
              <span>{s.name}</span>
              <span className={styles.chevron}><Glyph name="forward" size={13} /></span>
            </button>
          </li>)}
        </ul>
      </div>
    </aside>

    <section className={styles.detail} aria-labelledby="settings-title">
      <header className={styles.toolbar} data-drag-region>
        <button type="button" className={styles.back} onClick={() => navigate([])} aria-label="Back to Settings">
          <Glyph name="back" size={18} />
        </button>
        <h2 id="settings-title">{section.name}</h2>
      </header>
      <div className={styles.scroll}>
        <div className={styles.body}><Pane /></div>
      </div>
    </section>
  </div>;
}
