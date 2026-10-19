"use client";

import type { MouseEvent, ReactNode } from "react";
import { pathFromUrl } from "./routes";
import { useOS } from "./store";

/** A real link that opens its target inside the OS instead of reloading the page. */
export function AppLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  const open = useOS(s => s.open);
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const route = pathFromUrl(to);
    if (!route) return;
    event.preventDefault();
    open(route);
  }
  return <a href={to} className={className} onClick={onClick}>{children}</a>;
}
