import React from 'react';
import { IBaseComponentProps } from '@/data/types';

/**
 * Props for the SectionHeader component
 */
interface ISectionHeaderProps extends IBaseComponentProps {
  /** The main heading text */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Heading level for semantic HTML (h1, h2, h3, etc.) */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Visual size variant independent of semantic level */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  /** Color variant for the title */
  variant?: 'primary' | 'secondary' | 'accent' | 'light';
  /** Whether to center align the header */
  centered?: boolean;
  /** Whether to include decorative elements */
  decorated?: boolean;
  /** Optional icon or emoji to display before the title */
  icon?: string;
  /** Whether to animate the header on load */
  animated?: boolean;
}

/**
 * Pixel art styled section header component
 * Provides consistent styling for section titles throughout the application
 */
export const SectionHeader: React.FC<ISectionHeaderProps> = ({
  title,
  subtitle,
  level = 2,
  size = 'medium',
  variant = 'primary',
  centered = false,
  decorated = true,
  icon,
  animated = false,
  className = '',
  style,
  testId,
  ...props
}) => {
  // Base header classes
  const baseClasses = [
    'font-pixel',
    'select-none',
    // Pixel art rendering
    'image-rendering-pixelated',
    'image-rendering-crisp-edges'
  ].join(' ');

  // Size-specific classes for the title
  const sizeClasses = {
    small: 'text-lg md:text-xl',
    medium: 'text-xl md:text-2xl',
    large: 'text-2xl md:text-4xl',
    xlarge: 'text-4xl md:text-6xl'
  };

  // Color variant classes
  const variantClasses = {
    primary: 'text-pixel-primary',
    secondary: 'text-pixel-secondary',
    accent: 'text-pixel-accent',
    light: 'text-pixel-light'
  };

  // Animation classes
  const animationClasses = animated ? [
    'animate-pixel-pulse',
    'pixel-text-glow'
  ].join(' ') : '';

  // Alignment classes
  const alignmentClasses = centered ? 'text-center' : 'text-left';

  // Container classes
  const containerClasses = [
    baseClasses,
    alignmentClasses,
    className
  ].join(' ');

  // Title classes
  const titleClasses = [
    sizeClasses[size],
    variantClasses[variant],
    animationClasses,
    'leading-tight',
    'tracking-wide'
  ].join(' ');

  // Subtitle classes
  const subtitleClasses = [
    'text-sm',
    'md:text-base',
    'text-pixel-light/80',
    'mt-2',
    'leading-relaxed'
  ].join(' ');

  // Create the appropriate heading element
  const HeadingElement = `h${level}` as keyof React.JSX.IntrinsicElements;

  // Decorative border component
  const DecorativeBorder = () => (
    <div className={`flex items-center gap-2 ${centered ? 'justify-center' : 'justify-start'} mt-3`}>
      <div className="flex gap-1">
        {Array.from({ length: 8 }, (_, i) => (
          <div 
            key={i}
            className={`w-1 h-1 ${variantClasses[variant]} animate-pulse`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <header 
      className={containerClasses}
      style={style}
      data-testid={testId}
      {...props}
    >
      <div className="space-y-1">
        <HeadingElement className={titleClasses}>
          {icon && (
            <span className="mr-3 inline-block">
              {icon}
            </span>
          )}
          {title}
        </HeadingElement>
        
        {subtitle && (
          <p className={subtitleClasses}>
            {subtitle}
          </p>
        )}
        
        {decorated && <DecorativeBorder />}
      </div>
    </header>
  );
};

/**
 * Specialized section header variants for common use cases
 */

/**
 * Page title header - large, centered, animated
 */
export const PageHeader: React.FC<Omit<ISectionHeaderProps, 'level' | 'size' | 'centered' | 'animated'>> = (props) => (
  <SectionHeader
    level={1}
    size="xlarge"
    centered
    animated
    {...props}
  />
);

/**
 * Section title header - medium size, decorated
 */
export const SectionTitle: React.FC<Omit<ISectionHeaderProps, 'level' | 'size'>> = (props) => (
  <SectionHeader
    level={2}
    size="large"
    {...props}
  />
);

/**
 * Subsection header - smaller, minimal decoration
 */
export const SubsectionHeader: React.FC<Omit<ISectionHeaderProps, 'level' | 'size' | 'decorated'>> = (props) => (
  <SectionHeader
    level={3}
    size="medium"
    decorated={false}
    {...props}
  />
);

/**
 * Card header - small, no decoration
 */
export const CardHeader: React.FC<Omit<ISectionHeaderProps, 'level' | 'size' | 'decorated'>> = (props) => (
  <SectionHeader
    level={4}
    size="small"
    decorated={false}
    {...props}
  />
);

// Export default for convenience
export default SectionHeader;