import { useState, useEffect, useCallback } from 'react';

interface WelcomeScreenState {
  hasSeenWelcome: boolean;
  sessionId: string;
  timestamp: number;
}

const STORAGE_KEY = 'portfolio-welcome-seen';

// Generate a unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session state
const getSessionState = (): WelcomeScreenState => {
  if (typeof window === 'undefined') {
    return {
      hasSeenWelcome: false,
      sessionId: generateSessionId(),
      timestamp: Date.now(),
    };
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as WelcomeScreenState;
      return parsed;
    }
  } catch {
    // Silently handle parsing errors and create new state
  }

  // Create new session state
  const newState: WelcomeScreenState = {
    hasSeenWelcome: false,
    sessionId: generateSessionId(),
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch {
    // Silently handle storage errors
  }

  return newState;
};

// Save session state
const saveSessionState = (state: WelcomeScreenState): void => {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently handle storage errors
  }
};

export const useWelcomeScreen = () => {
  const [sessionState, setSessionState] = useState<WelcomeScreenState>(() => getSessionState());
  const [isVisible, setIsVisible] = useState(false);

  // Initialize visibility based on session state
  useEffect(() => {
    const state = getSessionState();
    setSessionState(state);
    setIsVisible(!state.hasSeenWelcome);
  }, []);

  // Handle welcome screen dismissal
  const dismissWelcomeScreen = useCallback(() => {
    const updatedState: WelcomeScreenState = {
      ...sessionState,
      hasSeenWelcome: true,
      timestamp: Date.now(),
    };

    setSessionState(updatedState);
    saveSessionState(updatedState);
    setIsVisible(false);
  }, [sessionState]);

  // Reset welcome screen (useful for testing or admin controls)
  const resetWelcomeScreen = useCallback(() => {
    const newState: WelcomeScreenState = {
      hasSeenWelcome: false,
      sessionId: generateSessionId(),
      timestamp: Date.now(),
    };

    setSessionState(newState);
    saveSessionState(newState);
    setIsVisible(true);
  }, []);

  // Check if user has seen welcome in current session
  const hasSeenWelcome = sessionState.hasSeenWelcome;

  return {
    isVisible,
    hasSeenWelcome,
    sessionId: sessionState.sessionId,
    timestamp: sessionState.timestamp,
    dismissWelcomeScreen,
    resetWelcomeScreen,
  };
};

export default useWelcomeScreen;