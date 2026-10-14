import Link from "next/link";
import { Icon } from "@/components/icons";
import { CurioArt } from "@/components/curio-art";
import { ProjectCard } from "@/components/project-card";
import { projects } from "@/data/projects";

export default function Home() {
  const database = projects[2];
  return <main id="main" className="container">
    <section className="hero" aria-labelledby="intro-heading">
      <div className="eyebrow intro-label"><span className="status-dot" /> THIRD-YEAR SOFTWARE ENGINEERING STUDENT</div>
      <h1 id="intro-heading">A curious mind.<br />A builder <em>at heart.</em></h1>
      <div className="hero-bottom">
        <div><p className="hero-description">I’m Josh. I make things for the web, turn ideas into working software, and learn something with every build.</p><a href="#work" className="text-link hero-link">Explore my work <Icon name="down" /></a></div>
        <a className="currently" href="#now"><span className="currently-icon"><Icon name="compass" /></span><span><span className="currently-label">ON MY DESK RIGHT NOW</span><span className="currently-title">Curio <span>— for the solo traveller</span></span></span><Icon name="arrow" /></a>
      </div>
    </section>

    <section className="work-section" id="work" aria-labelledby="work-heading">
      <div className="section-heading"><h2 id="work-heading">Selected work<span className="section-count">03</span></h2><span className="section-aside">Built with curiosity. Refined through practice.</span></div>
      <div className="project-grid">{projects.slice(0, 2).map(project => <ProjectCard key={project.slug} project={project} />)}</div>
      <article className="database-project">
        <Link className="database-art" href={`/work/${database.slug}`} aria-label="Read about Database Principles">
          <div className="schema-heading">RELATIONSHIPS, BY DESIGN</div>
          <div className="schema-diagram" aria-hidden="true"><div className="schema-table"><strong><span>▦</span> customers</strong><span><b>PK</b> cust_id</span><span>cust_fname</span><span>cust_email</span></div><div className="schema-connection"><span>1</span><i /><span>n</span></div><div className="schema-table"><strong><span>▦</span> vehicles</strong><span><b>PK</b> vec_id</span><span><b>FK</b> cust_id</span><span>vec_model</span></div></div>
          <span className="schema-caption">A small part of a connected system.</span>
        </Link>
        <div className="database-content"><div className="project-meta"><span>03 / Group coursework</span></div><h3><Link href={`/work/${database.slug}`}>{database.title}</Link></h3><p className="project-description">I helped design the ERD, build the database, and write complex SQL queries for a vehicle service business.</p><div className="achievement"><strong>90<span>%</span></strong><span>Highest mark in the year<span>Achieved together, as a team.</span></span></div><div className="database-bottom"><ul className="tech-list" aria-label="Technologies">{database.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul><Link href={`/work/${database.slug}`} className="text-link">View project <Icon name="arrow" /></Link></div></div>
      </article>
    </section>

    <section id="now" className="now-section" aria-labelledby="now-heading">
      <div className="section-heading"><h2 id="now-heading">Currently building</h2><span className="eyebrow section-aside">A NEW CHAPTER</span></div>
      <div className="curio-panel"><div className="curio-copy"><span className="in-progress"><span className="status-dot" /> IN PROGRESS · FINAL-YEAR PROJECT</span><h3>A world to explore.<br /><em>Your own way.</em></h3><p>Meet Curio, my final-year project: a web and iOS app for solo travellers. It’s where I’m putting what I’ve learned into something new.</p><div className="curio-bottom"><span>Curio</span><div><span>Web</span><span>iOS</span></div></div></div><CurioArt /></div>
    </section>

    <section id="about" className="about-section" aria-labelledby="about-heading">
      <div className="about-label"><span className="eyebrow">A LITTLE ABOUT ME</span><h2 id="about-heading">Still learning.<br /><em>Always building.</em></h2></div>
      <div className="about-copy"><p>I’m Josh, a third-year software engineering student. My work spans web applications, multiplayer worlds, and relational databases.</p><p>I like being involved in the whole process: figuring out how the pieces fit together, building them, and making the result feel good to use. Right now, I’m bringing that approach to Curio, my final-year project for solo travellers.</p><a className="text-link about-github" href="https://github.com/josh098900" target="_blank" rel="noreferrer"><Icon name="github" /> More of what I’m making <Icon name="arrow" /></a></div>
    </section>
  </main>;
}
