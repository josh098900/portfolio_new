
'use client';

import { getFeaturedProjects, getTopSkills, getPersonalInfo } from '@/data';
import { Hero, FeaturedProjects, TopSkills } from '@/components/sections';

export default function Home() {
  // Get data for sections
  const featuredProjects = getFeaturedProjects();
  const topSkills = getTopSkills();
  const personalInfo = getPersonalInfo();

  return (
    <div id="main-content">
      {/* Hero Section */}
      <Hero
        personalInfo={personalInfo}
        animated={true}
        showCTA={true}
        backgroundPattern="dots"
      />
      
      {/* Featured Projects Section */}
      <FeaturedProjects
        projects={featuredProjects}
        title="FEATURED PROJECTS"
        subtitle="Showcasing my best work and recent developments"
      />
      
      {/* Top Skills Section */}
      <TopSkills
        skills={topSkills}
        title="CORE SKILLS"
        subtitle="Technologies I excel at and use regularly"
        animated={true}
        showDescriptions={false}
      />
    </div>
  );
}
