/**
 * Core data interfaces for the Pixel Portfolio application
 * These interfaces define the structure for portfolio content and ensure type safety
 */

/**
 * Represents a project in the portfolio
 */
export interface IProject {
  /** Unique identifier for the project */
  id: string;
  /** Display title of the project */
  title: string;
  /** Detailed description of the project */
  description: string;
  /** Array of technologies/frameworks used in the project */
  technologies: string[];
  /** URL path to the project's main image/screenshot */
  imageUrl: string;
  /** Optional URL to the live demo/deployed version */
  demoUrl?: string;
  /** Optional URL to the project's GitHub repository */
  githubUrl?: string;
  /** Whether this project should be featured prominently */
  featured: boolean;
  /** Optional date when the project was completed */
  completedDate?: string;
  /** Optional array of additional image URLs for project gallery */
  galleryImages?: string[];
}

/**
 * Represents a skill or technology proficiency
 */
export interface ISkill {
  /** Unique identifier for the skill */
  id: string;
  /** Display name of the skill/technology */
  name: string;
  /** Category classification for grouping skills */
  category: 'frontend' | 'backend' | 'tools' | 'design' | 'database' | 'cloud';
  /** Proficiency level from 1 (beginner) to 5 (expert) */
  proficiency: 1 | 2 | 3 | 4 | 5;
  /** Optional URL to an icon representing the skill */
  iconUrl?: string;
  /** Optional description or notes about the skill */
  description?: string;
  /** Optional years of experience with this skill */
  yearsOfExperience?: number;
}

/**
 * Represents a navigation menu item
 */
export interface INavItem {
  /** Display text for the navigation item */
  label: string;
  /** URL or anchor href for the navigation item */
  href: string;
  /** Whether the link opens in a new tab/window */
  external?: boolean;
  /** Optional icon identifier for the navigation item */
  icon?: string;
}

/**
 * Represents social media or contact links
 */
export interface ISocialLink {
  /** Unique identifier for the social platform */
  id: string;
  /** Display name of the platform */
  platform: string;
  /** URL to the social profile */
  url: string;
  /** Icon identifier for the platform */
  icon: 'github' | 'linkedin' | 'twitter' | 'instagram' | 'email' | 'website';
  /** Optional display username */
  username?: string;
}

/**
 * Represents personal/professional information
 */
export interface IPersonalInfo {
  /** Full name */
  name: string;
  /** Professional title or role */
  title: string;
  /** Brief bio or description */
  bio: string;
  /** Contact email address */
  email: string;
  /** Optional phone number */
  phone?: string;
  /** Optional location/city */
  location?: string;
  /** URL to profile/avatar image */
  avatarUrl?: string;
  /** Optional resume/CV download URL */
  resumeUrl?: string;
}

/**
 * Utility type for component props that accept children
 */
export interface IWithChildren {
  children: React.ReactNode;
}

/**
 * Common props for UI components
 */
export interface IBaseComponentProps {
  /** Optional CSS class names */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Optional test ID for testing */
  testId?: string;
}

/**
 * Props for button components
 */
export interface IButtonProps extends IBaseComponentProps {
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler function */
  onClick?: () => void;
  /** Button type for forms */
  type?: 'button' | 'submit' | 'reset';
  /** Button content */
  children: React.ReactNode;
}

/**
 * Props for card components
 */
export interface ICardProps extends IBaseComponentProps {
  /** Card title */
  title?: string;
  /** Card content */
  children: React.ReactNode;
  /** Optional click handler for interactive cards */
  onClick?: () => void;
  /** Whether the card should have hover effects */
  hoverable?: boolean;
}