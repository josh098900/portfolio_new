'use client';

import React, { useEffect, useCallback, useState } from 'react';

interface WelcomeScreenProps {
  isVisible: boolean;
  onDismiss: () => void;
  children?: React.ReactNode;
}

/**
 * Full-screen welcome overlay component with pixel art styling
 * Features click-anywhere-to-dismiss, escape key handling, and accessibility support
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  isVisible,
  onDismiss,
  children
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, []);
  // Handle escape key press
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onDismiss();
    }
  }, [onDismiss]);

  // Handle play button click
  const handlePlayClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onDismiss();
  }, [onDismiss]);

  // Add/remove event listeners and manage focus
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when welcome screen is visible
      document.body.style.overflow = 'hidden';
      
      // Focus management for accessibility
      const welcomeElement = document.querySelector('[role="dialog"]') as HTMLElement;
      if (welcomeElement) {
        welcomeElement.focus();
      }
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, handleKeyDown]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        fixed inset-0 z-[9999] 
        bg-pixel-dark/95 backdrop-blur-sm
        flex items-center justify-center
        ${prefersReducedMotion ? '' : 'animate-fade-in'}
        transition-all duration-300 ease-in-out
        p-4 sm:p-6
        overflow-y-auto
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      aria-describedby="welcome-description"
      tabIndex={-1}
    >
      {/* Pixel art background pattern overlay */}
      <div 
        className="absolute inset-0 bg-pixel-dots opacity-10 pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Welcome content container */}
      <div 
        className={`
          relative w-full max-w-6xl mx-auto
          text-center
          ${prefersReducedMotion ? '' : 'animate-slide-up'}
          cursor-default
          transition-transform duration-300 ease-out
          my-auto
          min-h-0
        `}

      >
        {children}
        
        {/* Play button with coin icon */}
        <div className="mt-6 sm:mt-8 flex justify-center px-4">
          <button
            onClick={handlePlayClick}
            className={`
              group relative
              bg-pixel-primary hover:bg-pixel-secondary
              text-pixel-dark hover:text-pixel-light
              font-pixel text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4
              border-4 border-pixel-primary hover:border-pixel-secondary
              transition-all duration-200 ease-in-out
              transform hover:scale-105 active:scale-95
              shadow-lg hover:shadow-pixel-glow
              ${prefersReducedMotion ? '' : 'animate-pulse hover:animate-none'}
              w-full max-w-xs sm:w-auto
            `}
            aria-label="Start exploring the portfolio"
          >
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              {/* Coin icon */}
              <div className={`
                w-5 h-5 sm:w-6 sm:h-6 rounded-full 
                bg-gradient-to-br from-yellow-400 to-yellow-600
                border-2 border-yellow-300
                flex items-center justify-center
                ${prefersReducedMotion ? '' : 'animate-spin group-hover:animate-bounce'}
              `}>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-200 rounded-full"></div>
              </div>
              
              {/* Button text */}
              <span className="tracking-wider">PLAY</span>
            </div>
            
            {/* Pixel art button decoration */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-pixel-accent"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pixel-accent"></div>
          </button>
        </div>
        
        {/* ESC instruction */}
        <div 
          id="welcome-description"
          className={`mt-3 sm:mt-4 text-pixel-primary/60 text-xs font-pixel ${prefersReducedMotion ? '' : 'animate-blink'} px-4`}
        >
          Press ESC to continue
        </div>
      </div>
      
      {/* Pixel art border decoration */}
      <div 
        className="absolute inset-4 border-2 border-pixel-primary/20 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};

export default WelcomeScreen;