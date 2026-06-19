'use client';

import { useState, useEffect } from 'react';

interface VisitorCounterProps {
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export function VisitorCounter({ 
  className = '', 
  showLabel = true,
  animated = true 
}: VisitorCounterProps) {
  const [_count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        // POST counts this visitor once (server-side cookie dedupe) and
        // returns the shared total stored in Redis.
        const response = await fetch('/api/visitor-count', { method: 'POST' });

        if (!response.ok) {
          throw new Error(`Visitor count request failed: ${response.status}`);
        }

        const data = await response.json();
        if (cancelled) return;

        setCount(data.count);

        if (animated && data.count > 0) {
          animateCounter(data.count);
        } else {
          setDisplayCount(data.count);
        }
      } catch (error) {
        if (cancelled) return;
        // Log error for debugging
        // eslint-disable-next-line no-console
        console.error('Error fetching visitor count:', error);
        setCount(0);
        setDisplayCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCount();

    return () => {
      cancelled = true;
    };
  }, [animated]);

  const animateCounter = (targetCount: number) => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.floor(increment * step), targetCount);
      setDisplayCount(current);

      if (current >= targetCount) {
        clearInterval(timer);
      }
    }, duration / steps);
  };

  const formatCount = (num: number): string => {
    return num.toString().padStart(6, '0');
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex space-x-1">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="w-3 h-5 bg-pixel-primary/20 border border-pixel-primary/40 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        {showLabel && (
          <span className="font-pixel text-pixel-light text-xs">LOADING...</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Retro counter display */}
      <div className="flex space-x-1 bg-pixel-dark border-2 border-pixel-primary p-2">
        {formatCount(displayCount).split('').map((digit, index) => (
          <div
            key={index}
            className="w-3 h-5 bg-pixel-primary text-pixel-dark font-pixel text-xs flex items-center justify-center relative overflow-hidden"
          >
            <span className="relative z-10">{digit}</span>
            {/* Retro glow effect */}
            <div className="absolute inset-0 bg-pixel-primary opacity-20 animate-pulse" />
          </div>
        ))}
      </div>
      
      {showLabel && (
        <div className="flex flex-col">
          <span className="font-pixel text-pixel-light text-xs leading-none">VISITORS</span>
          <span className="font-pixel text-pixel-secondary text-xs leading-none">SINCE 2025</span>
        </div>
      )}
    </div>
  );
}