'use client';

import { ReactNode, useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  fullHeight?: boolean;
}

export default function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  fullHeight = false
}: MobileModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className={`bottom-sheet ${fullHeight ? 'h-full sm:h-auto' : ''} ${isAnimating ? 'animate-slide-up' : ''}`}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
            {title && (
              <h2 className="text-responsive-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="btn-touch p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
