import { useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`
        flex items-center p-4 rounded-lg shadow-lg border
        ${type === 'success' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
        }
        min-w-[300px] max-w-md
      `}>
        <div className="flex items-center flex-1">
          {type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
          ) : (
            <div className="w-5 h-5 bg-red-600 rounded-full mr-3 flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          )}
          <span className="text-sm font-medium">{message}</span>
        </div>

        <button
          onClick={onClose}
          className={`
            ml-3 rounded-md p-1.5 hover:bg-opacity-20 transition-colors
            ${type === 'success' ? 'hover:bg-green-200' : 'hover:bg-red-200'}
          `}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
