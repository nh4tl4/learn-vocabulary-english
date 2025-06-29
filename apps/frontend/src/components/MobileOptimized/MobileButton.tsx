'use client';

import { ReactNode } from 'react';

interface MobileButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

export default function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  className = ''
}: MobileButtonProps) {
  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
      outline: 'border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white'
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-responsive-sm',
      lg: 'px-6 py-4 text-responsive-base'
    };
    return sizes[size];
  };

  const baseClasses = `
    btn-touch btn-haptic
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'pointer-events-none' : ''}
  `;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        )}
        {icon && !loading && icon}
        <span>{children}</span>
      </div>
    </button>
  );
}
