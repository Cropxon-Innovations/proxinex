import { AnswerWithCitations } from "./AnswerWithCitations";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { Citation } from "./CitationTooltip";
import { ExternalLink, AlertTriangle, Info } from "lucide-react";

interface CitationAnswerProps {
  answer: string;
  confidence: number;
  confidence_label: string;
  citations: Citation[];
  isLoading?: boolean;
}

export const CitationAnswer = ({
  answer,
  confidence,
  confidence_label,
  citations,
  isLoading,
}: CitationAnswerProps) => {
  const hasCitations = citations.length > 0;
  const isLowConfidence = confidence < 40;
  const isGeneralKnowledge = confidence >= 80 && !hasCitations;

  return (
    <div className="space-y-4">
      {/* Answer Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        <AnswerWithCitations
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
            <div className="text-xs text-muted-foreground">
              {citations.length} source{citations.length !== 1 ? "s" : ""} verified
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

      {/* Citation Cards */}
      {!isLoading && hasCitations && (
        <div className="flex flex-wrap gap-2">
          {citations.map((citation) => (
            <a
              key={citation.id}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
            >
              <span className="font-medium text-primary">[{citation.id}]</span>
              <span className="max-w-[200px] truncate">{citation.title}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          ))}
        </div>
      )}

      {/* Low Confidence Warning */}
      {!isLoading && isLowConfidence && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">
            Low confidence answer. The available sources may not fully address your question.
            Consider rephrasing or verifying with additional research.
          </p>
        </div>
      )}

      {/* No Citations Explanation */}
      {!isLoading && !hasCitations && !isLowConfidence && !isGeneralKnowledge && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            No citations available for this response. This may be based on general knowledge
            or the query did not require external sources.
          </p>
        </div>
      )}
    </div>
  );
};
