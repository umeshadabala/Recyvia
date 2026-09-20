import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Language } from '../../types';
import { languages } from '../../i18n/translations';
import { AuthModal } from '../auth/AuthModal';
import {
  Bell,
  Search,
  PlusCircle,
  Truck,
  User,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Recycle,
  ShieldCheck,
  Factory,
  Globe,
  Sun,
  Moon,
  LogIn,
  LogOut,
  X,
} from 'lucide-react';
import { Button } from '../common/Button';

interface TopBarProps {
  pageTitle: string;
  onNavigate: (path: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ pageTitle, onNavigate }) => {
  const { role, setRole, language, setLanguage, theme, setTheme, setIsCommandOpen, t } = useApp();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock Notifications
  const notifications = [
    {
      id: 'n1',
      title: 'Collector Assigned',
      desc: 'A verified collector accepted your pickup request.',
      time: '10m ago',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Settlement Completed',
      desc: 'Doorstep pickup payout of ₹450 settled successfully.',
      time: '1h ago',
      unread: false,
    },
  ];

  return (
    <header className="h-16 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Mobile Branding & Page Title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <img src="/logo.png" alt="Recyvia Logo" className="w-8 h-8 object-contain rounded-lg" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
            {pageTitle}
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-widest hidden sm:block">
            On-Demand Waste Recovery
          </p>
        </div>
      </div>

      {/* Action Controls & Right Utilities */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Global Command / Search Trigger */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-300 text-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>Search rates or requests...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-slate-500 dark:text-zinc-400">
            ⌘K
          </kbd>
        </button>

        {/* Primary Contextual Action Button */}
        {role === 'individual' || role === 'business' ? (
          <Button
            size="sm"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => onNavigate('/request-pickup')}
            className="shadow-sm"
          >
            <span className="hidden sm:inline">{t.requestPickup}</span>
            <span className="sm:hidden">Request</span>
          </Button>
        ) : role === 'collector' ? (
          <Button
            size="sm"
            variant="success"
            leftIcon={<Truck className="w-4 h-4" />}
            onClick={() => onNavigate('/available-jobs')}
          >
            Available Jobs
          </Button>
        ) : role === 'recycler' ? (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Factory className="w-4 h-4" />}
            onClick={() => onNavigate('/incoming-material')}
          >
            Incoming Material
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            onClick={() => onNavigate('/rates-manager')}
          >
            Edit Rates
          </Button>
        )}

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Notifications
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  2 New
                </span>
              </div>
              <div className="mt-3 space-y-3 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-lg text-xs transition-colors ${
                      n.unread ? 'bg-slate-50 dark:bg-zinc-800/60' : 'opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-zinc-200">
                      <span>{n.title}</span>
                      <span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">{n.time}</span>
                    </div>
                    <p className="mt-1 text-slate-600 dark:text-zinc-400 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'US'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  {user?.name || 'Authenticated User'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-semibold mt-0.5">
                  {role} Mode
                </div>
              </div>

              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Switch Role Persona
                </div>
                {(['individual', 'business', 'collector', 'recycler'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs capitalize ${
                      role === r
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{r}</span>
                    {role === r && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>

              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-zinc-800">
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Log Out Button */}
        <button
          onClick={logout}
          title="Log Out"
          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
      <AuthModal />
    </header>
  );
};
