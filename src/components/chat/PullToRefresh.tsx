import { useState, useRef, useCallback, ReactNode, MutableRefObject } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  /** Optional ref for callers that need access to the internal scroll container */
  scrollContainerRef?: MutableRefObject<HTMLDivElement | null>;
}

export const PullToRefresh = ({
  children,
  onRefresh,
  threshold = 80,
  scrollContainerRef,
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    isPulling.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, (currentY - startY.current) * 0.5);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  }, [isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const rotation = Math.min(pullDistance / threshold * 180, 180);
  const opacity = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div className="relative flex-1 min-w-0 h-full flex flex-col overflow-hidden">
      {/* Pull Indicator */}
      {showIndicator && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none"
          style={{
            top: `${Math.min(pullDistance - 40, 20)}px`,
            opacity,
          }}
        >
          <div className={`w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center backdrop-blur-sm ${isRefreshing ? 'animate-pulse' : ''}`}>
            <RefreshCw
              className={`h-5 w-5 text-primary transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ transform: isRefreshing ? undefined : `rotate(${rotation}deg)` }}
            />
          </div>
        </div>
      )}

      {/* Content - Properly scrollable container */}
      <div
        ref={(el) => {
          containerRef.current = el;
          if (scrollContainerRef) scrollContainerRef.current = el;
        }}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.3}px)` : undefined,
          transition: isPulling.current ? undefined : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Refreshing text */}
      {isRefreshing && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-primary font-medium pointer-events-none">
          Syncing...
        </div>
      )}
    </div>
  );
};
