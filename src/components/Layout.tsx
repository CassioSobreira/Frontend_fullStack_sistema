import type { ReactNode } from 'react';
import GradientBackground from './background/GradientBackground';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-[100vh] min-h-screen">
      <GradientBackground />
      <div className="flex w-full flex-grow items-center justify-center relative z-10 p-4">
        {children}
      </div>
    </div>
  );
}

