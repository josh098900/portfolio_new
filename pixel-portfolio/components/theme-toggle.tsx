"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

export function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme ?? "light");
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem("josh-theme"); } catch { /* Storage can be unavailable. */ }
      if (saved === "light" || saved === "dark") return;
      const next = preference.matches ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    preference.addEventListener("change", syncSystemTheme);
    return () => preference.removeEventListener("change", syncSystemTheme);
  }, []);

  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { localStorage.setItem("josh-theme", next); } catch { /* The toggle still works without persistence. */ }
  }

  const label = theme ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Switch colour theme";
  return <button className="icon-button theme-toggle" type="button" onClick={toggle} aria-label={label} title={label}>
    <Icon name="sun" className="sun-icon" /><Icon name="moon" className="moon-icon" />
  </button>;
}
