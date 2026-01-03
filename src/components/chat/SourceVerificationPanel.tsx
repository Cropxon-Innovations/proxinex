import { useState } from "react";
import { 
  ExternalLink, 
  Globe, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface VerifiedSource {
  id: string;
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  publishedDate?: string;
  lastVerified?: string;
  accuracyScore?: number;
  livenessStatus?: "live" | "stale" | "offline";
  trustScore?: number;
  citationCount?: number;
}

interface SourceVerificationPanelProps {
  sources: VerifiedSource[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}

export const SourceVerificationPanel = ({
  sources,
  isCollapsed = false,
  onToggleCollapse,
  onClose,
}: SourceVerificationPanelProps) => {
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

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

  const getLivenessIcon = (status?: string) => {
    switch (status) {
      case "live":
        return <Activity className="h-3 w-3 text-success" />;
      case "stale":
        return <AlertCircle className="h-3 w-3 text-warning" />;
      case "offline":
        return <ShieldAlert className="h-3 w-3 text-destructive" />;
      default:
        return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getLivenessLabel = (status?: string) => {
    switch (status) {
      case "live":
        return "Live";
      case "stale":
        return "Stale";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const getLivenessColor = (status?: string) => {
    switch (status) {
      case "live":
        return "text-success bg-success/10";
      case "stale":
        return "text-warning bg-warning/10";
      case "offline":
        return "text-destructive bg-destructive/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getProgressColor = (score?: number) => {
    if (!score) return "bg-muted";
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return "";
    }
  };

  // Calculate overall stats
  const avgAccuracy = sources.length > 0 
    ? Math.round(sources.reduce((acc, s) => acc + (s.accuracyScore || 0), 0) / sources.length)
    : 0;
  const liveCount = sources.filter(s => s.livenessStatus === "live").length;

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <Collapsible open={!isCollapsed} onOpenChange={() => onToggleCollapse?.()}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-3 border-b border-border hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Verified Sources</span>
              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {sources.length}
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
          {/* Summary Stats */}
          <div className="p-3 border-b border-border bg-secondary/20">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-success/10">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Avg Accuracy</p>
                  <p className={`text-sm font-semibold ${getScoreColor(avgAccuracy)}`}>
                    {avgAccuracy}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Live Sources</p>
                  <p className="text-sm font-semibold text-foreground">
                    {liveCount}/{sources.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Source List */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-2 space-y-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-lg border border-border bg-card/50 overflow-hidden transition-all hover:border-primary/30"
                >
                  {/* Source Header */}
                  <button
                    onClick={() => setExpandedSourceId(
                      expandedSourceId === source.id ? null : source.id
                    )}
                    className="w-full text-left p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">
                            {source.domain || getDomain(source.url)}
                          </span>
                          {/* Liveness Badge */}
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${getLivenessColor(source.livenessStatus)}`}>
                            {getLivenessIcon(source.livenessStatus)}
                            {getLivenessLabel(source.livenessStatus)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {source.title}
                        </p>
                      </div>
                      {expandedSourceId === source.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>

                    {/* Quick Stats Row */}
                    <div className="flex items-center gap-3 mt-2">
                      {/* Accuracy Score */}
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3 w-3 text-muted-foreground" />
                        <span className={`text-xs font-medium ${getScoreColor(source.accuracyScore)}`}>
                          {source.accuracyScore || 0}%
                        </span>
                      </div>
                      {/* Published Date */}
                      {source.publishedDate && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{getRelativeTime(source.publishedDate)}</span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedSourceId === source.id && (
                    <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border mt-0">
                      {/* Accuracy Progress */}
                      <div className="pt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">Accuracy Score</span>
                          <span className={`text-xs font-semibold ${getScoreColor(source.accuracyScore)}`}>
                            {source.accuracyScore || 0}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${getProgressColor(source.accuracyScore)}`}
                            style={{ width: `${source.accuracyScore || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Trust Score */}
                      {source.trustScore !== undefined && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">Trust Score</span>
                            <span className={`text-xs font-semibold ${getScoreColor(source.trustScore)}`}>
                              {source.trustScore}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${getProgressColor(source.trustScore)}`}
                              style={{ width: `${source.trustScore}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Date Info */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-secondary/50">
                          <p className="text-muted-foreground mb-0.5">Published</p>
                          <p className="font-medium text-foreground">
                            {formatDate(source.publishedDate)}
                          </p>
                        </div>
                        <div className="p-2 rounded bg-secondary/50">
                          <p className="text-muted-foreground mb-0.5">Last Verified</p>
                          <p className="font-medium text-foreground">
                            {formatDate(source.lastVerified)}
                          </p>
                        </div>
                      </div>

                      {/* Snippet */}
                      {source.snippet && (
                        <p className="text-xs text-muted-foreground line-clamp-3 bg-secondary/30 p-2 rounded">
                          {source.snippet}
                        </p>
                      )}

                      {/* Open External Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenExternal(source.url);
                        }}
                        className="w-full gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open Source
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
