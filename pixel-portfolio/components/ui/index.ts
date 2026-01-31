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

// Progress components
export { ScrollProgress } from './ScrollProgress';

// Counter components
export { VisitorCounter } from './VisitorCounter';

// Game components
export { PongGame } from './PongGame';
export { ArcadeButton } from './ArcadeButton';

// Welcome screen components
export { WelcomeScreen } from './WelcomeScreen';
export { WelcomeContent, SimpleWelcomeContent } from './WelcomeContent';

// Audio components
export { AudioModal } from './AudioModal';

// Chat components
export { ChatBot } from './ChatBot';

// Re-export types for convenience
export type { IButtonProps, ICardProps, IBaseComponentProps } from '@/data/types';