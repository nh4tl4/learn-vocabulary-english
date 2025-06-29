'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  message
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10 sm:h-12 sm:w-12',
    lg: 'h-16 w-16 sm:h-20 sm:w-20'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      {message && (
        <p className="mt-3 text-responsive-sm text-gray-600 dark:text-gray-400 text-center">
          {message}
        </p>
      )}
    </div>
  );
}
