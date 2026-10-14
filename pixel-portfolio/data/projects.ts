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
  status: string;
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
    status: "Browser game",
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
    status: "90% · Highest in the year",
    intro: "A group database project modelling the operations of a vehicle service business. Our team achieved 90%, the highest coursework mark in the year.",
    sections: [
      { heading: "My contribution", body: "I helped design the entity–relationship diagram, implement and create the database, and write complex SQL queries. Working across the model and implementation meant connecting the structure of the data to the questions it needed to answer." },
      { heading: "The database", body: "The PostgreSQL schema connects customers, vehicles, bookings, staff, parts, and invoicing. The repository includes the ERD, table definitions, queries, views, triggers, and database roles." },
      { heading: "A team achievement", body: "The 90% result belongs to the group. My part focused on data modelling, database implementation, and querying, contributing to a complete design and implementation delivered together." },
    ],
  },
];
