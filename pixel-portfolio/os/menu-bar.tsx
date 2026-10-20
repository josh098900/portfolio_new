"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { Glyph } from "./icons";
import { appIds, apps, homeRoute, readyApps } from "./routes";
import { showDesktop } from "./mission-control";
import { selectFocused, useOS, useOSStore } from "./store";
import { layoutRect, usableArea, type Layout } from "./tiling";
import { VoiceButton } from "./voice";
import styles from "./menu-bar.module.css";

const clockFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const SOURCE = "https://github.com/josh098900/portfolio_new";

function subscribeTick(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

/** Ticks every second but only re-renders when the formatted minute changes. The server renders an empty clock. */
function useClock() {
  return useSyncExternalStore(subscribeTick, () => clockFormat.format(Date.now()).replace(",", ""), () => "");
}

type Item = { label: string; shortcut?: string; checked?: boolean; disabled?: boolean; action: () => void } | "separator";
type Menu = { id: string; title: ReactNode; label: string; bold?: boolean; items: Item[] };

function useMenus(): Menu[] {
  const focused = useOS(s => selectFocused(s));
  const windows = useOS(useShallow(s => appIds.flatMap(app => s.windows[app] ?? [])));
  const { open, launch, close, minimise, toggleZoom, reset, setOverlay, setRect } = useOS(useShallow(s => ({
    open: s.open, launch: s.launch, close: s.close, minimise: s.minimise, toggleZoom: s.toggleZoom, reset: s.reset, setOverlay: s.setOverlay, setRect: s.setRect,
  })));
  const store = useOSStore();
  const name = focused ? apps[focused.app].name : null;
  const tile = (layout: Layout) => {
    const area = usableArea();
    const el = focused && document.querySelector<HTMLElement>(`section[aria-labelledby="window-title-${focused.app}"]`);
    if (!focused || !area || !el) return;
    setRect(focused.app, layoutRect(layout, area, { w: el.offsetWidth, h: el.offsetHeight }));
    if (layout !== "fill" && layout !== "centre") window.dispatchEvent(new CustomEvent("josh:achieve", { detail: "tiling" }));
  };

  return [
    { id: "site", title: <span className={styles.logo} aria-hidden="true">J</span>, label: "Portfolio", items: [
      { label: "About This Portfolio", action: () => open({ app: "settings", sub: ["about"] }) },
      "separator",
      { label: "Settings…", action: () => launch("settings") },
      "separator",
      { label: "Start Screen Saver", action: () => setOverlay("screensaver") },
      { label: "Reset Desktop", action: reset },
    ] },
    { id: "app", title: name ?? "Desktop", label: name ?? "Desktop", bold: true, items: focused && name ? [
      { label: `Hide ${name}`, action: () => minimise(focused.app) },
      { label: `Quit ${name}`, action: () => close(focused.app) },
    ] : [
      { label: "Open the About Note", action: () => open(homeRoute) },
    ] },
    { id: "go", title: "Go", label: "Go", items: readyApps.map(app => ({ label: apps[app].name, action: () => launch(app) })) },
    { id: "window", title: "Window", label: "Window", items: [
      { label: "Minimise", disabled: !focused, action: () => focused && minimise(focused.app) },
      { label: "Zoom", disabled: !focused, action: () => focused && toggleZoom(focused.app) },
      { label: "Fill", disabled: !focused, action: () => tile("fill") },
      { label: "Centre", disabled: !focused, action: () => tile("centre") },
      "separator",
      { label: "Tile Left", disabled: !focused, action: () => tile("left") },
      { label: "Tile Right", disabled: !focused, action: () => tile("right") },
      { label: "Tile Top", disabled: !focused, action: () => tile("top") },
      { label: "Tile Bottom", disabled: !focused, action: () => tile("bottom") },
      "separator",
      { label: "Mission Control", action: () => setOverlay("mission-control") },
      { label: "Show Desktop", action: () => showDesktop(store.getState) },
      ...(windows.length ? ["separator" as const] : []),
      ...windows.map(w => ({ label: apps[w.app].name, checked: w.app === focused?.app, action: () => open({ app: w.app, sub: w.sub }) })),
    ] },
    { id: "help", title: "Help", label: "Help", items: [
      { label: "Search", shortcut: "⌘K", action: () => setOverlay("spotlight") },
      { label: "Ask Josh's Assistant", action: () => launch("messages") },
      { label: "Glass Magnifier (hold ⌥)", action: () => window.dispatchEvent(new CustomEvent("josh:magnifier")) },
      "separator",
      { label: "View Source on GitHub", action: () => window.open(SOURCE, "_blank", "noopener,noreferrer") },
    ] },
  ];
}

export function MenuBar() {
  const menus = useMenus();
  const overlay = useOS(s => s.overlay);
  const toggleOverlay = useOS(s => s.toggleOverlay);
  const clock = useClock();
  const [openId, setOpenId] = useState<string | null>(null);
  const bar = useRef<HTMLElement>(null);
  const focusFirst = useRef(false);

  // Close on outside clicks, and move focus into a menu opened from the keyboard.
  useEffect(() => {
    if (!openId) return;
    if (focusFirst.current) {
      focusFirst.current = false;
      bar.current?.querySelector<HTMLElement>(`[data-menu="${openId}"] [role^=menuitem]:not([aria-disabled=true])`)?.focus();
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!bar.current?.contains(event.target as Node)) setOpenId(null);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [openId]);

  function openMenu(id: string, withKeyboard: boolean) {
    focusFirst.current = withKeyboard;
    setOpenId(id);
  }

  function closeMenu(returnFocusTo?: string) {
    setOpenId(null);
    if (returnFocusTo) bar.current?.querySelector<HTMLElement>(`[data-title="${returnFocusTo}"]`)?.focus();
  }

  function onTitleKey(event: KeyboardEvent, id: string) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu(id, true);
    }
  }

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>, index: number) {
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>("[role^=menuitem]:not([aria-disabled=true])")];
    const at = items.indexOf(document.activeElement as HTMLElement);
    const move = (to: number) => { event.preventDefault(); items[(to + items.length) % items.length]?.focus(); };
    switch (event.key) {
      case "ArrowDown": return move(at + 1);
      case "ArrowUp": return move(at - 1);
      case "Home": return move(0);
      case "End": return move(items.length - 1);
      case "Escape": event.preventDefault(); event.stopPropagation(); return closeMenu(menus[index].id);
      case "Tab": return closeMenu();
      case "ArrowLeft":
      case "ArrowRight": {
        event.preventDefault();
        const next = menus[(index + (event.key === "ArrowRight" ? 1 : -1) + menus.length) % menus.length];
        return openMenu(next.id, true);
      }
    }
  }

  return <header ref={bar} className={styles.bar}>
    <nav className={styles.left} aria-label="Menu bar">
      {menus.map((menu, index) => <div key={menu.id} className={styles.menu}>
        <button
          type="button"
          data-title={menu.id}
          className={`${styles.title} ${menu.bold ? styles.bold : ""}`}
          aria-haspopup="menu"
          aria-expanded={openId === menu.id}
          aria-label={typeof menu.title === "string" ? undefined : menu.label}
          onClick={() => openId === menu.id ? closeMenu() : openMenu(menu.id, false)}
          onPointerEnter={() => openId && openId !== menu.id && openMenu(menu.id, false)}
          onKeyDown={e => onTitleKey(e, menu.id)}
        >{menu.title}</button>
        {openId === menu.id && <div className={styles.dropdown} role="menu" aria-label={menu.label} data-menu={menu.id} onKeyDown={e => onMenuKey(e, index)}>
          {menu.items.map((item, i) => item === "separator"
            ? <div key={`s${i}`} className={styles.separator} role="separator" />
            : <button
              key={item.label}
              type="button"
              role={item.checked === undefined ? "menuitem" : "menuitemradio"}
              aria-checked={item.checked}
              aria-disabled={item.disabled || undefined}
              className={styles.item}
              tabIndex={-1}
              onClick={() => { if (!item.disabled) { closeMenu(); item.action(); } }}
            >
              {item.checked && <span className={styles.check} aria-hidden="true">✓</span>}
              <span>{item.label}</span>
              {item.shortcut && <kbd>{item.shortcut}</kbd>}
            </button>)}
        </div>}
      </div>)}
    </nav>
    <div className={styles.right}>
      <span className={styles.status} aria-hidden="true"><Glyph name="wifi" size={15} /></span>
      <VoiceButton className={styles.title} size={15} />
      <button type="button" className={styles.title} aria-label="Spotlight (⌘K)" aria-expanded={overlay === "spotlight"} onClick={() => toggleOverlay("spotlight")}>
        <Glyph name="search" size={14} />
      </button>
      <button type="button" className={styles.title} aria-label="Control Centre" aria-expanded={overlay === "control-centre"} onClick={() => toggleOverlay("control-centre")}>
        <Glyph name="controls" size={15} />
      </button>
      <time suppressHydrationWarning>{clock}</time>
    </div>
  </header>;
}
