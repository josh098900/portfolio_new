"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import { Glyph } from "@/os/icons";
import { useTheme } from "@/os/prefs";
import styles from "./maps.module.css";

type MapLibre = import("maplibre-gl").Map;
type MarkerType = import("maplibre-gl").Marker;

// Free vector tiles from OpenFreeMap: no key, no usage limits, OpenStreetMap data.
const styleUrl = (dark: boolean, muted: boolean) => `https://tiles.openfreemap.org/styles/${dark ? "dark" : muted ? "positron" : "liberty"}`;

const places = [
  { name: "Big Ben", area: "London", at: [-0.1246, 51.5007] },
  { name: "Tower Bridge", area: "London", at: [-0.0754, 51.5055] },
  { name: "British Museum", area: "London", at: [-0.127, 51.5194] },
  { name: "Eiffel Tower", area: "Paris", at: [2.2945, 48.8584] },
  { name: "Hallgrímskirkja", area: "Reykjavík", at: [-21.9266, 64.1417] },
  { name: "Central Park", area: "New York", at: [-73.9665, 40.7812] },
  { name: "Shibuya Crossing", area: "Tokyo", at: [139.7005, 35.6595] },
  { name: "Sydney Opera House", area: "Sydney", at: [151.2153, -33.8568] },
] as const;

export function Maps() {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibre | null>(null);
  const marker = useRef<MarkerType | null>(null);
  const theme = useTheme();
  const [muted, setMuted] = useState(false);
  const [tilted, setTilted] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    import("maplibre-gl").then(({ Map, AttributionControl, setWorkerUrl }) => {
      if (cancelled || !container.current) return;
      setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");
      let instance: MapLibre;
      try {
        instance = new Map({
          container: container.current,
          style: styleUrl(document.documentElement.dataset.theme === "dark", false),
          center: [-0.1276, 51.5072],
          zoom: 11.5,
          attributionControl: false,
          dragRotate: true,
        });
      } catch {
        // MapLibre needs WebGL2, which some machines and browser settings switch off.
        setUnsupported(true);
        return;
      }
      instance.addControl(new AttributionControl({ compact: true }), "bottom-right");
      // OpenFreeMap's styles reference a few icons their sprites don't include; draw nothing for those.
      instance.setMissingStyleImageResolver(id => {
        if (!instance.hasImage(id)) instance.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
      });
      instance.on("rotate", () => setBearing(instance.getBearing()));
      map.current = instance;
      // Windows resize without the page resizing, so follow the container instead.
      observer = new ResizeObserver(() => instance.resize());
      observer.observe(container.current);
    });
    return () => {
      cancelled = true;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (theme) map.current?.setStyle(styleUrl(theme === "dark", muted));
  }, [theme, muted]);

  async function go(place: (typeof places)[number]) {
    const instance = map.current;
    if (!instance) return;
    setSelected(place.name);
    const { Marker } = await import("maplibre-gl");
    marker.current?.remove();
    marker.current = new Marker({ color: "#ff375f" }).setLngLat([...place.at]).addTo(instance);
    instance.flyTo({ center: [...place.at], zoom: 15, speed: 1.4, essential: true });
  }

  function locate() {
    if (!navigator.geolocation) return setMessage("Your browser can't share its location.");
    setMessage("Finding you…");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setMessage(null);
        const { Marker } = await import("maplibre-gl");
        marker.current?.remove();
        if (map.current) {
          marker.current = new Marker({ color: "#0a84ff" }).setLngLat([coords.longitude, coords.latitude]).addTo(map.current);
          map.current.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14, essential: true });
        }
      },
      () => setMessage("Location wasn't shared, so the map stays where it is."),
      { timeout: 10_000 },
    );
  }

  const visible = places.filter(p => `${p.name} ${p.area}`.toLowerCase().includes(query.trim().toLowerCase()));

  return <div className={styles.maps}>
    <div ref={container} className={styles.map} aria-label="Map" role="region" />

    <aside className={`${styles.panel} glass`} aria-label="Places" data-drag-region>
      <label className={styles.search}>
        <Glyph name="search" size={15} />
        <span className={styles.srOnly}>Search places</span>
        <input type="search" placeholder="Search Maps" value={query} onChange={e => setQuery(e.target.value)} />
      </label>
      <p className={styles.heading}>Places to explore</p>
      <ul className={styles.places}>
        {visible.map(p => <li key={p.name}>
          <button type="button" aria-current={selected === p.name || undefined} onClick={() => go(p)}>
            <span className={styles.pin} aria-hidden="true"><Glyph name="mapPin" size={15} /></span>
            <span><strong>{p.name}</strong><small>{p.area}</small></span>
          </button>
        </li>)}
        {visible.length === 0 && <li className={styles.none}>No places match.</li>}
      </ul>
    </aside>

    <div className={styles.controls}>
      <div className={`${styles.stack} glass`}>
        <button type="button" onClick={() => map.current?.zoomIn()} aria-label="Zoom in"><Glyph name="plus" size={16} /></button>
        <button type="button" onClick={() => map.current?.zoomOut()} aria-label="Zoom out"><Glyph name="minus" size={16} /></button>
      </div>
      <div className={`${styles.stack} glass`}>
        <button type="button" onClick={() => { map.current?.resetNorthPitch(); setTilted(false); }} aria-label="Point north">
          <span style={{ display: "grid", transform: `rotate(${-bearing}deg)` }}><Glyph name="compass" size={18} /></span>
        </button>
        <button type="button" aria-pressed={tilted} onClick={() => { const next = !tilted; setTilted(next); map.current?.easeTo({ pitch: next ? 60 : 0 }); }} aria-label="Tilt the map">3D</button>
        <button type="button" onClick={locate} aria-label="Show my location"><Glyph name="location" size={15} /></button>
        <button type="button" aria-pressed={muted} onClick={() => setMuted(m => !m)} aria-label="Muted map style" title="Muted style"><Glyph name="layers" size={16} /></button>
      </div>
    </div>

    {message && <p className={`${styles.toast} glass`} role="status">{message}</p>}
    {unsupported && <div className={styles.unsupported} role="status">
      <Glyph name="mapPin" size={28} />
      <strong>Maps can&apos;t draw here</strong>
      <span>The map needs WebGL, which this browser or device has switched off.</span>
    </div>}
  </div>;
}
