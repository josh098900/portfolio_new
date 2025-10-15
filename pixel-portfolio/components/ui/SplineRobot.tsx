'use client';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useDeviceCapabilities } from '../utils/deviceCapabilities';

// Dynamically import Spline to avoid SSR issues
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce">🤖</div>
        <p className="font-pixel text-pixel-primary text-sm animate-pulse">
          LOADING 3D MODEL...
        </p>
      </div>
    </div>
  ),
});

interface SplineRobotProps {
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  /** Timeout in milliseconds for loading the 3D model (default: 10000ms) */
  timeout?: number;
  /** Force loading 3D model regardless of device capabilities */
  forceLoad?: boolean;
}

/**
 * Pixel-style loading animation component
 */
const PixelLoadingAnimation = () => (
  <div className="text-center space-y-4">
    {/* Animated robot emoji with pixel-style effects */}
    <div className="relative">
      <div className="text-6xl animate-bounce">🤖</div>
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-pixel-primary animate-blink"></div>
          <div className="w-1 h-1 bg-pixel-secondary animate-blink" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-1 h-1 bg-pixel-accent animate-blink" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </div>
    </div>

    {/* Loading text with pixel font */}
    <div className="space-y-2">
      <p className="font-pixel text-pixel-primary text-sm animate-pulse">
        LOADING 3D MODEL...
      </p>
      <div className="flex justify-center space-x-1">
        <div className="w-2 h-2 bg-pixel-secondary animate-ping"></div>
        <div className="w-2 h-2 bg-pixel-secondary animate-ping" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-pixel-secondary animate-ping" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  </div>
);

/**
 * Fallback component for when 3D model fails to load or device doesn't support it
 */
const FallbackWelcome = ({ reason }: { reason: 'error' | 'timeout' | 'unsupported' }) => (
  <div className="text-center space-y-6">
    {/* Pixel art robot */}
    <div className="relative">
      <div className="text-8xl">🤖</div>
      <div className="absolute -top-2 -right-2">
        <div className="w-3 h-3 bg-pixel-accent animate-blink"></div>
      </div>
    </div>

    {/* Welcome message */}
    <div className="space-y-4">
      <h1 className="font-pixel text-pixel-primary text-2xl md:text-3xl text-glow">
        WELCOME TO MY PORTFOLIO
      </h1>

      <div className="space-y-2">
        <h2 className="font-pixel text-pixel-light text-lg">
          Joshua Mathers
        </h2>
        <p className="font-pixel text-pixel-secondary text-sm">
          Software Engineering Student & Aspiring Developer
        </p>
      </div>

      {/* Status message */}
      <p className="font-pixel text-pixel-primary/60 text-xs">
        {reason === 'timeout'
          ? '3D MODEL LOADING SLOWLY'
          : reason === 'unsupported'
            ? 'OPTIMIZED FOR YOUR DEVICE'
            : '3D MODEL UNAVAILABLE'
        }
      </p>
    </div>

    {/* Pixel decorations */}
    <div className="flex justify-center space-x-4">
      <div className="w-1 h-1 bg-pixel-primary animate-blink"></div>
      <div className="w-1 h-1 bg-pixel-secondary animate-blink" style={{ animationDelay: '0.5s' }}></div>
      <div className="w-1 h-1 bg-pixel-accent animate-blink" style={{ animationDelay: '1s' }}></div>
    </div>
  </div>
);

export default function SplineRobot({
  onLoad,
  onError,
  className = '',
  timeout = 10000,
  forceLoad = false
}: SplineRobotProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  // Detect device capabilities
  const capabilities = useDeviceCapabilities();
  const shouldLoad3D = forceLoad || capabilities.shouldLoad3D;

  // Mobile-specific optimizations
  const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const adjustedTimeout = isMobile ? timeout * 1.5 : timeout; // Longer timeout for mobile

  // Set up timeout for slow connections (only if we're loading 3D)
  useEffect(() => {
    if (!shouldLoad3D) {
      // Skip 3D loading and show fallback immediately
      setIsLoading(false);
      onLoad?.(); // Consider fallback as "loaded"
      return;
    }

    timeoutRef.current = setTimeout(() => {
      if (!hasLoadedRef.current) {
        // Spline model loading timed out
        setHasTimedOut(true);
        setIsLoading(false);
        onError?.();
      }
    }, adjustedTimeout);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [adjustedTimeout, onError, shouldLoad3D, onLoad]);

  const handleLoad = useCallback(() => {
    hasLoadedRef.current = true;
    setIsLoading(false);
    setHasError(false);
    setHasTimedOut(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((_error: Error | unknown) => {
    // Spline model failed to load
    hasLoadedRef.current = true;
    setIsLoading(false);
    setHasError(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    onError?.();
  }, [onError]);

  // Show fallback for errors, timeouts, or unsupported devices
  if (hasError || hasTimedOut || !shouldLoad3D) {
    const reason = !shouldLoad3D ? 'unsupported' : hasError ? 'error' : 'timeout';
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <FallbackWelcome reason={reason} />
      </div>
    );
  }

  return (
    <div className={`relative min-h-[400px] ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-pixel-dark/80 backdrop-blur-sm z-10">
          <PixelLoadingAnimation />
        </div>
      )}

      {/* 3D Model - only render if device supports it */}
      {shouldLoad3D && (
        <Suspense fallback={
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <PixelLoadingAnimation />
          </div>
        }>
          <Spline
            scene="https://prod.spline.design/IxkrgoFGWXC2PCkI/scene.splinecode"
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              minHeight: isMobile ? '300px' : '400px',
              // Mobile performance optimizations
              ...(isMobile && {
                transform: 'translateZ(0)', // Force hardware acceleration
                willChange: 'transform', // Optimize for animations
              })
            }}
          />
        </Suspense>
      )}
    </div>
  );
}