import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <DesktopSidebar />
      <main className="flex-1 pb-24 md:pb-6 px-4 md:px-8 py-6 max-w-4xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
