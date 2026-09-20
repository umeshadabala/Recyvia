import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Recycle, Truck, ShieldCheck, X, Factory } from 'lucide-react';
import { WasteRateService } from '../../services/wasteRateService';
import { PickupService } from '../../services/pickupService';

export const CommandPalette: React.FC = () => {
  const { isCommandOpen, setIsCommandOpen, setRole } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(!isCommandOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, setIsCommandOpen]);

  if (!isCommandOpen) return null;

  const rates = WasteRateService.searchRates(query).slice(0, 4);
  const pickups = PickupService.getAllPickups().filter((p) =>
    p.requestNumber.toLowerCase().includes(query.toLowerCase()) ||
    p.generatorName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const handleClose = () => {
    setQuery('');
    setIsCommandOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity" onClick={handleClose} />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-6 sm:pt-20">
        <div className="relative w-full max-w-xl transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left shadow-2xl transition-all">
          {/* Search Input Bar */}
          <div className="relative flex items-center border-b border-slate-200 dark:border-zinc-800 px-4 py-3">
            <Search className="w-5 h-5 text-slate-400 dark:text-zinc-500 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or search scrap rates, requests..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent px-3 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
            />
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-4">
            {/* Quick Actions */}
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Persona Views & Switcher
              </div>
              <div className="mt-1 grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Individual View', role: 'individual' as const, icon: <Recycle className="w-4 h-4" /> },
                  { label: 'Business View', role: 'business' as const, icon: <ShieldCheck className="w-4 h-4" /> },
                  { label: 'Collector View', role: 'collector' as const, icon: <Truck className="w-4 h-4" /> },
                  { label: 'Recycler View', role: 'recycler' as const, icon: <Factory className="w-4 h-4" /> },
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setRole(item.role);
                      handleClose();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-left transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrap Rates */}
            {rates.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Scrap Material Rates
                </div>
                <div className="mt-1 space-y-1">
                  {rates.map((rate) => (
                    <div
                      key={rate.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="font-medium text-slate-800 dark:text-zinc-200">{rate.name}</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{rate.ratePerKg}/{rate.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pickup Requests */}
            {pickups.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Pickup Requests
                </div>
                <div className="mt-1 space-y-1">
                  {pickups.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-zinc-100">{p.requestNumber}</span>
                        <span className="ml-2 text-slate-500 dark:text-zinc-400">{p.generatorName}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
