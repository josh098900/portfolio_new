'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { IPersonalInfo } from '@/data/types';

/**
 * Props for the Hero component
 */
interface IHeroProps {
  /** Personal information to display */
  personalInfo?: IPersonalInfo;
  /** Whether to show animated elements */
  animated?: boolean;
  /** Whether to show call-to-action buttons */
  showCTA?: boolean;
  /** Custom background pattern */
  backgroundPattern?: 'dots' | 'grid' | 'waves' | 'none';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Hero section component with pixel art styling and animations
 * Features responsive design and interactive elements
 */
export const Hero: React.FC<IHeroProps> = ({
  personalInfo,
  animated = true,
  showCTA = true,
  backgroundPattern = 'dots',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const [titleIndex, setTitleIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Mount effect to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const timeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  // Typewriter effect for title (only after mount)
  useEffect(() => {
    if (!isMounted || !animated || !personalInfo?.title) return;

    const titles = [personalInfo.title, 'PIXEL ARTIST', 'CODE WIZARD', 'DIGITAL CREATOR'].filter(Boolean);
    const currentTitleText = titles[titleIndex % titles.length];
    
    if (currentTitleText && currentTitle.length < currentTitleText.length) {
      const timeout = setTimeout(() => {
        setCurrentTitle(currentTitleText.slice(0, currentTitle.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentTitle('');
        setTitleIndex(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentTitle, titleIndex, animated, personalInfo?.title, isMounted]);

  // Base hero classes
  const heroClasses = [
    'relative',
    'min-h-screen',
    'flex',
    'items-center',
    'justify-center',
    'px-4',
    'py-20',
    'overflow-hidden',
    isVisible && animated ? 'animate-fade-in' : '',
    className
  ].join(' ');

  // Background pattern classes
  const backgroundPatterns = {
    dots: 'bg-pixel-dots',
    grid: 'bg-pixel-grid',
    waves: 'bg-pixel-waves',
    none: ''
  };

  // Content container classes
  const contentClasses = [
    'relative',
    'z-10',
    'text-center',
    'max-w-4xl',
    'mx-auto',
    'space-y-8'
  ].join(' ');

  // Name classes
  const nameClasses = [
    'font-pixel',
    'text-4xl',
    'md:text-6xl',
    'lg:text-8xl',
    'text-pixel-primary',
    'mb-4',
    'leading-tight',
    animated ? 'animate-pixel-pulse' : ''
  ].join(' ');

  // Title classes
  const titleClasses = [
    'font-pixel',
    'text-lg',
    'md:text-2xl',
    'lg:text-3xl',
    'text-pixel-secondary',
    'mb-6',
    'min-h-[2rem]',
    'md:min-h-[3rem]'
  ].join(' ');

  // Bio classes
  const bioClasses = [
    'font-pixel',
    'text-sm',
    'md:text-base',
    'text-pixel-light',
    'max-w-2xl',
    'mx-auto',
    'leading-relaxed',
    'mb-8'
  ].join(' ');

  // CTA button container classes
  const ctaClasses = [
    'flex',
    'flex-col',
    'sm:flex-row',
    'gap-4',
    'justify-center',
    'items-center'
  ].join(' ');

  // Scroll indicator classes
  const scrollIndicatorClasses = [
    'absolute',
    'bottom-8',
    'left-1/2',
    'transform',
    '-translate-x-1/2',
    'text-pixel-primary',
    'animate-bounce'
  ].join(' ');

  return (
    <section className={heroClasses}>
      {/* Background Pattern */}
      {backgroundPattern !== 'none' && (
        <div className={`absolute inset-0 opacity-10 ${backgroundPatterns[backgroundPattern]}`} />
      )}

      {/* Animated Background Elements */}
      {animated && (
        <>
          {/* Floating pixels */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }, (_, i) => {
              // Use deterministic values based on index to avoid hydration mismatch
              const left = (i * 17 + 23) % 100;
              const top = (i * 31 + 47) % 100;
              const delay = (i * 0.3) % 5;
              const duration = 3 + (i * 0.2) % 4;
              
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-pixel-accent animate-float"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`
                  }}
                />
              );
            })}
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-pixel-grid opacity-5 pointer-events-none" />
        </>
      )}

      {/* Main Content */}
      <div className={contentClasses}>
        {/* Avatar/Profile Image */}
        {personalInfo?.avatarUrl && (
          <div className="mb-8">
            <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto">
              <div className="absolute inset-0 bg-pixel-primary/20 border-4 border-pixel-primary animate-pulse" />
              <Image
                src={personalInfo.avatarUrl}
                alt={personalInfo.name || 'Profile'}
                fill
                className="object-cover image-rendering-pixelated"
                priority
              />
            </div>
          </div>
        )}

        {/* Name */}
        <h1 className={nameClasses}>
          {personalInfo?.name || 'PIXEL DEVELOPER'}
        </h1>

        {/* Animated Title */}
        <div className={titleClasses}>
          {animated && isMounted ? (
            <span>
              {currentTitle}
              <span className="animate-blink">|</span>
            </span>
          ) : (
            personalInfo?.title || 'FULL STACK DEVELOPER'
          )}
        </div>

        {/* Bio */}
        {personalInfo?.bio && (
          <p className={bioClasses}>
            {personalInfo.bio}
          </p>
        )}

        {/* Call to Action Buttons */}
        {showCTA && (
          <div className={ctaClasses}>
            <Link href="/projects">
              <Button variant="primary" size="large">
                VIEW MY WORK
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="large">
                GET IN TOUCH
              </Button>
            </Link>
            <Link href="https://medium.com/@joshmathers3" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="large">
                <span className="flex items-center space-x-2">
                  <span className="text-lg">✍️</span>
                  <span>READ MY BLOG</span>
                </span>
              </Button>
            </Link>
          </div>
        )}

        {/* Contact Info */}
        {personalInfo?.email && (
          <div className="mt-8">
            <p className="font-pixel text-pixel-light/60 text-xs">
              {personalInfo.location && `${personalInfo.location} • `}
              {personalInfo.email}
            </p>
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      {animated && (
        <div className={scrollIndicatorClasses}>
          <div className="font-pixel text-xs mb-2">SCROLL</div>
          <div className="w-1 h-8 bg-pixel-primary animate-pulse" />
        </div>
      )}

      {/* Decorative Corner Elements */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-pixel-primary" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-pixel-primary" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-pixel-primary" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-pixel-primary" />
    </section>
  );
};

// Export default for convenience
export default Hero;

// Export specialized hero variants
export const MinimalHero: React.FC<Omit<IHeroProps, 'animated' | 'showCTA'>> = (props) => (
  <Hero animated={false} showCTA={false} {...props} />
);

export const AnimatedHero: React.FC<Omit<IHeroProps, 'animated'>> = (props) => (
  <Hero animated={true} {...props} />
);

export const StaticHero: React.FC<Omit<IHeroProps, 'animated' | 'backgroundPattern'>> = (props) => (
  <Hero animated={false} backgroundPattern="none" {...props} />
);