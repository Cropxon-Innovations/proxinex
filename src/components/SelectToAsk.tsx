import { useState, useCallback } from "react";
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  Link2, 
  Pencil,
  X,
  Loader2,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ActionType = "ask" | "explain" | "verify" | "sources" | "rewrite";
type RewriteStyle = "shorter" | "formal" | "technical" | "friendly";

interface SelectToAskProps {
  selectedText: string;
  position: { x: number; y: number };
  fullContext?: string;
  onClose: () => void;
}

interface ActionResult {
  answer: string;
  confidence: number;
  citations?: Array<{ id: number; title: string; url: string; published_date?: string }>;
  verified?: boolean;
  verification_status?: "verified" | "partially_supported" | "not_supported" | "insufficient_evidence";
  uses_sources?: boolean;
}

const actions = [
  { id: "ask" as ActionType, label: "Ask Proxinex", icon: Sparkles },
  { id: "explain" as ActionType, label: "Explain", icon: BookOpen },
  { id: "verify" as ActionType, label: "Verify", icon: CheckCircle },
  { id: "sources" as ActionType, label: "Sources", icon: Link2 },
  { id: "rewrite" as ActionType, label: "Rewrite", icon: Pencil },
];

const rewriteStyles: { id: RewriteStyle; label: string }[] = [
  { id: "shorter", label: "Shorter" },
  { id: "formal", label: "More formal" },
  { id: "technical", label: "More technical" },
  { id: "friendly", label: "More friendly" },
];

export const SelectToAsk = ({ selectedText, position, fullContext, onClose }: SelectToAskProps) => {
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [askQuestion, setAskQuestion] = useState("");
  const { toast } = useToast();

  const handleAction = async (action: ActionType, rewriteStyle?: RewriteStyle) => {
    if (action === "ask" && !askQuestion.trim()) return;
    
    setActiveAction(action);
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("text-action", {
        body: {
          selected_text: selectedText,
          full_answer_context: fullContext,
          action,
          user_query: action === "ask" ? askQuestion : undefined,
          rewrite_style: rewriteStyle,
        },
      });

      if (error) throw error;
      setResult(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process action",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationIcon = () => {
    if (!result?.verification_status) return null;
    switch (result.verification_status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "partially_supported":
        return <TrendingUp className="h-5 w-5 text-yellow-500" />;
      case "not_supported":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getVerificationLabel = () => {
    if (!result?.verification_status) return null;
    switch (result.verification_status) {
      case "verified":
        return "Verified";
      case "partially_supported":
        return "Partially Supported";
      case "not_supported":
        return "Not Supported";
      default:
        return "Insufficient Evidence";
    }
  };

  const getConfidenceColor = () => {
    if (!result) return "bg-muted";
    if (result.confidence >= 80) return "bg-green-500/20 text-green-500";
    if (result.confidence >= 60) return "bg-yellow-500/20 text-yellow-500";
    return "bg-red-500/20 text-red-500";
  };

  // Calculate position to keep panel in viewport
  const panelWidth = 360;
  const left = Math.min(Math.max(position.x - panelWidth / 2, 10), window.innerWidth - panelWidth - 10);
  const top = position.y + 10;

  return (
    <div 
      className="fixed z-50 animate-scale-in"
      style={{ left, top }}
    >
      {/* Floating Action Bar */}
      {!activeAction && !result && (
        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-lg shadow-xl">
          {actions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => id === "ask" ? setActiveAction("ask") : handleAction(id)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md ml-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Ask Input Panel */}
      {activeAction === "ask" && !result && (
        <div className="w-[360px] p-4 bg-card border border-border rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Ask about this text</span>
            </div>
            <button onClick={() => { setActiveAction(null); onClose(); }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-xs text-muted-foreground mb-3 p-2 bg-secondary/50 rounded border border-border line-clamp-2">
            "{selectedText}"
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAction("ask")}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <Button 
              size="sm" 
              onClick={() => handleAction("ask")}
              disabled={!askQuestion.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
            </Button>
          </div>
        </div>
      )}

      {/* Rewrite Options Panel */}
      {activeAction === "rewrite" && !result && (
        <div className="w-[360px] p-4 bg-card border border-border rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Rewrite style</span>
            </div>
            <button onClick={() => { setActiveAction(null); onClose(); }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {rewriteStyles.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleAction("rewrite", id)}
                disabled={isLoading}
                className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && activeAction !== "ask" && (
        <div className="w-[360px] p-4 bg-card border border-border rounded-lg shadow-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              {activeAction === "verify" ? "Verifying claim..." : "Processing..."}
            </span>
          </div>
        </div>
      )}

      {/* Result Panel */}
      {result && (
        <div className="w-[360px] bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2">
              {activeAction === "verify" && getVerificationIcon()}
              <span className="text-sm font-medium capitalize">
                {activeAction === "verify" ? getVerificationLabel() : activeAction}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor()}`}>
                {result.confidence}% confidence
              </span>
              <button onClick={() => { setResult(null); setActiveAction(null); onClose(); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Selected Text */}
          <div className="px-3 py-2 border-b border-border bg-secondary/20">
            <div className="text-xs text-muted-foreground line-clamp-1">
              "{selectedText}"
            </div>
          </div>

          {/* Answer */}
          <div className="p-3 max-h-60 overflow-y-auto">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {result.answer}
            </p>
          </div>

          {/* Citations */}
          {result.citations && result.citations.length > 0 && (
            <div className="p-3 border-t border-border bg-secondary/20">
              <div className="text-xs font-medium text-muted-foreground mb-2">Sources</div>
              <div className="space-y-1.5">
                {result.citations.map((citation) => (
                  <a
                    key={citation.id}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-2 rounded bg-card hover:bg-secondary/50 transition-colors group"
                  >
                    <span className="text-xs text-primary font-medium">[{citation.id}]</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {citation.title}
                      </div>
                      {citation.published_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {citation.published_date}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Indicators */}
          <div className="flex items-center gap-3 px-3 py-2 border-t border-border text-xs text-muted-foreground">
            {result.uses_sources && (
              <span className="flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                Uses external sources
              </span>
            )}
            {!result.uses_sources && (
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Reasoned response
              </span>
            )}
            {result.confidence < 60 && (
              <span className="flex items-center gap-1 text-yellow-500">
                <AlertTriangle className="h-3 w-3" />
                Low confidence
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for text selection with floating toolbar
export const useSelectToAsk = () => {
  const [selection, setSelection] = useState<{
    text: string;
    position: { x: number; y: number };
    context?: string;
  } | null>(null);

  const handleMouseUp = useCallback((e: React.MouseEvent, context?: string) => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      const selectedText = window.getSelection()?.toString().trim();
      
      if (selectedText && selectedText.length > 3) {
        const range = window.getSelection()?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          setSelection({
            text: selectedText,
            position: { x: rect.left + rect.width / 2, y: rect.bottom },
            context,
          });
        }
      }
    }, 10);
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return { selection, handleMouseUp, clearSelection };
};
