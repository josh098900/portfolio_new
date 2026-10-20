"use client";

import type { ReactNode } from "react";
import { githubProfile, linkedInProfile } from "@/content/links";
import { projects } from "@/content/projects";
import { resume } from "@/content/resume";
import { setWallpaper, usePrefs, type ThemeMode } from "@/os/prefs";
import { apps, readyApps, type AppId } from "@/os/routes";
import { useLive } from "@/os/live";
import { wallpapers } from "@/os/wallpapers";
import { nodeAt, pretty, resolve } from "./fs";
import styles from "./terminal.module.css";

export type Ctx = {
  cwd: string[];
  setCwd: (path: string[]) => void;
  print: (node: ReactNode, tone?: "error" | "muted" | "accent") => void;
  stream: () => { append: (text: string) => void; done: () => void };
  clear: () => void;
  openPath: (path: string) => boolean;
  launch: (app: AppId) => void;
  quit: () => void;
  effect: (name: "matrix" | "train") => void;
  history: string[];
  startedAt: number;
};

type Command = { group?: "Explore" | "About Josh" | "System"; help?: string; run: (args: string[], ctx: Ctx) => void | Promise<void> };

const link = (href: string, label = href) => <a href={href} target="_blank" rel="noreferrer">{label}</a>;

function appFromName(name: string): AppId | undefined {
  const wanted = name.toLowerCase().replace(/\.app$/, "");
  return readyApps.find(app => app === wanted || apps[app].name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") === wanted.normalize("NFD").replace(/[̀-ͯ]/g, ""));
}

function cowsay(text: string) {
  const line = text || "Moo. Hire Josh.";
  const bar = "-".repeat(line.length + 2);
  return ` ${bar.replace(/-/g, "_")}\n< ${line} >\n ${bar}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`;
}

const fortunes = [
  "“Programs must be written for people to read, and only incidentally for machines to execute.” · Harold Abelson",
  "“Simplicity is prerequisite for reliability.” · Edsger W. Dijkstra",
  "“First, solve the problem. Then, write the code.” · John Johnson",
  "“Make it work, make it right, make it fast.” · Kent Beck",
  "“There are only two hard things in Computer Science: cache invalidation and naming things.” · Phil Karlton",
  "“Talk is cheap. Show me the code.” · Linus Torvalds",
];

const logo = [
  "       ██╗",
  "       ██║",
  "       ██║",
  "  ██   ██║",
  "  ╚█████╔╝",
  "   ╚════╝ ",
];

function browserName() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "a web browser";
}

function since(ms: number) {
  const minutes = Math.floor((Date.now() - ms) / 60_000);
  return minutes < 1 ? "less than a minute" : minutes === 1 ? "1 min" : `${minutes} mins`;
}

export const commands: Record<string, Command> = {
  help: {
    group: "System", help: "show this list",
    run: (_, ctx) => {
      const groups = ["Explore", "About Josh", "System"] as const;
      ctx.print(<div className={styles.help}>
        {groups.map(g => <div key={g}>
          <p className={styles.helpGroup}>{g}</p>
          {Object.entries(commands).filter(([, c]) => c.group === g).map(([name, c]) => <p key={name}><span className={styles.cmd}>{name.padEnd(10)}</span>{c.help}</p>)}
        </div>)}
        <p className={styles.dim}>Tab completes, ↑ and ↓ go through history. There are a few hidden commands too.</p>
      </div>);
    },
  },
  ls: {
    group: "Explore", help: "list files (ls -a shows hidden ones)",
    run: (args, ctx) => {
      const all = args.includes("-a") || args.includes("-la") || args.includes("-al");
      const target = args.find(a => !a.startsWith("-"));
      const path = target ? resolve(ctx.cwd, target) : ctx.cwd;
      const node = path && nodeAt(path);
      if (!node) return ctx.print(`ls: ${target}: No such file or directory`, "error");
      if (node.kind === "file") return ctx.print(target);
      const names = Object.entries(node.children).filter(([name]) => all || !name.startsWith("."));
      ctx.print(<p className={styles.columns}>{names.map(([name, child]) => <span key={name} className={child.kind === "dir" ? styles.dir : undefined}>{name}{child.kind === "dir" ? "/" : ""}</span>)}</p>);
    },
  },
  cd: {
    group: "Explore", help: "change directory",
    run: (args, ctx) => {
      const path = resolve(ctx.cwd, args[0] ?? "~");
      const node = path && nodeAt(path);
      if (!node) return ctx.print(`cd: no such file or directory: ${args[0]}`, "error");
      if (node.kind !== "dir") return ctx.print(`cd: not a directory: ${args[0]}`, "error");
      ctx.setCwd(path!);
    },
  },
  pwd: { group: "Explore", help: "print the current directory", run: (_, ctx) => ctx.print(`/Users/visitor/${ctx.cwd.join("/")}`.replace(/\/$/, "")) },
  cat: {
    group: "Explore", help: "print a file",
    run: (args, ctx) => {
      if (!args[0]) return ctx.print("usage: cat <file>", "error");
      const path = resolve(ctx.cwd, args[0]);
      const node = path && nodeAt(path);
      if (!node) return ctx.print(`cat: ${args[0]}: No such file or directory`, "error");
      if (node.kind === "dir") return ctx.print(`cat: ${args[0]}: Is a directory`, "error");
      ctx.print(<pre className={styles.pre}>{node.text()}</pre>);
    },
  },
  open: {
    group: "Explore", help: "open an app, file or link (open music, open projects/lab-hangout.md)",
    run: (args, ctx) => {
      const target = args.join(" ");
      if (!target) return ctx.print("usage: open <app | file | github | linkedin>", "error");
      if (/^github$/i.test(target)) { window.open(githubProfile, "_blank", "noopener"); return ctx.print("Opening GitHub…", "muted"); }
      if (/^linkedin$/i.test(target)) { window.open(linkedInProfile, "_blank", "noopener"); return ctx.print("Opening LinkedIn…", "muted"); }
      const app = appFromName(target);
      if (app) { ctx.launch(app); return ctx.print(`Opening ${apps[app].name}…`, "muted"); }
      const path = resolve(ctx.cwd, target);
      const node = path && nodeAt(path);
      if (node?.kind === "file" && node.route && ctx.openPath(node.route)) return ctx.print(`Opening ${target}…`, "muted");
      if (target.startsWith("/") && ctx.openPath(target)) return ctx.print(`Opening ${target}…`, "muted");
      ctx.print(`open: can't open "${target}". Try an app name, like: open music`, "error");
    },
  },
  clear: { group: "Explore", help: "clear the screen (or press Ctrl+L)", run: (_, ctx) => {
    ctx.clear();
    // Also ends a forced rain or snow, back to London's real weather.
    if (useLive.getState().sky !== "live") useLive.getState().setSky("live");
  } },

  whoami: { group: "About Josh", help: "who is Josh?", run: (_, ctx) => ctx.print("josh: third-year software engineering student at the University of Portsmouth. Builds things for the web, and is currently building Curio. Looking for graduate software engineering roles: try `hire`.") },
  projects: {
    group: "About Josh", help: "list Josh's projects",
    run: (_, ctx) => ctx.print(<div>{projects.map(p => <p key={p.slug}><span className={styles.cmd}>{p.title.padEnd(20)}</span>{p.category} · {p.role}</p>)}<p className={styles.dim}>Read one with: cat projects/{projects[0].slug}.md, or open it with: open projects/{projects[0].slug}.md</p></div>),
  },
  skills: {
    group: "About Josh", help: "what Josh works with",
    run: (_, ctx) => ctx.print(<div>{resume.skills.map(s => <p key={s.label}><span className={styles.cmd}>{s.label.padEnd(11)}</span>{s.items.join(", ")}</p>)}</div>),
  },
  resume: { group: "About Josh", help: "open Josh's résumé", run: (_, ctx) => { ctx.launch("resume"); ctx.print("Opening Résumé…", "muted"); } },
  contact: { group: "About Josh", help: "how to reach Josh", run: (_, ctx) => ctx.print(<div><p>LinkedIn  {link(linkedInProfile)}</p><p>GitHub    {link(githubProfile)}</p></div>) },
  ask: {
    group: "About Josh", help: "ask Josh's AI assistant (ask what is Curio?)",
    run: async (args, ctx) => {
      const question = args.join(" ").replace(/^["']|["']$/g, "").trim();
      if (!question) return ctx.print("usage: ask <question>", "error");
      const out = ctx.stream();
      try {
        const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: question.slice(0, 500) }] }) });
        if (!res.ok || !res.body) {
          const { error } = await res.json().catch(() => ({ error: null }));
          out.append(error ?? "The assistant isn't available right now.");
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          out.append(decoder.decode(value, { stream: true }).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
        }
      } catch {
        out.append("The connection dropped. Please try again.");
      } finally {
        out.done();
      }
    },
  },

  neofetch: {
    group: "System", help: "system information",
    run: (_, ctx) => {
      const theme = document.documentElement.dataset.theme ?? "light";
      const wall = wallpapers.find(w => w.id === document.documentElement.dataset.wallpaper)?.name ?? "Aurora";
      const info: [string, string][] = [
        ["OS", "JoshOS 26 (Liquid Glass)"],
        ["Host", browserName()],
        ["Kernel", "Next.js 16 · React 19"],
        ["Uptime", since(ctx.startedAt)],
        ["Shell", "zsh-ish 1.0"],
        ["Resolution", `${innerWidth}×${innerHeight}`],
        ["Theme", `${theme[0].toUpperCase()}${theme.slice(1)} · ${wall}`],
        ["Apps", `${readyApps.length} installed`],
        ["CPU", "Curiosity @ 100%"],
        ["Memory", `${projects.length} projects shipped, 1 in progress`],
      ];
      ctx.print(<div className={styles.neofetch}>
        <pre className={styles.logo}>{logo.join("\n")}</pre>
        <div>
          <p><span className={styles.accent}>visitor</span>@<span className={styles.accent}>portfolio</span></p>
          <p className={styles.dim}>-----------------</p>
          {info.map(([k, v]) => <p key={k}><span className={styles.accent}>{k}</span>: {v}</p>)}
          <p className={styles.swatches}>{["#ff453a", "#ff9f0a", "#ffd60a", "#30d158", "#64d2ff", "#0a84ff", "#bf5af2", "#ff375f"].map(c => <i key={c} style={{ background: c }} />)}</p>
        </div>
      </div>);
    },
  },
  weather: {
    group: "System", help: "London weather",
    run: async (_, ctx) => {
      try {
        const res = await fetch("/api/weather");
        if (!res.ok) throw new Error();
        const w = await res.json();
        ctx.print(<pre className={styles.pre}>{`   .--.      London\n .(    ).    ${Math.round(w.temperature)}°C, ${String(w.condition).replace("-", " ")}\n(___.__)__)  High ${Math.round(w.high)}° · Low ${Math.round(w.low)}°`}</pre>);
      } catch {
        ctx.print("weather: the forecast is unavailable right now.", "error");
      }
    },
  },
  theme: {
    group: "System", help: "theme light | dark | auto",
    run: (args, ctx) => {
      const mode = args[0] as ThemeMode;
      if (!["light", "dark", "auto"].includes(mode)) return ctx.print("usage: theme light | dark | auto", "error");
      usePrefs.getState().setThemeMode(mode);
      ctx.print(`Theme set to ${mode}.`, "muted");
    },
  },
  wallpaper: {
    group: "System", help: "wallpaper <name> (no name lists them)",
    run: (args, ctx) => {
      const wanted = args[0]?.toLowerCase();
      const found = wallpapers.find(w => w.id === wanted);
      if (!found) return ctx.print(`Wallpapers: ${wallpapers.map(w => w.id).join(", ")}`, wanted ? "error" : undefined);
      setWallpaper(found.id);
      ctx.print(`Wallpaper set to ${found.name}.`, "muted");
    },
  },
  history: { group: "System", help: "commands you've run", run: (_, ctx) => ctx.print(<pre className={styles.pre}>{ctx.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join("\n")}</pre>) },
  date: { group: "System", help: "today's date and time", run: (_, ctx) => ctx.print(new Date().toString().replace(/ \(.*\)$/, "")) },
  echo: { group: "System", help: "print some text", run: (args, ctx) => ctx.print(args.join(" ")) },
  exit: { group: "System", help: "close Terminal", run: (_, ctx) => ctx.quit() },

  // Hidden extras: not listed in help.
  sudo: {
    run: (args, ctx) => {
      const rest = args.join(" ");
      if (/^make me a sandwich$/i.test(rest)) return ctx.print("Okay.");
      if (/^hire josh$/i.test(rest)) return commands.hire.run(["josh"], ctx);
      if (/^rm /.test(rest)) return commands.rm.run(args.slice(1), ctx);
      ctx.print(<div><p>[sudo] password for visitor: ********</p><p>visitor is not in the sudoers file. This incident will be reported to Josh. 😄</p></div>);
    },
  },
  make: { run: (args, ctx) => ctx.print(/^me a sandwich$/i.test(args.join(" ")) ? "What? Make it yourself." : `make: *** No rule to make target '${args.join(" ") || "all"}'. Stop.`, "error") },
  rm: { run: (args, ctx) => ctx.print(args.some(a => a.includes("r")) ? "rm: refusing to delete Josh's portfolio. It took a while to build. 🙃" : "rm: this filesystem is read-only. Everything here is worth keeping.", "error") },
  hire: {
    run: (_, ctx) => {
      ctx.print(<pre className={`${styles.pre} ${styles.accent}`}>{"╭──────────────────────────────╮\n│   Excellent decision. ✨     │\n│   Opening Josh's contact…    │\n╰──────────────────────────────╯"}</pre>);
      ctx.launch("contact");
    },
  },
  coffee: { run: (_, ctx) => ctx.print(<pre className={styles.pre}>{"      ( (\n       ) )\n    ........\n    |      |]\n    \\      /\n     `----'\nBrewing… Josh runs on this."}</pre>) },
  matrix: { run: (_, ctx) => ctx.effect("matrix") },
  sl: { run: (_, ctx) => ctx.effect("train") },
  rain: { run: (_, ctx) => { useLive.getState().setSky("rain"); ctx.print("Rain on the glass. Type clear to go back to London's real weather."); } },
  snow: { run: (_, ctx) => { useLive.getState().setSky("snow"); ctx.print("Let it snow. ❄  Type clear to go back to London's real weather."); } },
  cowsay: { run: (args, ctx) => ctx.print(<pre className={styles.pre}>{cowsay(args.join(" ").slice(0, 40))}</pre>) },
  fortune: { run: (_, ctx) => ctx.print(fortunes[Math.floor(Math.random() * fortunes.length)]) },
  ping: { run: (_, ctx) => ctx.print(<div><p>PING portfolio (127.0.0.1): 56 data bytes</p><p>64 bytes: icmp_seq=0 ttl=64 time=0.042 ms</p><p className={styles.accent}>pong! Want the real thing? Type: pong</p></div>) },
  pong: { run: (_, ctx) => { ctx.openPath("/arcade/pong"); ctx.print("Opening Pong…", "muted"); } },
  snake: { run: (_, ctx) => { ctx.openPath("/arcade/snake"); ctx.print("Opening Snake…", "muted"); } },
  vim: { run: (_, ctx) => ctx.print("You're now in vim. Just kidding. Nobody ever really gets out of vim, so we skipped that part.") },
  vi: { run: (_, ctx) => commands.vim.run([], ctx) },
  nano: { run: (_, ctx) => ctx.print("nano is a fine choice. But this terminal is read-only.") },
  emacs: { run: (_, ctx) => ctx.print("emacs: a great operating system, lacking only a decent editor. (Read-only here, sorry.)") },
  ":q": { run: (_, ctx) => ctx.print("You weren't in vim, but well done remembering how to leave.") },
  ":wq": { run: (_, ctx) => commands[":q"].run([], ctx) },
  git: {
    run: (args, ctx) => {
      const sub = args[0];
      if (sub === "status") return ctx.print(<pre className={styles.pre}>{"On branch main\nYour branch is up to date with 'origin/curiosity'.\n\nnothing to commit, working tree clean"}</pre>);
      if (sub === "blame") return ctx.print("It was Josh. It's always Josh. (In a good way.)");
      if (sub === "push") return ctx.print("Everything up-to-date. (This terminal lives in your browser, so there's nowhere to push.)");
      if (sub === "log") return ctx.print(<div><p>See the real history on GitHub: {link("https://github.com/josh098900/portfolio_new/commits")}</p></div>);
      ctx.print("usage: git status | log | blame | push", "error");
    },
  },
  hello: { run: (_, ctx) => ctx.print("Hello! 👋 Type help to see what I can do.") },
  hi: { run: (_, ctx) => commands.hello.run([], ctx) },
  xyzzy: { run: (_, ctx) => ctx.print("Nothing happens.") },
  "42": { run: (_, ctx) => ctx.print("The answer to the ultimate question of life, the universe and everything.") },
  curio: { run: (_, ctx) => { ctx.openPath("/notes/curio"); ctx.print("Curio: Josh's final-year project, a web and iOS app for solo travellers. Opening the devlog…", "muted"); } },
  man: { run: (args, ctx) => args[0] === "josh" ? commands.whoami.run([], ctx) : ctx.print(`No manual entry for ${args[0] ?? "nothing"}. Try: help`, "error") },
};

export const visibleCommands = Object.entries(commands).filter(([, c]) => c.group).map(([name]) => name);

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return row[b.length];
}

export async function run(input: string, ctx: Ctx) {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return;
  const command = commands[name] ?? commands[name.toLowerCase()];
  if (command) {
    // Commands missing from help are the hidden ones.
    if (!command.group) window.dispatchEvent(new CustomEvent("josh:achieve", { detail: "hacker" }));
    return command.run(args, ctx);
  }
  const guess = visibleCommands.map(c => [c, distance(name.toLowerCase(), c)] as const).sort((a, b) => a[1] - b[1])[0];
  ctx.print(`zsh: command not found: ${name}${guess && guess[1] <= 2 ? `. Did you mean ${guess[0]}?` : ""}`, "error");
}

/** Completes the last word against commands (first word) or paths (later words). */
export function complete(input: string, cwd: string[]): string | null {
  const words = input.split(" ");
  const last = words.at(-1) ?? "";
  if (words.length === 1) {
    const matches = visibleCommands.filter(c => c.startsWith(last));
    return matches.length === 1 ? `${matches[0]} ` : null;
  }
  const slash = last.lastIndexOf("/");
  const base = slash >= 0 ? last.slice(0, slash + 1) : "";
  const stem = last.slice(slash + 1);
  const dirPath = resolve(cwd, base || ".");
  const dirNode = dirPath && nodeAt(dirPath);
  if (!dirNode || dirNode.kind !== "dir") return null;
  const matches = Object.entries(dirNode.children).filter(([n]) => n.startsWith(stem) && (stem.startsWith(".") || !n.startsWith(".")));
  if (matches.length !== 1) return null;
  const [n, node] = matches[0];
  words[words.length - 1] = `${base}${n}${node.kind === "dir" ? "/" : ""}`;
  return words.join(" ");
}

export { pretty };
