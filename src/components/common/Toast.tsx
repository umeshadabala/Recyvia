import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
        };

        const borderColors = {
          success: 'border-emerald-200 dark:border-emerald-800/80',
          info: 'border-blue-200 dark:border-blue-800/80',
          warning: 'border-amber-200 dark:border-amber-800/80',
          error: 'border-rose-200 dark:border-rose-800/80',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border ${borderColors[toast.type]} shadow-xl text-slate-900 dark:text-zinc-100 transition-all animate-in slide-in-from-bottom-5 duration-200`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold">{toast.title}</h4>
              {toast.description && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
