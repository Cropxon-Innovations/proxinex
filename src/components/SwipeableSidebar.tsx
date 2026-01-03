import { useState, useRef, useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface SwipeableSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const SwipeableSidebar = ({ isOpen, onClose, children }: SwipeableSidebarProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance threshold
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    if (isLeftSwipe && isOpen) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-sidebar border-r border-border md:hidden transform transition-transform duration-300 ease-out"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
        >
          <X className="h-5 w-5 text-sidebar-foreground" />
        </button>

        {children}
      </div>
    </>
  );
};

// Hook for swipe gesture to open sidebar
export const useSwipeToOpen = (onOpen: () => void) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;
  const edgeThreshold = 30; // Must start from left edge

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch.clientX <= edgeThreshold) {
      setTouchEnd(null);
      setTouchStart(touch.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStart !== null) {
      setTouchEnd(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchEnd - touchStart;
    const isRightSwipe = distance > minSwipeDistance;

    if (isRightSwipe) {
      onOpen();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [touchStart, touchEnd]);
};
