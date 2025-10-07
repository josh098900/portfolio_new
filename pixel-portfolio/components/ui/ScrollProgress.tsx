'use client';

import { useState, useEffect } from 'react';

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className = '' }: ScrollProgressProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      
      setScrollProgress(Math.min(scrolled, 100));
    };

    // Update on scroll
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    
    // Update on resize (in case content height changes)
    window.addEventListener('resize', updateScrollProgress, { passive: true });
    
    // Initial calculation
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* Background bar */}
      <div className="h-1 bg-pixel-dark/80 border-b border-pixel-primary/20">
        {/* Progress fill */}
        <div 
          className="h-full bg-gradient-to-r from-pixel-primary via-pixel-accent to-pixel-secondary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Pixel-style indicators */}
      <div className="absolute top-0 left-0 right-0 h-1 pointer-events-none">
        {/* Create pixel segments */}
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`absolute top-0 w-1 h-1 transition-all duration-200 ${
              scrollProgress > (i * 5) 
                ? 'bg-pixel-light shadow-pixel-glow' 
                : 'bg-transparent'
            }`}
            style={{ left: `${i * 5}%` }}
          />
        ))}
      </div>
    </div>
  );
}