import React from 'react';
import { IButtonProps } from '@/data/types';

/**
 * Pixel art styled button component with multiple variants
 * Supports different sizes, variants, and accessibility features
 */
export const Button: React.FC<IButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  children,
  className = '',
  style,
  testId,
  ...props
}) => {
  // Base button classes
  const baseClasses = [
    'font-pixel',
    'border-2',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-pixel-accent',
    'focus:ring-offset-2',
    'focus:ring-offset-pixel-dark',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:hover:transform-none',
    'active:transform',
    'active:scale-95',
    'select-none',
    // Pixel art rendering
    'image-rendering-pixelated',
    'image-rendering-crisp-edges'
  ].join(' ');

  // Variant-specific classes
  const variantClasses = {
    primary: [
      'bg-pixel-primary',
      'text-pixel-dark',
      'border-pixel-primary',
      'hover:bg-pixel-dark',
      'hover:text-pixel-primary',
      'hover:shadow-lg',
      'hover:shadow-pixel-primary/30'
    ].join(' '),
    
    secondary: [
      'bg-pixel-secondary',
      'text-pixel-dark',
      'border-pixel-secondary',
      'hover:bg-pixel-dark',
      'hover:text-pixel-secondary',
      'hover:shadow-lg',
      'hover:shadow-pixel-secondary/30'
    ].join(' '),
    
    accent: [
      'bg-pixel-accent',
      'text-pixel-light',
      'border-pixel-accent',
      'hover:bg-pixel-dark',
      'hover:text-pixel-accent',
      'hover:shadow-lg',
      'hover:shadow-pixel-accent/30'
    ].join(' '),
    
    outline: [
      'bg-transparent',
      'text-pixel-primary',
      'border-pixel-primary',
      'hover:bg-pixel-primary',
      'hover:text-pixel-dark',
      'hover:shadow-lg',
      'hover:shadow-pixel-primary/30'
    ].join(' ')
  };

  // Size-specific classes
  const sizeClasses = {
    small: 'text-xs px-3 py-1.5 min-h-[32px]',
    medium: 'text-sm px-4 py-2 min-h-[40px]',
    large: 'text-base px-6 py-3 min-h-[48px]'
  };

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(' ');

  // Handle click events
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      style={style}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={testId}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Export default for convenience
export default Button;