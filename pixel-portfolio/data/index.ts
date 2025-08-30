/**
 * Data layer exports
 * This file provides a centralized export point for all data-related modules
 */

// Export all types and interfaces
export * from './types';

// Export data modules
export * from './projects';
export * from './skills';
export * from './navigation';

// Re-export specific interfaces for convenience
export type {
  IProject,
  ISkill,
  INavItem,
  ISocialLink,
  IPersonalInfo,
  IButtonProps,
  ICardProps,
  IBaseComponentProps,
  IWithChildren
} from './types';