import React from 'react';
import { PickupStatus } from '../../types';
import { useApp } from '../../context/AppContext';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'blue' | 'purple' | 'cyan' | 'rose' | 'slate' | 'teal' | 'indigo';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-medium tracking-wide',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wide',
  };

  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800',
    teal: 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: PickupStatus; className?: string }> = ({ status, className = '' }) => {
  const { t } = useApp();

  const statusMap: Record<PickupStatus, { label: string; variant: BadgeProps['variant']; pulse?: boolean }> = {
    pending: { label: t.pending, variant: 'amber', pulse: true },
    accepted: { label: t.accepted, variant: 'blue' },
    in_transit: { label: t.inTransit, variant: 'purple', pulse: true },
    arrived: { label: t.arrived, variant: 'indigo', pulse: true },
    otp_verified: { label: t.otpVerified, variant: 'cyan' },
    weighed: { label: t.weighed, variant: 'teal' },
    paid: { label: t.paid, variant: 'emerald' },
    completed: { label: t.completed, variant: 'emerald' },
    cancelled: { label: t.cancelledStatus, variant: 'rose' },
  };

  const config = statusMap[status] || { label: status, variant: 'slate' };

  return (
    <Badge variant={config.variant} pulse={config.pulse} className={className}>
      {config.label}
    </Badge>
  );
};
