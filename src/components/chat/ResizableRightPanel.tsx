import { useState, useRef, useCallback, ReactNode, useEffect } from "react";
import { Minimize2, Maximize2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResizableRightPanelProps {
  children: ReactNode;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
}

export const ResizableRightPanel = ({
  children,
  minWidth = 240,
  maxWidth = 600,
  defaultWidth = 320,
}: ResizableRightPanelProps) => {
  const [width, setWidth] = useState(defaultWidth);
  const [savedWidth, setSavedWidth] = useState(defaultWidth);
  const [isMinimized, setIsMinimized] = useState(false);
  const isResizing = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Resize from left edge (drag left to expand, drag right to shrink)
  const handleMouseDownLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startX - e.clientX;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [width, minWidth, maxWidth]);

  const toggleMinimize = () => {
    if (isMinimized) {
      // Restore to saved width
      setWidth(savedWidth);
    } else {
      // Save current width before minimizing
      setSavedWidth(width);
    }
    setIsMinimized(!isMinimized);
  };

  if (isMinimized) {
    return (
      <div className="w-10 border-l border-border bg-card/50 flex-shrink-0 hidden lg:flex flex-col h-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMinimize}
          className="m-1 h-8 w-8 p-0"
          title="Expand panel"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="border-l border-border bg-card/50 flex-shrink-0 hidden lg:flex flex-col h-full relative"
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle - Left Edge */}
      <div
        onMouseDown={handleMouseDownLeft}
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 transition-colors z-10 group flex items-center justify-center"
        title="Drag to resize"
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-border group-hover:bg-primary/50 rounded-r transition-colors" />
      </div>

      {/* Minimize Button */}
      <div className="absolute top-2 right-2 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMinimize}
          className="h-6 w-6 p-0"
          title="Minimize panel"
        >
          <Minimize2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Panel Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};
