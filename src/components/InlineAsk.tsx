import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Send, 
  Star, 
  Clock, 
  DollarSign, 
  ExternalLink,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { streamChat, Message } from "@/lib/chat";
import { useToast } from "@/hooks/use-toast";

interface InlineAskProps {
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
  onAskComplete?: (question: string, answer: string) => void;
}

export const InlineAsk = ({ selectedText, position, onClose, onAskComplete }: InlineAskProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAsk = async () => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setAnswer("");

    const messages: Message[] = [
      { 
        role: "user", 
        content: `I have highlighted the following text:\n\n"${selectedText}"\n\nMy question about this text: ${question}` 
      }
    ];

    await streamChat({
      messages,
      type: "inline_ask",
      onDelta: (delta) => setAnswer(prev => prev + delta),
      onDone: () => {
        setIsLoading(false);
        onAskComplete?.(question, answer);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        setIsLoading(false);
      },
    });
  };

  return (
    <div 
      className="fixed z-50 bg-card border border-border rounded-lg shadow-xl p-4 w-80 animate-scale-in"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 340), 
        top: position.y + 10 
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Inline Ask™</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Selected Text Preview */}
      <div className="text-xs text-muted-foreground mb-3 p-2 bg-secondary/50 rounded border border-border line-clamp-2">
        "{selectedText}"
      </div>

      {/* Question Input */}
      <div className="flex gap-2 mb-3">
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask about this..."
          className="flex-1 px-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button 
          size="sm" 
          onClick={handleAsk}
          disabled={!question.trim() || isLoading}
          className="bg-primary text-primary-foreground"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Answer */}
      {(answer || isLoading) && (
        <div className="text-sm text-foreground bg-secondary/30 rounded-lg p-3 max-h-40 overflow-y-auto">
          {answer || (
            <span className="text-muted-foreground animate-pulse">Thinking...</span>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {!answer && !isLoading && (
        <div className="flex flex-wrap gap-1">
          {["Explain simpler", "Give example", "Verify fact"].map((action) => (
            <button
              key={action}
              onClick={() => {
                setQuestion(action);
                setTimeout(handleAsk, 100);
              }}
              className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Hook for text selection
export const useTextSelection = () => {
  const [selection, setSelection] = useState<{
    text: string;
    position: { x: number; y: number };
  } | null>(null);

  const handleMouseUp = useCallback(() => {
    const selectedText = window.getSelection()?.toString().trim();
    
    if (selectedText && selectedText.length > 3) {
      const range = window.getSelection()?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelection({
          text: selectedText,
          position: { x: rect.left, y: rect.bottom }
        });
      }
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return { selection, handleMouseUp, clearSelection };
};
