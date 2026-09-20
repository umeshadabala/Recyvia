import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  Truck,
  Receipt,
  Boxes,
  Factory,
  BarChart3,
  User,
  Settings,
} from 'lucide-react';

interface MobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPath, onNavigate }) => {
  const { role, t } = useApp();

  const getMobileItems = () => {
    switch (role) {
      case 'collector':
        return [
          { path: '/', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
          { path: '/available-jobs', label: 'Requests', icon: <Truck className="w-5 h-5" /> },
          { path: '/my-jobs', label: 'Active', icon: <Boxes className="w-5 h-5" /> },
          { path: '/transactions', label: 'History', icon: <Receipt className="w-5 h-5" /> },
          { path: '/help', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
        ];
      case 'recycler':
        return [
          { path: '/', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
          { path: '/incoming-material', label: 'Incoming', icon: <Truck className="w-5 h-5" /> },
          { path: '/processing', label: 'Process', icon: <Factory className="w-5 h-5" /> },
          { path: '/inventory', label: 'Recovered', icon: <Boxes className="w-5 h-5" /> },
          { path: '/help', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
        ];
      case 'individual':
      case 'business':
      default:
        return [
          { path: '/', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
          { path: '/request-pickup', label: 'Request', icon: <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> },
          { path: '/my-pickups', label: 'Pickups', icon: <Truck className="w-5 h-5" /> },
          { path: '/transactions', label: 'History', icon: <Receipt className="w-5 h-5" /> },
          { path: '/help', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
        ];
    }
  };

  const navItems = getMobileItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
