'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'search' | 'number';
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ label, error, icon, variant = 'default', className = '', ...props }, ref) => {
    const getInputClasses = () => {
      const baseClasses = 'input-mobile';
      const variantClasses = {
        default: '',
        search: 'rounded-full pl-12',
        number: 'text-center'
      };

      const errorClasses = error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : '';

      return `${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`;
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-responsive-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && variant === 'search' && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={getInputClasses()}
            {...props}
          />

          {icon && variant !== 'search' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

MobileInput.displayName = 'MobileInput';

export default MobileInput;
