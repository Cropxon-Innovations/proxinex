import { useState } from "react";
import { ExternalLink, Globe, RefreshCw, X, ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Citation {
  id: string;
  title: string;
  url: string;
  snippet?: string;
  domain?: string;
  favicon?: string;
}

interface CitationPreviewPanelProps {
  citations: Citation[];
  selectedCitation?: Citation | null;
  onSelectCitation: (citation: Citation) => void;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const CitationPreviewPanel = ({
  citations,
  selectedCitation,
  onSelectCitation,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: CitationPreviewPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  if (citations.length === 0) {
    return null;
  }

  return (
    <aside className="flex-shrink-0 hidden lg:flex flex-col h-full overflow-hidden border-l border-border bg-card/50">
      {/* Header - Always visible */}
      <Collapsible open={!isCollapsed} onOpenChange={() => onToggleCollapse?.()}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 border-b border-border hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Sources</span>
              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {citations.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Citation List */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-2 space-y-2">
              {citations.map((citation) => (
                <button
                  key={citation.id}
                  onClick={() => onSelectCitation(citation)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCitation?.id === citation.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {citation.favicon ? (
                      <img
                        src={citation.favicon}
                        alt=""
                        className="w-4 h-4 rounded mt-0.5 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {citation.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {citation.domain || getDomain(citation.url)}
                      </p>
                      {citation.snippet && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {citation.snippet}
                        </p>
                      )}
                    </div>
                    {/* External Link Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenExternal(citation.url);
                      }}
                      className="h-6 w-6 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Preview Section */}
          {selectedCitation && (
            <div className="border-t border-border p-3 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Preview</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLoading(true)}
                    className="h-6 w-6 p-0"
                    title="Refresh"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenExternal(selectedCitation.url)}
                    className="h-6 w-6 p-0"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-sm font-medium mb-1 line-clamp-2">{selectedCitation.title}</p>
                <a
                  href={selectedCitation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline truncate block mb-2"
                >
                  {getDomain(selectedCitation.url)}
                </a>
                {selectedCitation.snippet && (
                  <p className="text-xs text-muted-foreground line-clamp-4">
                    {selectedCitation.snippet}
                  </p>
                )}
                {/* Full Open Link Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenExternal(selectedCitation.url)}
                  className="w-full mt-3 gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open Full Article
                </Button>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </aside>
  );
};
