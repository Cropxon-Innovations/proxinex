import { useState, useRef, useCallback, ReactNode } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const toggleCollapse = () => {
    if (isCollapsed) {
      setWidth(savedWidth);
    } else {
      setSavedWidth(width);
    }
    setIsCollapsed(!isCollapsed);
  };

  // Collapsed state - show only Sources icon
  if (isCollapsed) {
    return (
      <div className="w-12 border-l border-border bg-card/50 flex-shrink-0 hidden lg:flex flex-col h-full">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="m-1.5 h-9 w-9 p-0"
              >
                <FileText className="h-4 w-4 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Open Sources Panel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="border-l border-border bg-card/50 flex-shrink-0 hidden lg:flex flex-col h-full relative"
      style={{ width: `${width}px`, minWidth: `${minWidth}px`, maxWidth: `${maxWidth}px` }}
    >
      {/* Resize Handle - Left Edge */}
      <div
        onMouseDown={handleMouseDownLeft}
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 transition-colors z-10 group flex items-center justify-center"
        title="Drag to resize"
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-border group-hover:bg-primary/50 rounded-r transition-colors" />
      </div>

      {/* Collapse Button */}
      <div className="absolute top-2 right-2 z-20">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="h-7 w-7 p-0"
              >
                <FileText className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Collapse Panel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Panel Content - Fully Scrollable */}
      <div className="flex-1 overflow-hidden min-h-0">
        {children}
      </div>
    </div>
  );
};
