'use client';

import React, { useState, useEffect } from 'react';

interface WelcomeContentProps {
  /** Optional custom name override */
  name?: string;
  /** Optional custom title override */
  title?: string;
  /** Optional custom subtitle override */
  subtitle?: string;
  /** Whether to show the instruction text */
  showInstruction?: boolean;
}

/**
 * Welcome screen text content component with pixel art styling
 * Displays portfolio owner information and welcome message
 */
export const WelcomeContent: React.FC<WelcomeContentProps> = ({
  name = "Joshua Mathers",
  title = "Software Engineering Student & Aspiring Developer",
  subtitle = "Welcome to my digital portfolio",
  showInstruction = true
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
  return (
    <div className="space-y-6 text-center">
      {/* Main welcome title */}
      <div className="space-y-4">
        <h1
          id="welcome-title"
          className={`
            font-pixel text-pixel-primary text-glow
            text-2xl sm:text-3xl md:text-4xl lg:text-5xl
            leading-tight
            ${prefersReducedMotion ? '' : 'animate-pixel-pulse'}
          `}
          aria-label="Welcome to Joshua Mathers' portfolio"
        >
          WELCOME TO MY PORTFOLIO
        </h1>

        {/* Pixel art decorative line */}
        <div className="flex justify-center items-center space-x-2" aria-hidden="true">
          <div className="w-8 h-0.5 bg-pixel-secondary"></div>
          <div className="w-2 h-2 bg-pixel-secondary"></div>
          <div className="w-8 h-0.5 bg-pixel-secondary"></div>
        </div>
      </div>

      {/* Portfolio owner information */}
      <div className="space-y-3">
        <h2
          className={`
            font-pixel text-pixel-light
            text-lg sm:text-xl md:text-2xl
            leading-relaxed
          `}
          aria-label={`Portfolio by ${name}`}
        >
          {name}
        </h2>

        <p
          className={`
            font-pixel text-pixel-secondary
            text-sm sm:text-base md:text-lg
            leading-relaxed
            max-w-2xl mx-auto
          `}
          aria-label={`Role: ${title}`}
        >
          {title}
        </p>
      </div>

      {/* Subtitle/description */}
      <div className="space-y-4">
        <p className={`
          font-pixel text-pixel-light/80
          text-xs sm:text-sm md:text-base
          leading-relaxed
          max-w-xl mx-auto
        `}>
          {subtitle}
        </p>

        {/* Pixel art decorative elements */}
        <div className="flex justify-center space-x-4" aria-hidden="true">
          <div className={`w-1 h-1 bg-pixel-primary ${prefersReducedMotion ? '' : 'animate-blink'}`}></div>
          <div className={`w-1 h-1 bg-pixel-secondary ${prefersReducedMotion ? '' : 'animate-blink'}`} style={{ animationDelay: '0.5s' }}></div>
          <div className={`w-1 h-1 bg-pixel-accent ${prefersReducedMotion ? '' : 'animate-blink'}`} style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Interactive instruction text */}
      {showInstruction && (
        <div className="mt-8 pt-6 border-t border-pixel-primary/30">
          <p
            className={`
              font-pixel text-pixel-primary/70
              text-xs sm:text-sm
              ${prefersReducedMotion ? '' : 'animate-pulse'}
            `}
            aria-label="Click anywhere on the screen or press escape to enter the portfolio"
          >
            ▶ CLICK ANYWHERE TO ENTER ◀
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Simplified welcome content variant for fallback scenarios
 */
export const SimpleWelcomeContent: React.FC<Omit<WelcomeContentProps, 'showInstruction'>> = ({
  name = "Joshua Mathers",
  title = "Software Engineering Student & Aspiring Developer"
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

  return (
    <div className="space-y-4 text-center">
      <div className="text-4xl mb-4" role="img" aria-label="Robot emoji">🤖</div>

      <h1
        className="font-pixel text-pixel-primary text-2xl md:text-3xl"
        aria-label={`Welcome to ${name}'s portfolio`}
      >
        WELCOME
      </h1>

      <div className="space-y-2">
        <h2
          className="font-pixel text-pixel-light text-lg"
          aria-label={`Portfolio by ${name}`}
        >
          {name}
        </h2>
        <p
          className="font-pixel text-pixel-secondary text-sm"
          aria-label={`Role: ${title}`}
        >
          {title}
        </p>
      </div>

      <p
        className={`font-pixel text-pixel-primary/70 text-xs ${prefersReducedMotion ? '' : 'animate-pulse'}`}
        aria-label="Click anywhere to continue to the portfolio"
      >
        CLICK TO CONTINUE
      </p>
    </div>
  );
};

export default WelcomeContent;