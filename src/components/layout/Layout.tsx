import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../common/Toast';
import { CommandPalette } from '../common/CommandPalette';

interface LayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  pageTitle: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentPath,
  onNavigate,
  pageTitle,
  children,
}) => {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Desktop Sidebar */}
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Header */}
        <TopBar pageTitle={pageTitle} onNavigate={onNavigate} />

        {/* Page Inner Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav currentPath={currentPath} onNavigate={onNavigate} />

      {/* Global Utilities */}
      <ToastContainer />
      <CommandPalette />
    </div>
  );
};
