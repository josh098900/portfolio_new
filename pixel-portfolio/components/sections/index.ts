/**
 * Section Components exports
 * Centralized export point for all section components
 */

// Hero components
export {
  Hero,
  MinimalHero,
  AnimatedHero,
  StaticHero
} from './Hero';

// Projects components
export {
  Projects,
  FeaturedProjects,
  AllProjects,
  MinimalProjects
} from './Projects';

// Skills components
export {
  Skills,
  TopSkills,
  SkillsByCategory,
  MinimalSkills
} from './Skills';

// Re-export default components
export { default as HeroDefault } from './Hero';
export { default as ProjectsDefault } from './Projects';
export { default as SkillsDefault } from './Skills';