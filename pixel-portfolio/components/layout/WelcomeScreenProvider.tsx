'use client';

import { useWelcomeScreen } from '@/components/hooks/useWelcomeScreen';
import { WelcomeScreen } from '@/components/ui/WelcomeScreen';
import { WelcomeContent } from '@/components/ui/WelcomeContent';
import SplineRobot from '@/components/ui/SplineRobot';

interface WelcomeScreenProviderProps {
  children: React.ReactNode;
}

export function WelcomeScreenProvider({ children }: WelcomeScreenProviderProps) {
  const { isVisible, dismissWelcomeScreen } = useWelcomeScreen();

  return (
    <>
      {children}
      <WelcomeScreen isVisible={isVisible} onDismiss={dismissWelcomeScreen}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* 3D Robot Section */}
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="w-full max-w-md lg:max-w-lg">
              <SplineRobot 
                className="w-full h-64 sm:h-80 lg:h-96"
                timeout={8000}
              />
            </div>
          </div>
          
          {/* Welcome Content Section */}
          <div className="order-1 lg:order-2">
            <WelcomeContent 
              name="Joshua Mathers"
              title="Software Engineering Student & Aspiring Developer"
              subtitle="Welcome to my digital portfolio"
              showInstruction={false}
            />
          </div>
        </div>
      </WelcomeScreen>
    </>
  );
}