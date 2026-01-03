import { useState, Fragment } from "react";
import { ExternalLink, Calendar, TrendingUp, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Citation {
  id: number;
  title: string;
  url: string;
  published_date?: string;
  score: number;
}

interface CitationAnswerProps {
  answer: string;
  confidence: number;
  confidence_label: string;
  citations: Citation[];
  isLoading?: boolean;
}

const superscriptMap: Record<string, number> = {
  "¹": 1, "²": 2, "³": 3, "⁴": 4, "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9,
};

const ConfidenceBadge = ({ confidence, label }: { confidence: number; label: string }) => {
  let bgColor = "bg-destructive/20";
  let textColor = "text-destructive";
  let Icon = AlertTriangle;

  if (confidence >= 80) {
    bgColor = "bg-green-500/20";
    textColor = "text-green-400";
    Icon = CheckCircle;
  } else if (confidence >= 60) {
    bgColor = "bg-yellow-500/20";
    textColor = "text-yellow-400";
    Icon = TrendingUp;
  } else if (confidence >= 40) {
    bgColor = "bg-orange-500/20";
    textColor = "text-orange-400";
    Icon = AlertCircle;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${bgColor} ${textColor}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-sm font-medium">{confidence}%</span>
      <span className="text-xs opacity-75">{label}</span>
    </div>
  );
};

const CitationMarker = ({ id, citation }: { id: number; citation?: Citation }) => {
  if (!citation) {
    return <sup className="text-xs text-muted-foreground">{id}</sup>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors align-super -mt-1 mx-0.5">
          {id}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-2">
              {citation.title}
            </h4>
            <div className="flex-shrink-0 text-xs text-muted-foreground">
              {citation.score}%
            </div>
          </div>
          
          {citation.published_date && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(citation.published_date).toLocaleDateString()}</span>
            </div>
          )}
          
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate"
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{citation.url}</span>
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const CitationAnswer = ({
  answer,
  confidence,
  confidence_label,
  citations,
  isLoading,
}: CitationAnswerProps) => {
  // Parse answer and replace citation markers with interactive components
  const renderAnswerWithCitations = () => {
    const parts: (string | JSX.Element)[] = [];
    let currentIndex = 0;
    let key = 0;

    // Match superscript numbers and bracketed numbers like [1], [2]
    const citationRegex = /([¹²³⁴⁵⁶⁷⁸⁹]+|\[\d+\])/g;
    let match;

    while ((match = citationRegex.exec(answer)) !== null) {
      // Add text before the citation
      if (match.index > currentIndex) {
        parts.push(answer.slice(currentIndex, match.index));
      }

      // Parse citation IDs
      const citationText = match[1];
      if (citationText.startsWith("[")) {
        // Handle [1] format
        const id = parseInt(citationText.slice(1, -1), 10);
        const citation = citations.find((c) => c.id === id);
        parts.push(<CitationMarker key={key++} id={id} citation={citation} />);
      } else {
        // Handle superscript format (¹²³)
        for (const char of citationText) {
          const id = superscriptMap[char];
          if (id) {
            const citation = citations.find((c) => c.id === id);
            parts.push(<CitationMarker key={key++} id={id} citation={citation} />);
          }
        }
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < answer.length) {
      parts.push(answer.slice(currentIndex));
    }

    return parts;
  };

  return (
    <div className="space-y-4">
      {/* Answer Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
          {renderAnswerWithCitations()}
          {isLoading && (
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
          )}
        </div>
      </div>

      {/* Trust Bar */}
      {!isLoading && (
        <div className="flex flex-wrap items-center gap-3">
          <ConfidenceBadge confidence={confidence} label={confidence_label} />
          
          {citations.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {citations.length} source{citations.length !== 1 ? "s" : ""} verified
            </div>
          )}
        </div>
      )}

      {/* Citation Cards */}
      {!isLoading && citations.length > 0 && (
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
      {!isLoading && confidence < 40 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">
            Low confidence answer. The available sources may not fully address your question.
            Consider rephrasing or verifying with additional research.
          </p>
        </div>
      )}
    </div>
  );
};
