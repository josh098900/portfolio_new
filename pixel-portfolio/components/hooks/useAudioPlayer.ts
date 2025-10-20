import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export type VoiceType = 'male' | 'female';

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  selectedVoice: VoiceType;
  isLoading: boolean;
}

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    selectedVoice: 'male',
    isLoading: false,
  });

  // Audio file paths
  const audioSources = useMemo(() => ({
    male: '/audio/male.mp3',
    female: '/audio/female.mp3',
  }), []);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }));
    };

    const handleTimeUpdate = () => {
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const handleEnded = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
    };

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
    };
  }, []);

  // Change voice
  const selectVoice = useCallback((voice: VoiceType) => {
    if (!audioRef.current) return;

    const wasPlaying = state.isPlaying;
    const currentTime = state.currentTime;

    // Pause current audio
    audioRef.current.pause();

    // Update state and source
    setState(prev => ({
      ...prev,
      selectedVoice: voice,
      isPlaying: false,
      currentTime: 0,
      isLoading: true,
    }));

    // Load new audio source
    audioRef.current.src = audioSources[voice];
    audioRef.current.load();

    // If was playing, resume after load
    if (wasPlaying) {
      audioRef.current.addEventListener('canplay', () => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(currentTime, audioRef.current.duration);
          audioRef.current.play();
          setState(prev => ({ ...prev, isPlaying: true }));
        }
      }, { once: true });
    }
  }, [state.isPlaying, state.currentTime, audioSources]);

  // Play/pause
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (state.isPlaying) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      // Set source if not set
      if (!audioRef.current.src) {
        audioRef.current.src = audioSources[state.selectedVoice];
      }
      
      audioRef.current.play().then(() => {
        setState(prev => ({ ...prev, isPlaying: true }));
      }).catch(() => {
        // Audio play failed - silently handle
        setState(prev => ({ ...prev, isLoading: false }));
      });
    }
  }, [state.isPlaying, state.selectedVoice, audioSources]);

  // Seek to position
  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioRef.current.volume = clampedVolume;
    setState(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  // Format time helper
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    selectVoice,
    togglePlayPause,
    seekTo,
    setVolume,
    formatTime,
  };
};