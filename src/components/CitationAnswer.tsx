import { FormattedAnswer } from "./FormattedAnswer";
import { SourceVerificationLoader } from "./SourceVerificationLoader";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { Citation } from "./EnhancedCitationTooltip";
import { 
  ExternalLink, 
  AlertTriangle, 
  Info, 
  Globe, 
  ShieldCheck, 
  BookOpen,
  Sparkles
} from "lucide-react";

interface CitationAnswerProps {
  answer: string;
  confidence: number;
  confidence_label: string;
  citations: Citation[];
  isLoading?: boolean;
  showVerification?: boolean;
}

export const CitationAnswer = ({
  answer,
  confidence,
  confidence_label,
  citations,
  isLoading,
  showVerification = false,
}: CitationAnswerProps) => {
  const hasCitations = citations.length > 0;
  const isLowConfidence = confidence < 40;
  const isGeneralKnowledge = confidence >= 80 && !hasCitations;

  // Show verification loader when loading
  if (isLoading && !answer) {
    return (
      <SourceVerificationLoader 
        sources={citations.map(c => c.title).slice(0, 5)} 
        isComplete={false}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Answer Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium">AI-Generated Answer</span>
        {hasCitations && (
          <>
            <span className="text-border">•</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-emerald-500">{citations.length} sources verified</span>
          </>
        )}
      </div>

      {/* Answer Content */}
      <div className="bg-card border border-border rounded-xl p-6">
        <FormattedAnswer
          answer={answer}
          citations={citations}
          isLoading={isLoading}
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

      {/* Citation Cards - Enhanced */}
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
                <a
                  key={citation.id}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/20 transition-all"
                >
                  {/* Citation Number Badge */}
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {citation.id}
                  </span>
                  
                  <div className="flex-1 min-w-0">
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
                  
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </a>
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
