'use client';

import { getAllSkills } from '@/data';
import { SkillsByCategory } from '@/components/sections';
import { PageHeader } from '@/components/ui';

export default function SkillsPage() {
  const skills = getAllSkills();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title="SKILLS & EXPERTISE"
          subtitle="A detailed breakdown of my technical skills, tools, and technologies across different domains"
        />

        {/* Skills Section */}
        <div className="mt-16">
          <SkillsByCategory
            skills={skills}
            animated={true}
            showDescriptions={true}
            groupByCategory={true}
          />
        </div>

        {/* Skills Summary */}
        <div className="mt-20 text-center">
          <div className="bg-pixel-dark border-2 border-pixel-primary p-8">
            <h3 className="font-pixel text-pixel-primary text-lg mb-6">
              CONTINUOUS LEARNING
            </h3>
            <p className="font-pixel text-pixel-light text-sm leading-relaxed max-w-2xl mx-auto">
              Technology evolves rapidly, and I&apos;m committed to staying current with the latest
              developments. I regularly explore new frameworks, tools, and best practices to
              deliver cutting-edge solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}