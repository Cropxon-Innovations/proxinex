import { useState } from "react";
import { 
  MessageSquare, 
  Sparkles, 
  Maximize2, 
  X,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export interface InlineAskData {
  id: string;
  selectedText: string;
  question: string;
  answer: string;
  confidence: number;
  timestamp: Date;
  messageIndex: number;
  startOffset: number;
  endOffset: number;
}

interface InlineAskCommentProps {
  data: InlineAskData;
  onMaximize: (data: InlineAskData) => void;
  onClose?: () => void;
  isMinimized?: boolean;
}

export const InlineAskComment = ({ 
  data, 
  onMaximize, 
  onClose,
  isMinimized = true 
}: InlineAskCommentProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getConfidenceColor = () => {
    if (data.confidence >= 80) return "text-green-500";
    if (data.confidence >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (isMinimized) {
    // Show as inline highlight marker
    return (
      <span
        className="relative inline cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onMaximize(data)}
      >
        <span className="bg-primary/20 border-b-2 border-primary px-0.5 rounded">
          <MessageSquare className="inline h-3 w-3 text-primary mr-0.5" />
        </span>
        
        {/* Hover Preview */}
        {isHovered && (
          <div className="absolute z-50 left-0 top-full mt-1 w-64 p-3 bg-card border border-border rounded-lg shadow-xl animate-scale-in">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Inline Ask</span>
              <span className={`text-xs ${getConfidenceColor()}`}>
                {data.confidence}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-1 italic">
              Q: {data.question}
            </p>
            <p className="text-xs text-foreground line-clamp-3">
              {data.answer}
            </p>
            <div className="text-xs text-primary mt-2 flex items-center gap-1">
              <Maximize2 className="h-3 w-3" />
              Click to expand
            </div>
          </div>
        )}
      </span>
    );
  }

  // Maximized view
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-[480px] max-h-[80vh] bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Inline Ask Details</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm px-2 py-0.5 rounded-full ${
              data.confidence >= 80 ? "bg-green-500/20 text-green-500" :
              data.confidence >= 60 ? "bg-yellow-500/20 text-yellow-500" :
              "bg-red-500/20 text-red-500"
            }`}>
              {data.confidence}% confidence
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Selected Text */}
        <div className="p-4 border-b border-border bg-secondary/20">
          <div className="text-xs text-muted-foreground mb-1">Selected Text</div>
          <p className="text-sm text-foreground italic">
            "{data.selectedText}"
          </p>
        </div>

        {/* Question */}
        <div className="p-4 border-b border-border">
          <div className="text-xs text-muted-foreground mb-1">Your Question</div>
          <p className="text-sm text-foreground">{data.question}</p>
        </div>

        {/* Answer */}
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="text-xs text-muted-foreground mb-1">Answer</div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {data.answer}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20 text-xs text-muted-foreground">
          <span>
            {data.timestamp.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            {data.confidence >= 80 ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                High confidence
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                Review recommended
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
