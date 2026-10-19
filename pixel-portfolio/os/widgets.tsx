"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Condition, Weather } from "@/lib/weather";
import { Glyph, type GlyphName } from "./icons";
import { useOS } from "./store";
import styles from "./widgets.module.css";

function subscribeMinute(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/** Today in the visitor's time zone; null on the server, which can't know it. */
function useToday() {
  const key = useSyncExternalStore(subscribeMinute, todayKey, () => null);
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  return { year: y, month: m, day: d };
}

const weekdays = ["M", "T", "W", "T", "F", "S", "S"];
const monthName = new Intl.DateTimeFormat("en-GB", { month: "long" });

export function CalendarWidget({ className }: { className?: string }) {
  const today = useToday();
  const cells: (number | null)[] = [];
  if (today) {
    const lead = (new Date(today.year, today.month, 1).getDay() + 6) % 7;
    const length = new Date(today.year, today.month + 1, 0).getDate();
    cells.push(...Array<null>(lead).fill(null), ...Array.from({ length }, (_, i) => i + 1));
  }
  const weeks = Array.from({ length: Math.ceil(cells.length / 7) }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  return <div className={`${styles.widget} ${styles.calendar} glass glass-dark ${className ?? ""}`} data-liquid>
    {today && <table>
      <caption>{monthName.format(new Date(today.year, today.month, 1))}</caption>
      <thead><tr>{weekdays.map((d, i) => <th key={i} scope="col" data-weekend={i > 4 || undefined}>{d}</th>)}</tr></thead>
      <tbody>{weeks.map((week, w) => <tr key={w}>{Array.from({ length: 7 }, (_, i) => {
        const day = week[i];
        return <td key={i} data-weekend={i > 4 || undefined} aria-current={day === today.day ? "date" : undefined}>{day ?? ""}</td>;
      })}</tr>)}</tbody>
    </table>}
  </div>;
}

const REFRESH = 30 * 60_000;
let pending: { at: number; promise: Promise<Weather | null> } | null = null;

/** One request shared by every weather widget on the page, refreshed every half hour. */
function loadWeather() {
  if (!pending || Date.now() - pending.at > REFRESH) {
    const promise = fetch("/api/weather").then(res => res.ok ? res.json() as Promise<Weather> : null).catch(() => null);
    pending = { at: Date.now(), promise };
    promise.then(weather => { if (!weather) pending = null; });
  }
  return pending.promise;
}

type WeatherState = { status: "loading" } | { status: "ready"; weather: Weather } | { status: "unavailable" };

function useWeather() {
  const [state, setState] = useState<WeatherState>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    const run = () => loadWeather().then(weather => {
      if (alive) setState(weather ? { status: "ready", weather } : { status: "unavailable" });
    });
    run();
    const id = setInterval(run, REFRESH);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return state;
}

function describe(condition: Condition, isDay: boolean): { label: string; glyph: GlyphName } {
  switch (condition) {
    case "clear": return { label: isDay ? "Sunny" : "Clear", glyph: isDay ? "sunny" : "night" };
    case "mostly-clear": return { label: isDay ? "Mostly Sunny" : "Mostly Clear", glyph: isDay ? "cloud-sun" : "cloud-moon" };
    case "partly-cloudy": return { label: "Partly Cloudy", glyph: isDay ? "cloud-sun" : "cloud-moon" };
    case "cloudy": return { label: "Cloudy", glyph: "cloud" };
    case "fog": return { label: "Foggy", glyph: "fog" };
    case "drizzle": return { label: "Drizzle", glyph: "rain" };
    case "rain": return { label: "Rain", glyph: "rain" };
    case "sleet": return { label: "Sleet", glyph: "snow" };
    case "snow": return { label: "Snow", glyph: "snow" };
    case "thunder": return { label: "Thunderstorms", glyph: "thunder" };
  }
}

export function WeatherWidget({ className }: { className?: string }) {
  const state = useWeather();
  const weather = state.status === "ready" ? state.weather : null;
  const look = weather && describe(weather.condition, weather.isDay);
  return <div className={`${styles.widget} ${styles.status} glass glass-dark ${className ?? ""}`} data-liquid title={weather ? `Weather data: ${weather.source}` : undefined}>
    <span className={styles.eyebrow}>London <Glyph name="location" size={11} /></span>
    <span className={styles.big}>{weather ? `${Math.round(weather.temperature)}°` : "--°"}</span>
    <span className={styles.footer}>
      {look && <Glyph name={look.glyph} size={20} />}
      <span>{look?.label ?? (state.status === "unavailable" ? "Weather unavailable" : "\u00a0")}</span>
      <span className={styles.muted}>{weather ? `H:${Math.round(weather.high)}° L:${Math.round(weather.low)}°` : "\u00a0"}</span>
    </span>
  </div>;
}

function CurioWidget() {
  const open = useOS(s => s.open);
  return <button type="button" className={`${styles.widget} ${styles.status} glass glass-dark`} data-liquid onClick={() => open({ app: "notes", sub: ["curio"] })}>
    <span className={styles.eyebrow}>Now building <Glyph name="location" size={11} /></span>
    <span className={styles.big}>Curio</span>
    <span className={styles.footer}>
      <span>Final-year project</span>
      <span className={styles.muted}>Web · iOS · solo travel</span>
    </span>
  </button>;
}

/** macOS desktop widgets, sitting beneath the windows. */
export function DesktopWidgets() {
  return <div className={styles.desktop}>
    <CalendarWidget />
    <WeatherWidget />
    <CurioWidget />
  </div>;
}
