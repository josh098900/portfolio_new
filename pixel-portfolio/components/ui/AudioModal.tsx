'use client';

import React, { useEffect, useCallback } from 'react';
import { useAudioPlayer } from '@/components/hooks/useAudioPlayer';

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioModal: React.FC<AudioModalProps> = ({ isOpen, onClose }) => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    selectedVoice,
    isLoading,
    selectVoice,
    togglePlayPause,
    seekTo,
    setVolume,
    formatTime,
  } = useAudioPlayer();

  // Handle escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Add/remove escape key listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle progress bar click
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    seekTo(newTime);
  };

  // Handle volume click
  const handleVolumeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    setVolume(percentage);
  };

  if (!isOpen) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercentage = volume * 100;

  return (
    <div
      className="fixed inset-0 z-[10000] bg-pixel-dark/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-pixel-dark border-4 border-pixel-primary p-8 max-w-2xl w-full font-pixel relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-pixel-primary hover:text-pixel-secondary text-2xl transition-colors"
          aria-label="Close audio player"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-pixel-primary text-2xl mb-2">🎧 AI NARRATED BLOG</h2>
          <p className="text-pixel-light text-sm">
            &ldquo;How I Use AI Effectively to Boost My Learning and Development&rdquo;
          </p>
        </div>

        {/* Voice Selection */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => selectVoice('male')}
            className={`
              p-6 border-2 transition-all duration-200 text-center
              ${selectedVoice === 'male' 
                ? 'border-pixel-primary bg-pixel-primary/20 text-pixel-primary' 
                : 'border-pixel-primary/50 text-pixel-light hover:border-pixel-primary'
              }
            `}
          >
            <div className="text-4xl mb-2">👨</div>
            <div className="text-lg mb-2">MALE VOICE</div>
            <div className="text-xs text-pixel-secondary">3:11 duration</div>
            {selectedVoice === 'male' && (
              <div className="mt-2 text-xs text-pixel-primary animate-pulse">SELECTED</div>
            )}
          </button>

          <button
            onClick={() => selectVoice('female')}
            className={`
              p-6 border-2 transition-all duration-200 text-center
              ${selectedVoice === 'female' 
                ? 'border-pixel-primary bg-pixel-primary/20 text-pixel-primary' 
                : 'border-pixel-primary/50 text-pixel-light hover:border-pixel-primary'
              }
            `}
          >
            <div className="text-4xl mb-2">👩</div>
            <div className="text-lg mb-2">FEMALE VOICE</div>
            <div className="text-xs text-pixel-secondary">3:03 duration</div>
            {selectedVoice === 'female' && (
              <div className="mt-2 text-xs text-pixel-primary animate-pulse">SELECTED</div>
            )}
          </button>
        </div>

        {/* Audio Player */}
        <div className="bg-pixel-dark border-2 border-pixel-primary/50 p-6 mb-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-pixel-light mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              className="h-2 bg-pixel-dark border border-pixel-primary/30 cursor-pointer relative"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-pixel-primary transition-all duration-100"
                style={{ width: `${progressPercentage}%` }}
              />
              <div
                className="absolute top-0 w-3 h-3 bg-pixel-primary border border-pixel-light transform -translate-y-0.5 -translate-x-1.5 cursor-pointer"
                style={{ left: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={() => seekTo(Math.max(0, currentTime - 10))}
              className="text-pixel-light hover:text-pixel-primary text-2xl transition-colors"
              aria-label="Rewind 10 seconds"
            >
              ⏮️
            </button>

            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className={`
                text-4xl transition-all duration-200 transform hover:scale-110
                ${isLoading 
                  ? 'text-pixel-secondary animate-pulse' 
                  : 'text-pixel-primary hover:text-pixel-secondary'
                }
              `}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
            </button>

            <button
              onClick={() => seekTo(Math.min(duration, currentTime + 10))}
              className="text-pixel-light hover:text-pixel-primary text-2xl transition-colors"
              aria-label="Forward 10 seconds"
            >
              ⏭️
            </button>
          </div>

          {/* Volume Control */}
          <div className="mt-4 flex items-center space-x-3">
            <span className="text-pixel-light text-lg">🔊</span>
            <div
              className="flex-1 h-2 bg-pixel-dark border border-pixel-primary/30 cursor-pointer relative"
              onClick={handleVolumeClick}
            >
              <div
                className="h-full bg-pixel-primary transition-all duration-100"
                style={{ width: `${volumePercentage}%` }}
              />
              <div
                className="absolute top-0 w-3 h-3 bg-pixel-primary border border-pixel-light transform -translate-y-0.5 -translate-x-1.5 cursor-pointer"
                style={{ left: `${volumePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <a
            href="https://medium.com/@joshmathers3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pixel-secondary hover:text-pixel-primary text-sm transition-colors underline"
          >
            READ ORIGINAL ON MEDIUM
          </a>
        </div>

        {/* Pixel Decorations */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-pixel-accent"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-pixel-accent"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pixel-accent"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-pixel-accent"></div>
      </div>
    </div>
  );
};