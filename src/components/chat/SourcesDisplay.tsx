import { ExternalLink, Globe, Clock, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface Source {
  id: number;
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  publishedDate?: string;
  reliability?: "high" | "medium" | "low";
}

interface SourcesDisplayProps {
  sources: Source[];
  inline?: boolean;
}

const getDomainFromUrl = (url: string) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
};

const getReliabilityColor = (reliability?: string) => {
  switch (reliability) {
    case "high":
      return "text-success";
    case "medium":
      return "text-warning";
    case "low":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
};

export const SourcesDisplay = ({ sources, inline = false }: SourcesDisplayProps) => {
  const [expanded, setExpanded] = useState(false);
  const displaySources = expanded ? sources : sources.slice(0, 3);

  if (inline) {
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {sources.map((source) => (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-secondary/50 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-primary font-medium">[{source.id}]</span>
            <span className="truncate max-w-[100px]">{getDomainFromUrl(source.url)}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          Sources ({sources.length})
        </h4>
        {sources.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="h-3 w-3 ml-1" />
              </>
            ) : (
              <>
                Show all <ChevronDown className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {displaySources.map((source) => (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    [{source.id}]
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {source.domain || getDomainFromUrl(source.url)}
                  </span>
                  {source.reliability && (
                    <span className={`text-xs flex items-center gap-1 ${getReliabilityColor(source.reliability)}`}>
                      <Shield className="h-3 w-3" />
                      {source.reliability}
                    </span>
                  )}
                </div>
                <h5 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {source.title}
                </h5>
                {source.snippet && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {source.snippet}
                  </p>
                )}
                {source.publishedDate && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {source.publishedDate}
                  </div>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
