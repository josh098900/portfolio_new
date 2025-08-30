/**
 * UI Components exports
 * Centralized export point for all UI components
 */

// Button components
export { Button } from './Button';
export { default as ButtonDefault } from './Button';

// Card components
export { Card, ProjectCard, SkillCard } from './Card';
export { default as CardDefault } from './Card';

// Header components
export { 
  SectionHeader, 
  PageHeader, 
  SectionTitle, 
  SubsectionHeader, 
  CardHeader 
} from './SectionHeader';
export { default as SectionHeaderDefault } from './SectionHeader';

// Re-export types for convenience
export type { IButtonProps, ICardProps, IBaseComponentProps } from '@/data/types';