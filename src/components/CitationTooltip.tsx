import { useState } from "react";
import { ExternalLink, Calendar } from "lucide-react";

export interface Citation {
  id: number;
  title: string;
  url: string;
  published_date?: string;
  score?: number;
}

interface CitationTooltipProps {
  citation: Citation;
}

export const CitationTooltip = ({ citation }: CitationTooltipProps) => {
  const [open, setOpen] = useState(false);

  return (
    <sup
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(!open)}
      className="relative cursor-pointer text-primary font-semibold ml-0.5 hover:text-primary/80 transition-colors"
    >
      {citation.id}

      {open && (
        <div className="absolute z-50 top-6 left-0 w-72 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border p-3 animate-fade-in">
          <div className="font-semibold text-foreground mb-1 line-clamp-2">
            {citation.title}
          </div>

          {citation.published_date && (
            <div className="flex items-center gap-1 text-muted-foreground mb-2">
              <Calendar className="h-3 w-3" />
              <span>{new Date(citation.published_date).toLocaleDateString()}</span>
            </div>
          )}

          {citation.score !== undefined && (
            <div className="text-muted-foreground mb-2">
              Relevance: {citation.score}%
            </div>
          )}

          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            View source
          </a>
        </div>
      )}
    </sup>
  );
};
