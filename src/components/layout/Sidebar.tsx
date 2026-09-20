import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Language } from '../../types';
import { languages } from '../../i18n/translations';
import {
  Recycle,
  LayoutDashboard,
  PlusCircle,
  Truck,
  Receipt,
  MessageSquare,
  BarChart3,
  Globe,
  Sun,
  Moon,
  HelpCircle,
  User,
  ShieldAlert,
  ArrowRightLeft,
  Briefcase,
  Boxes,
  Factory,
  Settings,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { role, setRole, language, setLanguage, theme, setTheme, t } = useApp();
  const { user, logout } = useAuth();

  // Navigation Links based on active UserRole
  const getNavLinks = () => {
    switch (role) {
      case 'collector':
        return [
          { path: '/', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
          { path: '/available-jobs', label: 'Pickup Requests', icon: <Truck className="w-4 h-4" /> },
          { path: '/my-jobs', label: 'Active Pickup', icon: <Boxes className="w-4 h-4" /> },
          { path: '/transactions', label: 'History', icon: <Receipt className="w-4 h-4" /> },
          { path: '/help', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
        ];
      case 'recycler':
        return [
          { path: '/', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
          { path: '/incoming-material', label: 'Incoming', icon: <Truck className="w-4 h-4" /> },
          { path: '/processing', label: 'Processing', icon: <Factory className="w-4 h-4" /> },
          { path: '/inventory', label: 'Recovered', icon: <Boxes className="w-4 h-4" /> },
          { path: '/help', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
        ];
      case 'business':
      case 'individual':
      default:
        return [
          { path: '/', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
          { path: '/request-pickup', label: 'Request Pickup', icon: <PlusCircle className="w-4 h-4" /> },
          { path: '/my-pickups', label: 'My Pickups', icon: <Truck className="w-4 h-4" /> },
          { path: '/transactions', label: 'History', icon: <Receipt className="w-4 h-4" /> },
          { path: '/help', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 hidden md:flex">
      {/* Top Branding Header */}
      <div>
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3">
          <img src="/logo.png" alt="Recyvia Logo" className="w-10 h-10 object-contain rounded-xl" />
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-zinc-100">
              RECYVIA
            </h1>
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Request. Collect. Recover.
            </p>
          </div>
        </div>

        {/* Persona Switcher Selector */}
        <div className="p-3">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-emerald-500" /> Mode / Persona
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-normal">Active</span>
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold px-2.5 py-1.5 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="individual" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-zinc-100">Customer (Individual & Business)</option>
              <option value="collector" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-zinc-100">Informal Collector</option>
              <option value="recycler" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-zinc-100">Recycler Partner</option>
            </select>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Languages, Theme, User Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
        {/* Languages Selector */}
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 dark:text-zinc-400">
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <span>{t.language}</span>
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md text-xs font-medium px-2 py-1 text-slate-800 dark:text-zinc-200 focus:outline-none"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code} className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-zinc-100">
                {l.nativeName}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Switcher & Help */}
        <div className="flex items-center justify-between gap-2 px-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          <button
            onClick={() => onNavigate('/help')}
            className="p-1.5 bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 rounded-lg text-slate-600 dark:text-zinc-400 transition-colors"
            title={t.help}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                {user?.name || 'Authenticated User'}
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 capitalize truncate">
                {role} User
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
