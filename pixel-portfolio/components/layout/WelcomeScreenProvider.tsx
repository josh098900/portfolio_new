'use client';

import Image from 'next/image';
import { useWelcomeScreen } from '@/components/hooks/useWelcomeScreen';
import { WelcomeScreen } from '@/components/ui/WelcomeScreen';
import { WelcomeContent } from '@/components/ui/WelcomeContent';

interface WelcomeScreenProviderProps {
  children: React.ReactNode;
}

export function WelcomeScreenProvider({ children }: WelcomeScreenProviderProps) {
  const { isVisible, dismissWelcomeScreen } = useWelcomeScreen();

  return (
    <>
      {children}
      <WelcomeScreen isVisible={isVisible} onDismiss={dismissWelcomeScreen}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center max-w-6xl mx-auto">
          {/* Welcome Image Section */}
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
              <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96">
                <Image
                  src="/images/welcome-avatar.png"
                  alt="Welcome to Josh's Portfolio"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
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