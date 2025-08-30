'use client';

import { getAllProjects } from '@/data';
import { AllProjects } from '@/components/sections';
import { PageHeader } from '@/components/ui';

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title="PROJECTS"
          subtitle="A comprehensive showcase of my development work, from pixel art games to modern web applications"
        />

        {/* All Projects Section */}
        <div className="mt-16">
          <AllProjects
            projects={projects}
            featuredFirst={true}
          />
        </div>
      </div>
    </div>
  );
}