import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs gap-1.5',
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base font-semibold gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-600',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 focus:ring-slate-400',
    outline:
      'border border-slate-300 hover:bg-slate-50 text-slate-800 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-zinc-200 focus:ring-emerald-500',
    ghost:
      'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 focus:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600',
    success:
      'bg-teal-600 hover:bg-teal-700 text-white shadow-xs focus:ring-teal-500',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
