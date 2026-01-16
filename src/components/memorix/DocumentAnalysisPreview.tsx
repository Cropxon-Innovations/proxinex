import { useState, useEffect } from "react";
import {
  FileText,
  User,
  Calendar,
  MapPin,
  DollarSign,
  Mail,
  Lightbulb,
  Tag,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DocumentAnalysis {
  summary?: string;
  keyPoints?: string[];
  extractedText?: string;
  documentType?: string;
  entities?: {
    names?: string[];
    dates?: string[];
    amounts?: string[];
    locations?: string[];
    contacts?: string[];
  };
  language?: string;
  sentiment?: string;
  actionItems?: string[];
}

interface DocumentAnalysisPreviewProps {
  source: {
    id: string;
    name: string;
    type: string;
    status: string;
    metadata?: DocumentAnalysis;
    progress: number;
  };
  isProcessing?: boolean;
  className?: string;
}

export const DocumentAnalysisPreview = ({
  source,
  isProcessing = false,
  className,
}: DocumentAnalysisPreviewProps) => {
  const [expanded, setExpanded] = useState(true);
  const [displayedText, setDisplayedText] = useState("");
  const [textProgress, setTextProgress] = useState(0);

  const analysis = source.metadata as DocumentAnalysis | undefined;

  // Simulate real-time text extraction animation
  useEffect(() => {
    if (isProcessing && analysis?.extractedText) {
      const text = analysis.extractedText;
      const totalLength = Math.min(text.length, 500);
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex < totalLength) {
          setDisplayedText(text.slice(0, currentIndex + 10));
          setTextProgress((currentIndex / totalLength) * 100);
          currentIndex += 10;
        } else {
          clearInterval(interval);
          setDisplayedText(text.slice(0, 500));
          setTextProgress(100);
        }
      }, 30);

      return () => clearInterval(interval);
    } else if (analysis?.extractedText) {
      setDisplayedText(analysis.extractedText.slice(0, 500));
      setTextProgress(100);
    }
  }, [isProcessing, analysis?.extractedText]);

  const getStatusIcon = () => {
    switch (source.status) {
      case "ready":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />;
    }
  };

  const getDocTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "invoice":
        return "bg-green-500/10 text-green-500 border-green-500/30";
      case "contract":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "report":
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "letter":
        return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden transition-all duration-300",
        isProcessing && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
        className
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {source.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {analysis?.documentType && (
                <Badge variant="outline" className={cn("text-[10px]", getDocTypeColor(analysis.documentType))}>
                  {analysis.documentType}
                </Badge>
              )}
              {analysis?.language && (
                <span className="text-[10px] text-muted-foreground">
                  {analysis.language}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {source.status === "processing" && (
            <div className="text-right">
              <p className="text-xs text-primary font-medium">{source.progress}%</p>
            </div>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Progress bar during processing */}
      {source.status === "processing" && (
        <div className="px-4 pb-2">
          <Progress value={source.progress} className="h-1" />
        </div>
      )}

      {/* Expanded Content */}
      {expanded && analysis && (
        <ScrollArea className="max-h-80">
          <div className="p-4 pt-0 space-y-4">
            {/* Summary */}
            {analysis.summary && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Lightbulb className="h-3 w-3" />
                  <span>Summary</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            )}

            {/* Key Points */}
            {analysis.keyPoints && analysis.keyPoints.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  <span>Key Points</span>
                </div>
                <ul className="space-y-1">
                  {analysis.keyPoints.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground animate-in fade-in slide-in-from-left-2"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <span className="text-primary mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Entities */}
            {analysis.entities && Object.values(analysis.entities).some((arr) => arr && arr.length > 0) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>Extracted Entities</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {analysis.entities.names && analysis.entities.names.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Names</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.entities.names.slice(0, 3).map((name, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.entities.dates && analysis.entities.dates.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Dates</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.entities.dates.slice(0, 3).map((date, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {date}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.entities.amounts && analysis.entities.amounts.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>Amounts</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.entities.amounts.slice(0, 3).map((amount, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {amount}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.entities.locations && analysis.entities.locations.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Locations</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.entities.locations.slice(0, 3).map((loc, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {loc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Extracted Text Preview */}
            {displayedText && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>Extracted Text</span>
                  </div>
                  {textProgress < 100 && (
                    <span className="text-[10px] text-primary">{Math.round(textProgress)}%</span>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed">
                    {displayedText}
                    {displayedText.length >= 500 && "..."}
                    {textProgress < 100 && (
                      <span className="inline-block w-1.5 h-3 bg-primary animate-pulse ml-0.5" />
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Action Items */}
            {analysis.actionItems && analysis.actionItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Action Items</span>
                </div>
                <ul className="space-y-1">
                  {analysis.actionItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="text-primary mt-0.5">☐</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sentiment */}
            {analysis.sentiment && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Tone:</span>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {analysis.sentiment}
                </Badge>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Empty state when no analysis yet */}
      {expanded && !analysis && source.status !== "processing" && (
        <div className="p-4 pt-0 text-center text-muted-foreground">
          <p className="text-xs">No analysis data available</p>
        </div>
      )}

      {/* Processing animation */}
      {expanded && source.status === "processing" && !analysis && (
        <div className="p-4 pt-0 space-y-3">
          {["Extracting text...", "Identifying entities...", "Analyzing content..."].map((stage, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div className="w-3 h-3 rounded-full bg-primary/30 animate-pulse" />
              <span>{stage}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
