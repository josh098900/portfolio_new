'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SectionHeader, Card } from '@/components/ui';
import { ISkill } from '@/data/types';

/**
 * Props for the Skills component
 */
interface ISkillsProps {
  /** Array of skills to display */
  skills?: ISkill[];
  /** Whether to group skills by category */
  groupByCategory?: boolean;
  /** Whether to show proficiency animations */
  animated?: boolean;
  /** Whether to show skill descriptions */
  showDescriptions?: boolean;
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skills section component displaying technical skills and proficiencies
 * Features categorized display, proficiency indicators, and animations
 */
export const Skills: React.FC<ISkillsProps> = ({
  skills = [],
  groupByCategory = true,
  animated = true,
  showDescriptions = false,
  title = "SKILLS",
  subtitle = "Technologies and expertise",
  className = ''
}) => {
  const [visibleSkills, setVisibleSkills] = useState<Set<string>>(new Set());

  // Intersection observer for animations
  useEffect(() => {
    if (!animated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const skillId = entry.target.getAttribute('data-skill-id');
            if (skillId) {
              setVisibleSkills(prev => new Set([...prev, skillId]));
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const skillElements = document.querySelectorAll('[data-skill-id]');
    skillElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [animated, skills]);

  // Group skills by category
  const groupedSkills = groupByCategory
    ? skills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category]!.push(skill);
        return acc;
      }, {} as Record<string, ISkill[]>)
    : { all: skills };

  // Sort categories and skills
  const sortedCategories = Object.keys(groupedSkills).sort();
  Object.values(groupedSkills).forEach(categorySkills => {
    categorySkills.sort((a, b) => b.proficiency - a.proficiency);
  });

  // Base section classes
  const sectionClasses = [
    'py-20',
    'px-4',
    className
  ].join(' ');

  // Category title classes
  const categoryTitleClasses = [
    'font-pixel',
    'text-pixel-secondary',
    'text-lg',
    'mb-6',
    'text-center',
    'uppercase',
    'tracking-wider'
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

        {/* Skills by Category */}
        <div className="space-y-16">
          {sortedCategories.map((category) => (
            <div key={category} className="space-y-8">
              {/* Category Title */}
              {groupByCategory && category !== 'all' && (
                <h3 className={categoryTitleClasses}>
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
              )}

              {/* Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedSkills[category]?.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    animated={animated}
                    isVisible={visibleSkills.has(skill.id)}
                    showDescription={showDescriptions}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Skills Summary */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="font-pixel text-2xl text-pixel-primary">
                {skills.length}
              </div>
              <div className="font-pixel text-xs text-pixel-light/60">
                TOTAL SKILLS
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-pixel text-2xl text-pixel-secondary">
                {skills.filter(s => s.proficiency >= 4).length}
              </div>
              <div className="font-pixel text-xs text-pixel-light/60">
                EXPERT LEVEL
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-pixel text-2xl text-pixel-accent">
                {Object.keys(groupedSkills).length}
              </div>
              <div className="font-pixel text-xs text-pixel-light/60">
                CATEGORIES
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-pixel text-2xl text-pixel-primary">
                {Math.round(skills.reduce((sum, s) => sum + (s.yearsOfExperience || 0), 0) / skills.length) || 0}
              </div>
              <div className="font-pixel text-xs text-pixel-light/60">
                AVG YEARS
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Individual Skill Card Component
 */
interface ISkillCardProps {
  skill: ISkill;
  animated?: boolean;
  isVisible?: boolean;
  showDescription?: boolean;
  className?: string;
}

const SkillCard: React.FC<ISkillCardProps> = ({
  skill,
  animated = true,
  isVisible = false,
  showDescription = false,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  // Card classes
  const cardClasses = [
    'group',
    'bg-pixel-dark',
    'border-2',
    'border-pixel-primary',
    'p-6',
    'transition-all',
    'duration-300',
    'hover:shadow-lg',
    'hover:shadow-pixel-primary/30',
    'hover:-translate-y-1',
    'hover:border-pixel-secondary',
    animated && isVisible ? 'animate-fade-in' : '',
    className
  ].join(' ');

  // Skill name classes
  const nameClasses = [
    'font-pixel',
    'text-pixel-primary',
    'text-sm',
    'mb-3',
    'group-hover:text-pixel-secondary',
    'transition-colors',
    'duration-200'
  ].join(' ');

  // Proficiency bar classes
  const proficiencyBarClasses = [
    'w-full',
    'h-2',
    'bg-pixel-primary/20',
    'border',
    'border-pixel-primary/50',
    'mb-3',
    'overflow-hidden'
  ].join(' ');

  // Proficiency fill classes
  const proficiencyFillClasses = [
    'h-full',
    'bg-pixel-primary',
    'transition-all',
    'duration-1000',
    'ease-out'
  ].join(' ');

  // Description classes
  const descriptionClasses = [
    'font-pixel',
    'text-pixel-light/80',
    'text-xs',
    'leading-relaxed',
    'mb-3'
  ].join(' ');

  // Meta info classes
  const metaClasses = [
    'flex',
    'justify-between',
    'items-center',
    'text-xs',
    'font-pixel',
    'text-pixel-light/60'
  ].join(' ');

  return (
    <Card
      className={cardClasses}
      data-skill-id={skill.id}
    >
      {/* Skill Icon */}
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 mr-3 flex-shrink-0">
          {skill.iconUrl && !imageError ? (
            <Image
              src={skill.iconUrl}
              alt={skill.name}
              width={32}
              height={32}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-pixel-primary/20 border border-pixel-primary/50 flex items-center justify-center">
              <span className="font-pixel text-pixel-primary text-xs">
                {skill.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        {/* Skill Name */}
        <h4 className={nameClasses}>
          {skill.name}
        </h4>
      </div>

      {/* Proficiency Bar */}
      <div className={proficiencyBarClasses}>
        <div
          className={proficiencyFillClasses}
          style={{
            width: animated && isVisible ? `${(skill.proficiency / 5) * 100}%` : '0%'
          }}
        />
      </div>

      {/* Proficiency Level */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 border border-pixel-primary ${
                i < skill.proficiency ? 'bg-pixel-primary' : 'bg-transparent'
              } transition-colors duration-300`}
              style={{
                transitionDelay: animated && isVisible ? `${i * 100}ms` : '0ms'
              }}
            />
          ))}
        </div>
        <span className="font-pixel text-pixel-primary text-xs">
          {skill.proficiency}/5
        </span>
      </div>

      {/* Description */}
      {showDescription && skill.description && (
        <p className={descriptionClasses}>
          {skill.description}
        </p>
      )}

      {/* Meta Information */}
      <div className={metaClasses}>
        <span className="capitalize">
          {skill.category}
        </span>
        {skill.yearsOfExperience && (
          <span>
            {skill.yearsOfExperience}y exp
          </span>
        )}
      </div>
    </Card>
  );
};

// Export default for convenience
export default Skills;

// Export specialized skills section variants
export const TopSkills: React.FC<Omit<ISkillsProps, 'groupByCategory'>> = (props) => {
  // Filter to show only top skills (proficiency 4+)
  const topSkills = props.skills?.filter(skill => skill.proficiency >= 4) || [];
  
  return (
    <Skills
      {...props}
      skills={topSkills}
      groupByCategory={false}
      title="TOP SKILLS"
      subtitle="My strongest technical competencies"
    />
  );
};

export const SkillsByCategory: React.FC<ISkillsProps> = (props) => (
  <Skills groupByCategory={true} {...props} />
);

export const MinimalSkills: React.FC<Omit<ISkillsProps, 'showDescriptions' | 'animated'>> = (props) => (
  <Skills showDescriptions={false} animated={false} {...props} />
);