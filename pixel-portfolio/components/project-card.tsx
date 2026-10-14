import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import { Icon } from "./icons";

export function ProjectCard({ project }: { project: Project }) {
  return <article className={`project-card ${project.slug}`}>
    <Link href={`/work/${project.slug}`} className="project-visual" aria-label={`Read about ${project.title}`}>
      <div className="visual-topline"><span>{project.slug === "academy-fantasy" ? "RACE WEEKEND, REIMAGINED." : "A LITTLE WORLD. A LOT OF POSSIBILITY."}</span><Icon name="arrow" /></div>
      <div className="browser-frame">
        <div className="browser-toolbar" aria-hidden="true"><div className="browser-dots"><i /><i /><i /></div><span>{project.slug === "academy-fantasy" ? "academy fantasy" : "lab hangout"}</span><span>↗</span></div>
        <Image src={project.image!} alt={project.imageAlt!} width={1280} height={720} sizes="(max-width: 700px) 90vw, 45vw" loading={project.number === "01" ? "eager" : "lazy"} />
      </div>
    </Link>
    <div className="project-meta"><span>{project.number} / {project.category}</span><span>{project.status}</span></div>
    <div className="project-title-row"><h3><Link href={`/work/${project.slug}`}>{project.title}</Link></h3><Link href={`/work/${project.slug}`} aria-label={`Read about ${project.title}`} className="project-arrow"><Icon name="arrow" /></Link></div>
    <p className="project-description">{project.description}</p>
    <div className="project-bottom"><ul className="tech-list" aria-label="Technologies">{project.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul><a href={project.github} target="_blank" rel="noreferrer" className="source-link" aria-label={`${project.title} source on GitHub (opens in a new tab)`}><Icon name="github" /></a></div>
  </article>;
}
