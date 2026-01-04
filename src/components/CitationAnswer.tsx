import { FormattedAnswer } from "./FormattedAnswer";
import { SourceVerificationLoader } from "./SourceVerificationLoader";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { Citation } from "./EnhancedCitationTooltip";
import { ChatReadAloud } from "./chat/ChatReadAloud";
import { 
  ExternalLink, 
  AlertTriangle, 
  Info, 
  Globe, 
  ShieldCheck, 
  BookOpen,
  Sparkles,
  Eye,
  PanelRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CitationAnswerProps {
  answer: string;
  confidence: number;
  confidence_label: string;
  citations: Citation[];
  isLoading?: boolean;
  showVerification?: boolean;
  onOpenLinkPreview?: (url: string, title?: string) => void;
  onCitationClick?: (citationId: string) => void;
  onViewSources?: () => void;
  messageIndex?: number;
  searchModes?: string[];
}

export const CitationAnswer = ({
  answer,
  confidence,
  confidence_label,
  citations,
  isLoading,
  showVerification = false,
  onOpenLinkPreview,
  onCitationClick,
  onViewSources,
  messageIndex,
  searchModes = [],
}: CitationAnswerProps) => {
  const hasCitations = citations.length > 0;
  const isLowConfidence = confidence < 40;
  const isGeneralKnowledge = confidence >= 80 && !hasCitations;
  
  const modeLabels: Record<string, { label: string; color: string; bg: string }> = {
    finance: { label: "Finance", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    academic: { label: "Academic", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    social: { label: "Social", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  };

  // Show verification loader when loading
  if (isLoading && !answer) {
    return (
      <SourceVerificationLoader 
        sources={citations.map(c => c.title)} 
        isComplete={false}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Mode Indicators */}
      {searchModes.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          {searchModes.map((mode) => {
            const modeInfo = modeLabels[mode];
            if (!modeInfo) return null;
            return (
              <span
                key={mode}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${modeInfo.bg} ${modeInfo.color}`}
              >
                {modeInfo.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Answer Header with TTS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium">AI-Generated Answer</span>
          {hasCitations && (
            <>
              <span className="text-border">•</span>
              {onViewSources ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={onViewSources}
                        className="inline-flex items-center gap-1 text-success hover:text-success/80 transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>{citations.length} sources verified</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Open verified sources panel</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-success" />
                  <span className="text-success">{citations.length} sources verified</span>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View Sources Button */}
          {hasCitations && onViewSources && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewSources}
                    className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary"
                  >
                    <PanelRight className="h-3.5 w-3.5" />
                    View Sources
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  View all verified sources in the panel
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* Text-to-Speech for Research Answers */}
          {!isLoading && answer && (
            <ChatReadAloud content={answer} />
          )}
        </div>
      </div>

      {/* Answer Content */}
      <div className="bg-card border border-border rounded-xl p-6">
        <FormattedAnswer
          answer={answer}
          citations={citations}
          isLoading={isLoading}
          onCitationClick={(id) => {
            onCitationClick?.(id);
            onViewSources?.();
          }}
        />
      </div>

      {/* Trust Bar */}
      {!isLoading && (
        <div className="flex flex-wrap items-center gap-3">
          <ConfidenceBadge score={confidence} label={confidence_label} />
          
          {hasCitations && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span>{citations.length} source{citations.length !== 1 ? "s" : ""} cited</span>
            </div>
          )}

          {isGeneralKnowledge && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>General knowledge</span>
            </div>
          )}
        </div>
      )}

      {/* Citation Cards - Enhanced with hover preview */}
      {!isLoading && hasCitations && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Globe className="h-3 w-3" />
            Sources Referenced
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {citations.map((citation) => {
              const domain = (() => {
                try {
                  return new URL(citation.url).hostname.replace("www.", "");
                } catch {
                  return citation.url;
                }
              })();

              return (
                <div
                  key={citation.id}
                  className="group flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/20 transition-all text-left w-full relative"
                >
                  <button
                    onClick={() => {
                      onCitationClick?.(String(citation.id - 1));
                      onViewSources?.();
                    }}
                    className="absolute inset-0 z-0"
                  />
                  
                  {/* Citation Number Badge */}
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold flex items-center justify-center z-10">
                    {citation.id}
                  </span>
                  
                  <div className="flex-1 min-w-0 z-10 pointer-events-none">
                    <div className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {citation.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground truncate">{domain}</span>
                      {citation.score && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          citation.score >= 80 
                            ? "bg-emerald-500/10 text-emerald-500" 
                            : citation.score >= 50 
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {citation.score}%
                        </span>
                      )}
                    </div>
                    {citation.published_date && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(citation.published_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons on hover */}
                  <div className="flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCitationClick?.(String(citation.id - 1));
                              onViewSources?.();
                            }}
                            className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>View in panel</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(citation.url, "_blank", "noopener,noreferrer");
                            }}
                            className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Open in new tab</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Low Confidence Warning */}
      {!isLoading && isLowConfidence && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Low Confidence Answer</p>
            <p className="text-xs text-destructive/80 mt-1">
              The available sources may not fully address your question.
              Consider rephrasing or verifying with additional research.
            </p>
          </div>
        </div>
      )}

      {/* No Citations Explanation */}
      {!isLoading && !hasCitations && !isLowConfidence && !isGeneralKnowledge && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">No External Sources</p>
            <p className="text-xs text-muted-foreground mt-1">
              This response is based on general knowledge or the query did not require external sources.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
