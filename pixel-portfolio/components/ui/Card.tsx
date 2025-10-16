import React from 'react';
import { ICardProps } from '@/data/types';

/**
 * Pixel art styled card component for content display
 * Supports titles, hover effects, and click interactions
 */
export const Card: React.FC<ICardProps> = ({
  title,
  children,
  onClick,
  hoverable = false,
  className = '',
  style,
  testId,
  ...props
}) => {
  // Base card classes
  const baseClasses = [
    'bg-pixel-dark',
    'border-2',
    'border-pixel-primary',
    'p-4',
    'font-pixel',
    'transition-all',
    'duration-200',
    // Pixel art rendering
    'image-rendering-pixelated',
    'image-rendering-crisp-edges'
  ].join(' ');

  // Interactive classes for hoverable/clickable cards
  const interactiveClasses = (hoverable || onClick) ? [
    'hover:shadow-lg',
    'hover:shadow-pixel-primary/20',
    'hover:border-pixel-secondary',
    'hover:transform',
    'hover:scale-[1.02]',
    'active:scale-[0.98]',
    'transition-transform',
    'cursor-pointer'
  ].join(' ') : '';

  // Focus classes for accessibility when clickable
  const focusClasses = onClick ? [
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-pixel-accent',
    'focus:ring-offset-2',
    'focus:ring-offset-pixel-dark'
  ].join(' ') : '';

  // Combine all classes
  const cardClasses = [
    baseClasses,
    interactiveClasses,
    focusClasses,
    className
  ].join(' ');

  // Handle click events
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick();
    }
  };

  // Determine the appropriate HTML element
  const CardElement = onClick ? 'div' : 'div';
  
  // Props for interactive cards
  const interactiveProps = onClick ? {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    tabIndex: 0,
    role: 'button',
    'aria-pressed': false
  } : {};

  return (
    <CardElement
      className={cardClasses}
      style={style}
      data-testid={testId}
      {...interactiveProps}
      {...props}
    >
      
      {title && (
        <div className="mb-4 pb-2 border-b border-pixel-primary/30">
          <h3 className="text-pixel-primary text-sm font-pixel leading-tight">
            {title}
          </h3>
        </div>
      )}
      
      <div className="text-pixel-light">
        {children}
      </div>
    </CardElement>
  );
};

/**
 * Specialized card variants for common use cases
 */

/**
 * Project card variant with specific styling for project displays
 */
export const ProjectCard: React.FC<ICardProps & { 
  imageUrl?: string; 
  technologies?: string[];
  featured?: boolean;
}> = ({ 
  imageUrl, 
  technologies = [], 
  featured = false,
  children,
  className = '',
  ...props 
}) => {
  const featuredClasses = featured ? 'border-pixel-secondary shadow-lg shadow-pixel-secondary/20' : '';
  
  return (
    <Card 
      className={`${featuredClasses} ${className}`}
      hoverable
      {...props}
    >
      {imageUrl && (
        <div className="mb-4 h-32 bg-pixel-dark/50 border border-pixel-primary/30 flex items-center justify-center">
          <span className="text-pixel-primary/60 text-xs">IMAGE PLACEHOLDER</span>
        </div>
      )}
      
      <div className="space-y-3">
        {children}
        
        {technologies.length > 0 && (
          <div className="pt-2 border-t border-pixel-primary/30">
            <div className="flex flex-wrap gap-1">
              {technologies.slice(0, 3).map((tech, index) => (
                <span 
                  key={index}
                  className="text-xs bg-pixel-primary/20 text-pixel-primary px-2 py-1 border border-pixel-primary/50"
                >
                  {tech}
                </span>
              ))}
              {technologies.length > 3 && (
                <span className="text-xs text-pixel-primary/60">
                  +{technologies.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Skill card variant for displaying skills with proficiency
 */
export const SkillCard: React.FC<ICardProps & { 
  proficiency?: number;
  category?: string;
  iconUrl?: string;
}> = ({ 
  proficiency = 0, 
  category,
  iconUrl,
  children,
  className = '',
  ...props 
}) => {
  return (
    <Card 
      className={`text-center ${className}`}
      hoverable
      {...props}
    >
      {iconUrl && (
        <div className="mb-3 h-12 flex items-center justify-center">
          <span className="text-pixel-primary/60 text-xs">ICON</span>
        </div>
      )}
      
      <div className="space-y-2">
        {children}
        
        {proficiency > 0 && (
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 ${
                  i < proficiency ? 'bg-pixel-primary' : 'bg-pixel-primary/20'
                }`}
              />
            ))}
          </div>
        )}
        
        {category && (
          <p className="text-xs text-pixel-primary/60 uppercase">
            {category}
          </p>
        )}
      </div>
    </Card>
  );
};

// Export default for convenience
export default Card;