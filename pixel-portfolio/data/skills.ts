import { ISkill } from './types';

/**
 * Joshua Mathers' skills and experience
 * Reflects actual experience levels and years of practice
 */
export const skills: ISkill[] = [
  // Frontend Skills
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    proficiency: 4,
    iconUrl: '/icons/skills/react.svg',
    description: 'Building modern web applications with React hooks and component architecture',
    yearsOfExperience: 1
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'frontend',
    proficiency: 4,
    iconUrl: '/icons/skills/nextjs.svg',
    description: 'Full-stack React framework with SSR, SSG, and API routes',
    yearsOfExperience: 1
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'frontend',
    proficiency: 4,
    iconUrl: '/icons/skills/typescript.svg',
    description: 'Type-safe JavaScript development for better code quality and maintainability',
    yearsOfExperience: 1
  },
  {
    id: 'html5',
    name: 'HTML5',
    category: 'frontend',
    proficiency: 4,
    iconUrl: '/icons/skills/default.svg',
    description: 'Semantic markup, accessibility, and modern web standards',
    yearsOfExperience: 4
  },
  {
    id: 'css3',
    name: 'CSS3',
    category: 'frontend',
    proficiency: 4,
    iconUrl: '/icons/skills/default.svg',
    description: 'Advanced styling, animations, and responsive design',
    yearsOfExperience: 4
  },
  {
    id: 'tailwindcss',
    name: 'Tailwind CSS',
    category: 'frontend',
    proficiency: 4,
    iconUrl: '/icons/skills/default.svg',
    description: 'Utility-first CSS framework for rapid UI development',
    yearsOfExperience: 1
  },

  // Backend Skills
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    proficiency: 4,
    iconUrl: '/icons/skills/nodejs.svg',
    description: 'Server-side JavaScript development and API creation',
    yearsOfExperience: 2
  },
  {
    id: 'python',
    name: 'Python',
    category: 'backend',
    proficiency: 4,
    iconUrl: '/icons/skills/python.svg',
    description: 'Backend development, scripting, and data processing with extensive experience',
    yearsOfExperience: 5
  },

  // Tools & Version Control
  {
    id: 'git',
    name: 'Git',
    category: 'tools',
    proficiency: 4,
    iconUrl: '/icons/skills/default.svg',
    description: 'Version control, branching strategies, and collaborative development workflows',
    yearsOfExperience: 3
  }
];

/**
 * Get all skills
 */
export const getAllSkills = (): ISkill[] => {
  return skills;
};

/**
 * Get skills by category
 */
export const getSkillsByCategory = (category: ISkill['category']): ISkill[] => {
  return skills.filter(skill => skill.category === category);
};

/**
 * Get skills by proficiency level
 */
export const getSkillsByProficiency = (minProficiency: number): ISkill[] => {
  return skills.filter(skill => skill.proficiency >= minProficiency);
};

/**
 * Get top skills (proficiency 4 or 5)
 */
export const getTopSkills = (): ISkill[] => {
  return skills.filter(skill => skill.proficiency >= 4);
};

/**
 * Get skills grouped by category
 */
export const getSkillsGroupedByCategory = (): Record<ISkill['category'], ISkill[]> => {
  return skills.reduce((groups, skill) => {
    if (!groups[skill.category]) {
      groups[skill.category] = [];
    }
    groups[skill.category].push(skill);
    return groups;
  }, {} as Record<ISkill['category'], ISkill[]>);
};

/**
 * Get skill categories with counts
 */
export const getSkillCategoriesWithCounts = (): Array<{category: ISkill['category'], count: number}> => {
  const categories = skills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {} as Record<ISkill['category'], number>);

  return Object.entries(categories).map(([category, count]) => ({
    category: category as ISkill['category'],
    count
  }));
};