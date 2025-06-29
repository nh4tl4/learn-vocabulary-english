'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
  threshold?: number;
}

export default function PullToRefresh({
  children,
  onRefresh,
  refreshingText = 'Đang làm mới...',
  pullText = 'Kéo xuống để làm mới',
  releaseText = 'Thả ra để làm mới',
  threshold = 80
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);

    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
      setCanRefresh(distance > threshold);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setCanRefresh(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, canRefresh, isRefreshing]);

  const getIndicatorText = () => {
    if (isRefreshing) return refreshingText;
    if (canRefresh) return releaseText;
    return pullText;
  };

  const getRotation = () => {
    if (isRefreshing) return 'rotate-180';
    if (canRefresh) return 'rotate-180';
    return 'rotate-0';
  };

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto scrollbar-hide">
      {/* Pull to refresh indicator */}
      <div
        className="pull-to-refresh"
        style={{
          transform: `translateY(${Math.max(-60, pullDistance - 60)}px)`,
          opacity: Math.min(1, pullDistance / threshold)
        }}
      >
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          {isRefreshing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <svg
              className={`h-5 w-5 transition-transform duration-200 ${getRotation()}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          <span className="text-sm font-medium">{getIndicatorText()}</span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
}
