import React from 'react';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className = '',
}) => {
  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeStyles[size]} rounded-full object-cover border border-slate-200 dark:border-zinc-700 shadow-xs`}
        />
      ) : (
        <div
          className={`${sizeStyles[size]} rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center border border-emerald-200 dark:border-emerald-800`}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-zinc-900 ${
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
          } ${
            status === 'online'
              ? 'bg-emerald-500'
              : status === 'busy'
              ? 'bg-amber-500'
              : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
};
