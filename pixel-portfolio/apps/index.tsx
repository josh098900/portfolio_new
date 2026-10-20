"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { AppIcon } from "@/os/icons";
import { apps, type AppId } from "@/os/routes";
import { Notes } from "./notes/notes";
import styles from "./placeholder.module.css";

export type AppProps = { sub: string[]; navigate: (sub: string[]) => void };

// Notes is the home page, so it ships with the shell. The other apps load the
// first time they open; when a URL opens one directly it is still server-rendered.
const components: Partial<Record<AppId, ComponentType<AppProps>>> = {
  notes: Notes,
  projects: dynamic(() => import("./projects/projects").then(m => m.Projects)),
  resume: dynamic(() => import("./resume/resume").then(m => m.Resume)),
  contact: dynamic(() => import("./contact/contact").then(m => m.Contacts)),
  messages: dynamic(() => import("./messages/messages").then(m => m.Messages)),
  maps: dynamic(() => import("./maps/maps").then(m => m.Maps), { ssr: false }),
  photos: dynamic(() => import("./photos/photos").then(m => m.Photos)),
  music: dynamic(() => import("./music/music").then(m => m.Music)),
  tv: dynamic(() => import("./tv/tv").then(m => m.TV)),
  appstore: dynamic(() => import("./appstore/appstore").then(m => m.AppStore)),
  arcade: dynamic(() => import("./arcade/arcade").then(m => m.Arcade)),
  activity: dynamic(() => import("./activity/activity").then(m => m.Activity)),
  terminal: dynamic(() => import("./terminal/terminal").then(m => m.Terminal)),
  settings: dynamic(() => import("./settings/settings").then(m => m.Settings)),
};

export function AppContent({ app, ...props }: AppProps & { app: AppId }) {
  const Component = components[app];
  return Component ? <Component {...props} /> : <Placeholder app={app} />;
}

function Placeholder({ app }: { app: AppId }) {
  return <div className={styles.placeholder} data-drag-region>
    <AppIcon app={app} size={88} />
    <h3>{apps[app].name}</h3>
    <p>{apps[app].description}</p>
    <span>Coming soon</span>
  </div>;
}
