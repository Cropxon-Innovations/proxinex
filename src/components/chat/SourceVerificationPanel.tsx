import { useState, useEffect, useCallback } from "react";
import { 
  ExternalLink, 
  Globe, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  AlertCircle,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export interface VerifiedSource {
  id: string;
  title: string;
  url: string;
  domain?: string;
  snippet?: string;
  publishedDate?: string;
  lastVerified?: string;
  accuracyScore?: number;
  livenessStatus?: "live" | "stale" | "offline" | "checking";
  trustScore?: number;
  citationCount?: number;
}

interface SourceVerificationPanelProps {
  sources: VerifiedSource[];
  selectedSourceId?: string | null;
  onSelectSource?: (source: VerifiedSource) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}

export const SourceVerificationPanel = ({
  sources: initialSources,
  selectedSourceId,
  onSelectSource,
  isCollapsed = false,
  onToggleCollapse,
  onClose,
}: SourceVerificationPanelProps) => {
  const [sources, setSources] = useState<VerifiedSource[]>(initialSources);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(selectedSourceId || null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  // Filtering state
  const [livenessFilter, setLivenessFilter] = useState<string>("all");
  const [accuracyThreshold, setAccuracyThreshold] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  // Sync sources when prop changes
  useEffect(() => {
    setSources(initialSources);
  }, [initialSources]);

  // Auto-expand selected source
  useEffect(() => {
    if (selectedSourceId) {
      setExpandedSourceId(selectedSourceId);
    }
  }, [selectedSourceId]);

  // Real-time URL verification
  const verifyUrl = useCallback(async (url: string): Promise<"live" | "stale" | "offline"> => {
    try {
      // Use a HEAD request via a proxy or direct fetch with no-cors
      // Since we can't directly ping URLs due to CORS, we simulate verification
      // In production, this would call a backend endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        // Attempt to fetch with no-cors mode (won't give us status but confirms reachability)
        await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return "live";
      } catch (fetchError) {
        clearTimeout(timeoutId);
        // Check if it was aborted (timeout)
        if (controller.signal.aborted) {
          return "stale";
        }
        return "offline";
      }
    } catch (error) {
      return "offline";
    }
  }, []);

  const verifyAllSources = useCallback(async () => {
    if (isVerifying || sources.length === 0) return;
    
    setIsVerifying(true);
    setVerificationProgress(0);
    
    // Set all to checking state
    setSources(prev => prev.map(s => ({ ...s, livenessStatus: "checking" as const })));
    
    const verifiedSources = [...sources];
    
    for (let i = 0; i < verifiedSources.length; i++) {
      const source = verifiedSources[i];
      const status = await verifyUrl(source.url);
      
      verifiedSources[i] = {
        ...source,
        livenessStatus: status,
        lastVerified: new Date().toISOString(),
      };
      
      // Update progress
      setVerificationProgress(Math.round(((i + 1) / verifiedSources.length) * 100));
      
      // Update sources incrementally
      setSources([...verifiedSources]);
    }
    
    setIsVerifying(false);
  }, [sources, isVerifying, verifyUrl]);

  // Auto-verify on mount
  useEffect(() => {
    if (initialSources.length > 0 && !isVerifying) {
      // Delay to avoid blocking UI
      const timer = setTimeout(() => {
        verifyAllSources();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [initialSources.length]);

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
        return <CheckCircle2 className="h-3 w-3 text-success" />;
      case "stale":
        return <AlertCircle className="h-3 w-3 text-warning" />;
      case "offline":
        return <XCircle className="h-3 w-3 text-destructive" />;
      case "checking":
        return <Loader2 className="h-3 w-3 text-primary animate-spin" />;
      default:
        return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getLivenessLabel = (status?: string) => {
    switch (status) {
      case "live":
        return "Live";
      case "stale":
        return "Slow";
      case "offline":
        return "Offline";
      case "checking":
        return "Checking...";
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
      case "checking":
        return "text-primary bg-primary/10";
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

  // Filter sources
  const filteredSources = sources.filter(source => {
    // Liveness filter
    if (livenessFilter !== "all" && source.livenessStatus !== livenessFilter) {
      return false;
    }
    // Accuracy threshold filter
    if ((source.accuracyScore || 0) < accuracyThreshold) {
      return false;
    }
    return true;
  });

  // Calculate overall stats
  const avgAccuracy = sources.length > 0 
    ? Math.round(sources.reduce((acc, s) => acc + (s.accuracyScore || 0), 0) / sources.length)
    : 0;
  const liveCount = sources.filter(s => s.livenessStatus === "live").length;
  const staleCount = sources.filter(s => s.livenessStatus === "stale").length;
  const offlineCount = sources.filter(s => s.livenessStatus === "offline").length;

  if (sources.length === 0) {
    return null;
  }

  const handleSourceClick = (source: VerifiedSource) => {
    setExpandedSourceId(expandedSourceId === source.id ? null : source.id);
    onSelectSource?.(source);
  };

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
                {filteredSources.length}/{sources.length}
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
          {/* Verification Progress */}
          {isVerifying && (
            <div className="px-3 py-2 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <Loader2 className="h-3 w-3 text-primary animate-spin" />
                <span className="text-xs text-primary">Verifying sources...</span>
                <span className="text-xs text-muted-foreground ml-auto">{verificationProgress}%</span>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${verificationProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="p-3 border-b border-border bg-secondary/20">
            <div className="grid grid-cols-2 gap-3 mb-3">
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
                  <p className="text-[10px] text-muted-foreground uppercase">Status</p>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-success">{liveCount}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-warning">{staleCount}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-destructive">{offlineCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  verifyAllSources();
                }}
                disabled={isVerifying}
                className="flex-1 h-7 text-xs gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${isVerifying ? "animate-spin" : ""}`} />
                Re-verify
              </Button>
              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilters(!showFilters);
                }}
                className="h-7 text-xs gap-1"
              >
                <Filter className="h-3 w-3" />
                Filter
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-3 border-b border-border bg-secondary/10 space-y-3">
              {/* Liveness Filter */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Liveness Status</label>
                <Select value={livenessFilter} onValueChange={setLivenessFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="live">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        Live only
                      </span>
                    </SelectItem>
                    <SelectItem value="stale">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-warning" />
                        Slow only
                      </span>
                    </SelectItem>
                    <SelectItem value="offline">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-3 w-3 text-destructive" />
                        Offline only
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Accuracy Threshold */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-muted-foreground">Min Accuracy</label>
                  <span className="text-xs font-medium">{accuracyThreshold}%</span>
                </div>
                <Slider
                  value={[accuracyThreshold]}
                  onValueChange={(value) => setAccuracyThreshold(value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Clear Filters */}
              {(livenessFilter !== "all" || accuracyThreshold > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLivenessFilter("all");
                    setAccuracyThreshold(0);
                  }}
                  className="w-full h-7 text-xs"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Source List */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-2 space-y-2">
              {filteredSources.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No sources match your filters
                </div>
              ) : (
                filteredSources.map((source) => (
                  <div
                    key={source.id}
                    className={`rounded-lg border overflow-hidden transition-all ${
                      selectedSourceId === source.id || expandedSourceId === source.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card/50 hover:border-primary/30"
                    }`}
                  >
                    {/* Source Header */}
                    <button
                      onClick={() => handleSourceClick(source)}
                      className="w-full text-left p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        {/* Citation Number */}
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {parseInt(source.id) + 1}
                        </span>
                        
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
                      <div className="flex items-center gap-3 mt-2 ml-8">
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
                          <p className="text-xs text-muted-foreground line-clamp-4 bg-secondary/30 p-2 rounded">
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
                ))
              )}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
