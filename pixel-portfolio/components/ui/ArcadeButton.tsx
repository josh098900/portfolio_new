'use client';

import { useState } from 'react';
import { PongGame } from './PongGame';

export function ArcadeButton() {
  const [isGameOpen, setIsGameOpen] = useState(false);

  return (
    <>
      {/* Floating Arcade Button */}
      <button
        onClick={() => setIsGameOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 group"
        aria-label="Play Pong Game"
      >
        {/* Button Base */}
        <div className="relative">
          {/* Main Button */}
          <div className="bg-pixel-dark border-2 md:border-4 border-pixel-primary p-2 md:p-4 transition-all duration-200 group-hover:border-pixel-accent group-hover:shadow-lg group-hover:shadow-pixel-primary/50">
            {/* Button Face */}
            <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-b from-pixel-primary to-pixel-secondary rounded-full border border-pixel-light/20 md:border-2 flex items-center justify-center relative overflow-hidden">
              {/* Shine Effect */}
              <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1 w-2 h-2 md:w-4 md:h-4 bg-white/30 rounded-full" />
              
              {/* Game Icon */}
              <div className="font-pixel text-pixel-dark text-xs md:text-xs font-bold">
                <span className="hidden md:inline">PONG</span>
                <span className="md:hidden">P</span>
              </div>
            </div>
          </div>
          
          {/* Button Shadow */}
          <div className="absolute top-1 left-1 md:top-2 md:left-2 w-full h-full bg-pixel-primary/20 border-2 md:border-4 border-pixel-primary/30 -z-10" />
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-pixel-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-20" />
        </div>

        {/* Label - Hidden on mobile */}
        <div className="hidden md:block absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-pixel-dark border-2 border-pixel-primary px-2 py-1 whitespace-nowrap">
            <span className="font-pixel text-pixel-primary text-xs">PLAY GAME</span>
          </div>
          {/* Arrow */}
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-pixel-primary mx-auto" />
        </div>

        {/* Pulse Animation */}
        <div className="absolute inset-0 border-2 md:border-4 border-pixel-primary rounded-full animate-ping opacity-20" />
      </button>

      {/* Pong Game Modal */}
      <PongGame 
        isOpen={isGameOpen} 
        onClose={() => setIsGameOpen(false)} 
      />
    </>
  );
}