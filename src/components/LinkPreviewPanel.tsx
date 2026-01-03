import { useState } from "react";
import { X, ExternalLink, RefreshCw, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LinkPreviewPanelProps {
  url: string | null;
  title?: string;
  onClose: () => void;
}

export function LinkPreviewPanel({ url, title, onClose }: LinkPreviewPanelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!url) return null;

  const handleOpenExternal = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRefresh = () => {
    setIsLoading(true);
  };

  return (
    <aside 
      className={`${isExpanded ? 'w-[600px]' : 'w-96'} border-l border-border bg-card flex flex-col flex-shrink-0 transition-all duration-300`}
    >
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-3 flex-shrink-0 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {title || new URL(url).hostname}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleOpenExternal}
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* URL Bar */}
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md text-xs text-muted-foreground overflow-hidden">
          <span className="truncate">{url}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading preview...</span>
            </div>
          </div>
        )}
        <iframe
          src={url}
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          title="Link Preview"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>

      {/* Footer */}
      <div className="h-10 border-t border-border flex items-center justify-center px-3 text-xs text-muted-foreground bg-muted/30">
        <span>Preview may be limited due to site restrictions</span>
      </div>
    </aside>
  );
}
