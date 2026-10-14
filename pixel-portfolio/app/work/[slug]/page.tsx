import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { projects } from "@/data/projects";

export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(project => project.slug === slug);
  return project ? { title: project.title, description: project.description } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(project => project.slug === slug);
  if (!project) notFound();
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  return <main id="main" className="container project-page">
    <Link href="/#work" className="text-link back-link"><Icon name="back" /> Back to selected work</Link>
    <div className="case-heading"><div className="eyebrow">{project.number} / {project.category}</div><h1>{project.title}<span>.</span></h1><p>{project.intro}</p></div>
    <div className="case-facts"><div><span className="eyebrow">BUILT WITH</span><ul className="tech-list">{project.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul></div><div><span className="eyebrow">STATUS</span><span>{project.status}</span></div><div className="case-links">{project.website && <a href={project.website} target="_blank" rel="noreferrer" className="text-link">{project.websiteLabel} <Icon name="arrow" /></a>}<a href={project.github} target="_blank" rel="noreferrer" className="text-link"><Icon name="github" /> View source <Icon name="arrow" /></a></div></div>
    {project.image ? <div className={`case-image ${project.slug}`}><Image src={project.image} alt={project.imageAlt!} width={1280} height={720} sizes="(max-width: 1150px) 92vw, 1100px" loading="eager" /></div> : <div className="case-achievement"><span className="eyebrow">DATABASE PRINCIPLES / GROUP COURSEWORK</span><strong>90<span>%</span></strong><p>Highest mark in the year.<br /><span>A shared achievement.</span></p></div>}
    <div className="case-sections">{project.sections.map((section, index) => <section key={section.heading}><span className="eyebrow">0{index + 1}</span><h2>{section.heading}</h2><p>{section.body}</p></section>)}</div>
    {project.slug === "database-principles" && <a className="text-link erd-link" href="https://github.com/InterMaus1154/dbprin_25_cw/blob/main/group04_erd.png" target="_blank" rel="noreferrer">Explore the complete entity–relationship diagram <Icon name="arrow" /></a>}
    <Link href={`/work/${next.slug}`} className="next-project"><span><span className="eyebrow">NEXT PROJECT</span><span>{next.title}</span></span><Icon name="arrow" /></Link>
  </main>;
}
