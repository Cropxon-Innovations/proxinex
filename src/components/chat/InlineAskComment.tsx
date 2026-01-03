import { useState } from "react";
import { 
  MessageSquare, 
  Sparkles, 
  Maximize2, 
  X,
  CheckCircle,
  AlertTriangle,
  MessageCircle
} from "lucide-react";

interface ConversationEntry {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

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
  conversationHistory?: ConversationEntry[];
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

  const exchangeCount = data.conversationHistory 
    ? Math.floor(data.conversationHistory.length / 2)
    : 1;

  if (isMinimized) {
    // Show as inline highlight marker
    return (
      <span
        className="relative inline cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onMaximize(data)}
      >
        <span className="bg-yellow-400/30 dark:bg-yellow-500/20 border-b-2 border-yellow-500 px-0.5 rounded">
          <MessageSquare className="inline h-3 w-3 text-yellow-600 dark:text-yellow-500 mr-0.5" />
        </span>
        
        {/* Hover Preview Tooltip */}
        {isHovered && (
          <div className="absolute z-50 left-0 top-full mt-1 w-72 p-3 bg-card border border-border rounded-lg shadow-xl animate-scale-in">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Inline Ask</span>
              <span className={`text-xs ${getConfidenceColor()}`}>
                {data.confidence}%
              </span>
              {exchangeCount > 1 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {exchangeCount} exchanges
                </span>
              )}
            </div>
            
            {/* Selected text preview */}
            <div className="text-xs text-muted-foreground mb-2 p-1.5 bg-yellow-500/10 rounded border border-yellow-500/30 line-clamp-1 italic">
              "{data.selectedText}"
            </div>
            
            <p className="text-xs text-muted-foreground mb-1 italic">
              Q: {data.question}
            </p>
            <p className="text-xs text-foreground line-clamp-3">
              {data.answer}
            </p>
            
            {exchangeCount > 1 && (
              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                + {exchangeCount - 1} more exchanges
              </div>
            )}
            
            <div className="text-xs text-primary mt-2 flex items-center gap-1">
              <Maximize2 className="h-3 w-3" />
              Click to expand full conversation
            </div>
          </div>
        )}
      </span>
    );
  }

  // Maximized view with full conversation
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-[520px] max-h-[80vh] bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">Inline Ask Details</span>
            {exchangeCount > 1 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {exchangeCount} exchanges
              </span>
            )}
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

        {/* Selected Text - Yellow highlight */}
        <div className="p-4 border-b border-border bg-yellow-500/10">
          <div className="text-xs text-muted-foreground mb-1">Selected Text</div>
          <p className="text-sm text-foreground italic">
            "{data.selectedText}"
          </p>
        </div>

        {/* Conversation History or Single Q&A */}
        {data.conversationHistory && data.conversationHistory.length > 0 ? (
          <div className="max-h-80 overflow-y-auto p-4 space-y-3">
            {data.conversationHistory.map((entry, idx) => (
              <div
                key={idx}
                className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    entry.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  {entry.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
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
          </>
        )}

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

// Component to render highlighted text with inline ask markers
interface HighlightedTextProps {
  text: string;
  inlineAsks: InlineAskData[];
  onInlineAskClick: (data: InlineAskData) => void;
}

export const HighlightedText = ({ text, inlineAsks, onInlineAskClick }: HighlightedTextProps) => {
  if (inlineAsks.length === 0) {
    return <>{text}</>;
  }

  // Sort by start offset to process in order
  const sortedAsks = [...inlineAsks].sort((a, b) => a.startOffset - b.startOffset);
  
  const segments: React.ReactNode[] = [];
  let lastEnd = 0;

  sortedAsks.forEach((ask, idx) => {
    // Add text before this highlight
    if (ask.startOffset > lastEnd) {
      segments.push(
        <span key={`text-${idx}`}>{text.slice(lastEnd, ask.startOffset)}</span>
      );
    }

    // Add highlighted segment with inline ask marker
    segments.push(
      <HighlightedSegment
        key={`highlight-${idx}`}
        text={ask.selectedText}
        data={ask}
        onClick={() => onInlineAskClick(ask)}
      />
    );

    lastEnd = ask.endOffset;
  });

  // Add remaining text
  if (lastEnd < text.length) {
    segments.push(
      <span key="text-end">{text.slice(lastEnd)}</span>
    );
  }

  return <>{segments}</>;
};

interface HighlightedSegmentProps {
  text: string;
  data: InlineAskData;
  onClick: () => void;
}

const HighlightedSegment = ({ text, data, onClick }: HighlightedSegmentProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getConfidenceColor = () => {
    if (data.confidence >= 80) return "text-green-500";
    if (data.confidence >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const exchangeCount = data.conversationHistory 
    ? Math.floor(data.conversationHistory.length / 2)
    : 1;

  return (
    <span
      className="relative inline cursor-pointer bg-yellow-400/30 dark:bg-yellow-500/20 border-b-2 border-yellow-500 hover:bg-yellow-400/50 dark:hover:bg-yellow-500/30 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {text}
      <MessageSquare className="inline h-3 w-3 text-yellow-600 dark:text-yellow-500 ml-0.5" />
      
      {/* Tooltip on hover */}
      {isHovered && (
        <div className="absolute z-50 left-0 top-full mt-1 w-72 p-3 bg-card border border-border rounded-lg shadow-xl animate-scale-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-foreground">Inline Ask</span>
            <span className={`text-xs ${getConfidenceColor()}`}>
              {data.confidence}%
            </span>
            {exchangeCount > 1 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {exchangeCount}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1 italic">
            Q: {data.question}
          </p>
          <p className="text-xs text-foreground line-clamp-3">
            {data.answer}
          </p>
          <div className="text-xs text-primary mt-2 flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />
            Click to view full details
          </div>
        </div>
      )}
    </span>
  );
};