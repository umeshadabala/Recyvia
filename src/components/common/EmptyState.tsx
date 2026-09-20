import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
