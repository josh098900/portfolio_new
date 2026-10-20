export type Project = {
  slug: string;
  number: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  github: string;
  website?: string;
  websiteLabel?: string;
  image?: string;
  imageAlt?: string;
  role: string;
  status: string;
  /** Extra links shown under the case study, e.g. a full diagram. */
  links?: { label: string; href: string }[];
  intro: string;
  sections: { heading: string; body: string }[];
};

export const projects: Project[] = [
  {
    slug: "academy-fantasy",
    number: "01",
    title: "Academy Fantasy",
    category: "Full-stack web app",
    description: "A fantasy league for F1 Academy. Build a team, follow the race weekends, and compete with friends.",
    technologies: ["Next.js", "TypeScript", "Supabase"],
    github: "https://github.com/josh098900/f1academy",
    website: "https://f1academy-mu.vercel.app/",
    websiteLabel: "View final standings",
    image: "/projects/academy-fantasy.jpg",
    imageAlt: "Academy Fantasy's completed-season page with its pink and white title and final leaderboard",
    role: "Solo project",
    status: "Trial complete",
    intro: "An unofficial, free-to-play fantasy game built around the F1 Academy racing series. The trial season is complete, and the site now preserves the final standings.",
    sections: [
      { heading: "The idea", body: "Give F1 Academy fans their own fantasy competition: select four drivers within a budget, choose a boosted driver, and compete across race weekends in global standings and private mini-leagues." },
      { heading: "Behind the experience", body: "Next.js and TypeScript power the application, with Supabase handling authentication, Postgres data, and realtime updates. The game includes scoring logic, transfer rules, and server-enforced team lock times." },
      { heading: "From building to running", body: "The project went beyond a prototype into a trial with real players. Its repository includes scoring tests, automated checks, and race-weekend operational documentation. The completed season is available through the final standings." },
    ],
  },
  {
    slug: "lab-hangout",
    number: "02",
    title: "Lab Hangout",
    category: "Multiplayer browser game",
    description: "A small pixel world with a lot going on. Custom characters, shared spaces, and real-time multiplayer.",
    technologies: ["TypeScript", "Canvas 2D", "Supabase"],
    github: "https://github.com/josh098900/clawd_hangout",
    website: "https://lab-hangout.vercel.app/",
    websiteLabel: "Visit Lab Hangout",
    image: "/projects/lab-hangout.jpg",
    imageAlt: "Lab Hangout's pixel-art character creator in a shared laboratory setting",
    role: "Solo project",
    status: "Live and playable",
    intro: "A multiplayer pixel hangout where little lab critters explore, chat, and play together. A project about making a shared space feel alive.",
    sections: [
      { heading: "A world to spend time in", body: "Players customise their character and explore connected rooms with shared activities, from whiteboards and music to arcade games. Chat bubbles and emotes make the world social." },
      { heading: "Drawn in code", body: "The game is built with Vite, TypeScript, and Canvas 2D. Its pixels are drawn programmatically, while Supabase Realtime supports multiplayer presence and interactions." },
      { heading: "Keeping a shared world working", body: "The repository includes database checks, visual regression checks, and multiplayer smoke tests. The rendering approach and original lab and square sets were adapted with permission from the film “Claw’d Labs, Part 0”, as documented in the project credits." },
    ],
  },
  {
    slug: "database-principles",
    number: "03",
    title: "Database Principles",
    category: "Group coursework",
    description: "From entity relationships to a working relational database. Awarded 90% — the highest mark in the year.",
    technologies: ["PostgreSQL", "SQL", "Data modelling"],
    github: "https://github.com/InterMaus1154/dbprin_25_cw",
    role: "Team project",
    links: [{ label: "Explore the full entity–relationship diagram", href: "https://github.com/InterMaus1154/dbprin_25_cw/blob/main/group04_erd.png" }],
    status: "90% · Highest in the year",
    intro: "A group database project modelling the operations of a vehicle service business. Our team achieved 90%, the highest coursework mark in the year.",
    sections: [
      { heading: "My contribution", body: "I helped design the entity–relationship diagram, implement and create the database, and write complex SQL queries. Working across the model and implementation meant connecting the structure of the data to the questions it needed to answer." },
      { heading: "The database", body: "The PostgreSQL schema connects customers, vehicles, bookings, staff, parts, and invoicing. The repository includes the ERD, table definitions, queries, views, triggers, and database roles." },
      { heading: "A team achievement", body: "The 90% result belongs to the group. My part focused on data modelling, database implementation, and querying, contributing to a complete design and implementation delivered together." },
    ],
  },
  {
    slug: "this-portfolio",
    number: "04",
    title: "This Portfolio",
    category: "Interactive portfolio",
    description: "The site you're using now. It turns into an iPhone, an iPad or a Mac to match your screen.",
    technologies: ["Next.js", "TypeScript", "React", "Motion", "Zustand"],
    github: "https://github.com/josh098900/portfolio_new",
    image: "/projects/this-portfolio.jpg",
    imageAlt: "The portfolio on a Mac-sized screen: an About note in a Notes-style window, desktop widgets and a glass dock",
    role: "Solo project, pair-programmed with Claude Code",
    status: "In progress",
    intro: "A portfolio you explore like a device. It opens on an About note, every app has a real link you can share, and Spotlight (⌘K) finds anything.",
    sections: [
      { heading: "One set of apps, three devices", body: "A small script picks the iPhone, iPad or Mac layout before the first paint, from screen width and pointer type, so the server-rendered page never guesses wrong. Each app is built once and adapts to its window with container queries: shrink the Notes window on a Mac and it becomes the iPhone layout." },
      { heading: "Under the hood", body: "Windows live in a small Zustand store that handles focus order, minimising, zooming, dragging and resizing. The address bar follows the window in front, so back and forward work. Live London weather comes from Open-Meteo, falls back to MET Norway when it's unavailable, and is cached on the server. On iPhone, a Dynamic Island keeps music and the assistant's voice going while you explore other apps." },
      { heading: "Details worth finding", body: "Minimise a window and it pours into the dock like the Mac's genie effect, with the funnel worked out from where the window and its icon are. In Chrome, the dock and widgets bend what's behind them like real Liquid Glass. The London Sky wallpaper calculates where the sun is over London right now and lights up the skyline after dark. Music opens into a full-screen player that takes its colours from the album art, a glow runs around the screen while the assistant thinks, and a Mac left alone writes hello in liquid glass." },
      { heading: "More to play with", body: "Windows tile to halves and quarters like macOS Sequoia, and hot corners open Mission Control. When it rains in London, drops run down the screen. A lab critter lives on the dock, an iPhone turned sideways becomes StandBy, and visionOS mode floats every window in 3D. Hold Option for a glass magnifier, speak commands to the OS, collect achievements for exploring, browse the projects as an App Store, or AirDrop the CV as a PDF that the site writes itself." },
      { heading: "Tested on every push", body: "GitHub Actions type-checks and builds the site, runs unit tests on the routing, rate limits, chat API and data parsers, then drives real browsers through it as a Mac (Chrome), an iPhone (Safari's WebKit engine) and an Android phone. Accessibility checks run on every app in light and dark mode, and a privacy test makes sure no email address or phone number appears in the site's content." },
      { heading: "Built with Claude", body: "I pair-programmed this site with Claude Code. I made the product and design decisions, from the Mac reference screenshots to which apps to build, and reviewed each step, while Claude wrote much of the implementation. Every change was checked with automated browser screenshots at iPhone, iPad and Mac sizes." },
    ],
  },
];
