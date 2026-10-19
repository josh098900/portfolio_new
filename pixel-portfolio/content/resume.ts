// From Josh's 2025 CV, brought up to date with the rest of the site (third year,
// final-year project). Phone number, email address and home town are left out on
// purpose: contact goes through LinkedIn and GitHub.

import { githubProfile, linkedInProfile } from "./links";
import { projects } from "./projects";

export const resume = {
  name: "Joshua Mathers",
  headline: "Software Engineering student",
  links: [
    { label: "LinkedIn", href: linkedInProfile, display: "linkedin.com/in/joshua-mathers-3410a7219" },
    { label: "GitHub", href: githubProfile, display: "github.com/josh098900" },
  ],
  summary: "Third-year Software Engineering student at the University of Portsmouth. Proficient in Python, R, JavaScript, TypeScript, Next.js and SQL, with hands-on project experience building web interfaces and databases and analysing data with R.",
  education: [
    {
      title: "BSc (Hons) Software Engineering",
      place: "University of Portsmouth",
      when: "Expected graduation 2027",
      points: [
        "Relevant coursework: Object-Oriented Programming, Web Development, Database Systems, Software Design.",
        "Final-year project: Curio, a web and iOS app for solo travellers.",
      ],
    },
  ],
  experience: [
    {
      title: "Warehouse Operative & PPT Driver",
      place: "Evri",
      when: "2021 – 2024",
      points: [
        "Operated powered pallet trucks in a high-volume distribution centre.",
        "Collaborated with cross-functional teams of 20+ operatives to optimise workflow efficiency and meet tight operational deadlines.",
        "Identified and resolved logistical bottlenecks through clear communication with supervisors, improving team productivity.",
      ],
    },
  ],
  projects: projects.map(p => ({ slug: p.slug, title: p.title, line: `${p.role}. ${p.description}`, stack: p.technologies.join(", ") })),
  skills: [
    { label: "Languages", items: ["Python", "JavaScript", "TypeScript", "Swift", "SQL", "R"] },
    { label: "Frontend", items: ["HTML", "CSS", "React", "Next.js", "Tailwind CSS"] },
    { label: "Tools", items: ["Git", "Xcode", "Supabase", "Tkinter", "RStudio"] },
    { label: "Databases", items: ["PostgreSQL"] },
  ],
  softSkills: ["Problem-solving", "Communication", "Teamwork", "Adaptability", "Time management"],
  references: "Available on request.",
};

/** Plain text, for the terminal and the assistant. */
export function resumeText() {
  return [
    `${resume.name}, ${resume.headline}`,
    resume.summary,
    "",
    "EDUCATION",
    ...resume.education.flatMap(e => [`${e.title}, ${e.place} (${e.when})`, ...e.points.map(p => `  - ${p}`)]),
    "",
    "EXPERIENCE",
    ...resume.experience.flatMap(e => [`${e.title}, ${e.place} (${e.when})`, ...e.points.map(p => `  - ${p}`)]),
    "",
    "PROJECTS",
    ...resume.projects.map(p => `  - ${p.title}: ${p.line}`),
    "",
    "SKILLS",
    ...resume.skills.map(s => `  ${s.label}: ${s.items.join(", ")}`),
    `  Soft skills: ${resume.softSkills.join(", ")}`,
    "",
    `References: ${resume.references}`,
  ].join("\n");
}
