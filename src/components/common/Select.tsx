import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            className={`w-full rounded-lg border bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-sm px-3.5 py-2.5 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 ${
              leftIcon ? 'pl-10' : ''
            } pr-10 ${
              error
                ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 dark:border-zinc-700'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-slate-400 dark:text-zinc-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error ? (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
