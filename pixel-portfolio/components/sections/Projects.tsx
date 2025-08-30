'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionHeader, Button, Card } from '@/components/ui';
import { ActionIcon } from '@/components/ui/Icon';
import { IProject } from '@/data/types';

/**
 * Props for the Projects component
 */
interface IProjectsProps {
  /** Array of projects to display */
  projects?: IProject[];
  /** Maximum number of projects to show initially */
  maxVisible?: number;
  /** Whether to show filter buttons */
  showFilters?: boolean;
  /** Whether to show featured projects first */
  featuredFirst?: boolean;
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Projects section component displaying project portfolio
 * Features filtering, responsive grid, and project cards
 */
export const Projects: React.FC<IProjectsProps> = ({
  projects = [],
  maxVisible = 6,
  showFilters = true,
  featuredFirst = true,
  title = "PROJECTS",
  subtitle = "Featured work and personal projects",
  className = ''
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(maxVisible);

  // Sort projects - featured first if enabled
  const sortedProjects = featuredFirst 
    ? [...projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    : projects;

  // Get unique technologies for filtering
  const allTechnologies = Array.from(
    new Set(projects.flatMap(project => project.technologies))
  ).sort();

  // Filter projects based on selected technology
  const filteredProjects = selectedFilter === 'all' 
    ? sortedProjects
    : sortedProjects.filter(project => 
        project.technologies.includes(selectedFilter)
      );

  // Get visible projects
  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMoreProjects = filteredProjects.length > visibleCount;

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setVisibleCount(maxVisible); // Reset visible count when filtering
  };

  // Handle load more
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + maxVisible);
  };

  // Base section classes
  const sectionClasses = [
    'py-20',
    'px-4',
    className
  ].join(' ');

  // Filter button classes
  const getFilterButtonClasses = (isActive: boolean) => [
    'font-pixel',
    'text-xs',
    'px-3',
    'py-2',
    'border-2',
    'transition-colors',
    'duration-200',
    isActive ? 'bg-pixel-primary text-pixel-dark border-pixel-primary' : 'bg-transparent text-pixel-light border-pixel-primary',
    isActive ? '' : 'hover:bg-pixel-primary hover:text-pixel-dark'
  ].join(' ');

  // Project card classes
  const projectCardClasses = [
    'group',
    'bg-pixel-dark',
    'border-2',
    'border-pixel-primary',
    'overflow-hidden',
    'transition-all',
    'duration-300',
    'hover:shadow-xl',
    'hover:shadow-pixel-primary/30',
    'hover:-translate-y-2'
  ].join(' ');

  return (
    <section className={sectionClasses}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <SectionHeader
          title={title}
          subtitle={subtitle}
          centered
          animated
        />

        {/* Filter Buttons */}
        {showFilters && allTechnologies.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={getFilterButtonClasses(selectedFilter === 'all')}
              >
                ALL ({projects.length})
              </button>
              {allTechnologies.slice(0, 8).map((tech) => {
                const count = projects.filter(p => p.technologies.includes(tech)).length;
                return (
                  <button
                    key={tech}
                    onClick={() => handleFilterChange(tech)}
                    className={getFilterButtonClasses(selectedFilter === tech)}
                  >
                    {tech.toUpperCase()} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {visibleProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {visibleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                className={projectCardClasses}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="font-pixel text-pixel-light/60 text-sm">
              No projects found for the selected filter.
            </p>
          </div>
        )}

        {/* Load More Button */}
        {hasMoreProjects && (
          <div className="text-center">
            <Button
              variant="outline"
              size="large"
              onClick={handleLoadMore}
            >
              LOAD MORE PROJECTS ({filteredProjects.length - visibleCount} remaining)
            </Button>
          </div>
        )}

        {/* View All Projects Link */}
        <div className="text-center mt-8">
          <Link
            href="/projects"
            className="font-pixel text-pixel-secondary text-sm hover:text-pixel-primary transition-colors duration-200 underline underline-offset-4 inline-flex items-center"
          >
            VIEW ALL PROJECTS
            <ActionIcon action="external" size={14} className="ml-1" decorative />
          </Link>
        </div>
      </div>
    </section>
  );
};

/**
 * Individual Project Card Component
 */
interface IProjectCardProps {
  project: IProject;
  className?: string;
}

const ProjectCard: React.FC<IProjectCardProps> = ({ project, className = '' }) => {
  const [imageError, setImageError] = useState(false);

  // Card content classes
  const contentClasses = [
    'p-6',
    'space-y-4'
  ].join(' ');

  // Title classes
  const titleClasses = [
    'font-pixel',
    'text-pixel-primary',
    'text-sm',
    'group-hover:text-pixel-secondary',
    'transition-colors',
    'duration-200'
  ].join(' ');

  // Description classes
  const descriptionClasses = [
    'font-pixel',
    'text-pixel-light',
    'text-xs',
    'leading-relaxed',
    'line-clamp-3'
  ].join(' ');

  // Tech stack classes
  const techStackClasses = [
    'flex',
    'flex-wrap',
    'gap-1'
  ].join(' ');

  // Tech tag classes
  const techTagClasses = [
    'font-pixel',
    'text-xs',
    'bg-pixel-primary/20',
    'text-pixel-primary',
    'px-2',
    'py-1',
    'border',
    'border-pixel-primary/50'
  ].join(' ');

  // Action buttons classes
  const actionButtonsClasses = [
    'flex',
    'gap-2',
    'pt-2'
  ].join(' ');

  return (
    <Card className={className}>
      {/* Project Image */}
      <div className="relative h-48 bg-pixel-primary/10 border-b-2 border-pixel-primary/30 overflow-hidden">
        {project.imageUrl && !imageError ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-2 text-pixel-primary/60">
                <ActionIcon action="website" size={32} decorative />
              </div>
              <p className="font-pixel text-pixel-primary/60 text-xs">
                PROJECT IMAGE
              </p>
            </div>
          </div>
        )}
        
        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-2 right-2 bg-pixel-accent text-pixel-light font-pixel text-xs px-2 py-1 border border-pixel-accent">
            FEATURED
          </div>
        )}
      </div>

      {/* Project Content */}
      <div className={contentClasses}>
        {/* Title */}
        <h3 className={titleClasses}>
          {project.title}
        </h3>

        {/* Description */}
        <p className={descriptionClasses}>
          {project.description}
        </p>

        {/* Technology Stack */}
        <div className={techStackClasses}>
          {project.technologies.slice(0, 4).map((tech, index) => (
            <span key={index} className={techTagClasses}>
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="font-pixel text-xs text-pixel-primary/60">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>

        {/* Completion Date */}
        {project.completedDate && (
          <p className="font-pixel text-pixel-light/60 text-xs">
            Completed: {project.completedDate}
          </p>
        )}

        {/* Action Buttons */}
        <div className={actionButtonsClasses}>
          {project.demoUrl && (
            <Button
              variant="primary"
              size="small"
              onClick={() => window.open(project.demoUrl, '_blank')}
            >
              DEMO
            </Button>
          )}
          {project.githubUrl && (
            <Button
              variant="outline"
              size="small"
              onClick={() => window.open(project.githubUrl, '_blank')}
            >
              CODE
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// Export default for convenience
export default Projects;

// Export specialized project section variants
export const FeaturedProjects: React.FC<Omit<IProjectsProps, 'featuredFirst' | 'maxVisible'>> = (props) => (
  <Projects featuredFirst={true} maxVisible={3} {...props} />
);

export const AllProjects: React.FC<Omit<IProjectsProps, 'maxVisible' | 'showFilters'>> = (props) => (
  <Projects maxVisible={12} showFilters={true} {...props} />
);

export const MinimalProjects: React.FC<Omit<IProjectsProps, 'showFilters' | 'maxVisible'>> = (props) => (
  <Projects showFilters={false} maxVisible={4} {...props} />
);