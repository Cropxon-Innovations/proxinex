import { useState } from "react";
import { 
  ExternalLink, 
  Calendar, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Globe,
  FileText,
  Eye
} from "lucide-react";

export interface Citation {
  id: number;
  title: string;
  url: string;
  published_date?: string;
  score?: number;
  snippet?: string;
}

interface EnhancedCitationTooltipProps {
  citation: Citation;
  onPreviewClick?: (citationId: string) => void;
}

const getDomainFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
};

const getReliabilityInfo = (score?: number) => {
  if (!score) return { label: "Unknown", icon: Shield, color: "text-muted-foreground", bg: "bg-muted/50" };
  if (score >= 80) return { label: "High Reliability", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" };
  if (score >= 50) return { label: "Moderate", icon: Shield, color: "text-amber-500", bg: "bg-amber-500/10" };
  return { label: "Low Reliability", icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10" };
};

const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
};

export const EnhancedCitationTooltip = ({ citation, onPreviewClick }: EnhancedCitationTooltipProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const domain = getDomainFromUrl(citation.url);
  const reliability = getReliabilityInfo(citation.score);
  const ReliabilityIcon = reliability.icon;
  const faviconUrl = getFaviconUrl(citation.url);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClicked(!isClicked);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreviewClick?.(String(citation.id - 1));
    setIsClicked(false);
  };

  const handleVisitSource = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(citation.url, "_blank", "noopener,noreferrer");
  };

  const showTooltip = isHovered || isClicked;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Citation Badge */}
      <sup
        onClick={handleClick}
        className="cursor-pointer inline-flex items-center justify-center w-5 h-5 ml-0.5 text-[10px] font-bold rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200"
      >
        {citation.id}
      </sup>

      {/* Enhanced Tooltip */}
      {showTooltip && (
        <div 
          className="absolute z-50 left-0 top-7 w-80 animate-in fade-in slide-in-from-top-2 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-popover text-popover-foreground rounded-xl shadow-xl border border-border overflow-hidden">
            {/* Header with Favicon */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-start gap-3">
                {faviconUrl && (
                  <img 
                    src={faviconUrl} 
                    alt="" 
                    className="w-6 h-6 rounded flex-shrink-0 mt-0.5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                    {citation.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{domain}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Snippet Preview */}
            {citation.snippet && (
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground line-clamp-3 italic">
                    "{citation.snippet}"
                  </p>
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div className="p-3 space-y-2">
              {/* Reliability Badge */}
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${reliability.bg}`}>
                <ReliabilityIcon className={`h-3 w-3 ${reliability.color}`} />
                <span className={reliability.color}>{reliability.label}</span>
                {citation.score && (
                  <span className={`font-medium ${reliability.color}`}>
                    ({citation.score}%)
                  </span>
                )}
              </div>

              {/* Date */}
              {citation.published_date && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Published: {new Date(citation.published_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-3 pt-0 flex gap-2">
              {onPreviewClick && (
                <button
                  onClick={handlePreviewClick}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
              )}
              <button
                onClick={handleVisitSource}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Visit Source
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};
