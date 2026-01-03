import { useState, useRef, useCallback, ReactNode } from "react";
import { ExternalLink, Minimize2, Maximize2 } from "lucide-react";
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
  const [isMinimized, setIsMinimized] = useState(false);
  const isResizing = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      // Dragging left increases width (moving handle left = panel gets bigger)
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
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 transition-colors z-10 group"
        title="Drag to resize"
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-border group-hover:bg-primary/50 rounded-r transition-colors" />
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

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};
