import { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import { 
  Send, 
  Sparkles, 
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Link2,
  Pencil,
  TrendingUp,
  ExternalLink,
  Calendar,
  Maximize2,
  Minimize2,
  MessageCircle,
  Search,
  Shield,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InlineAskData } from "@/components/chat/InlineAskComment";

type ActionType = "ask" | "explain" | "verify" | "sources" | "rewrite";
type RewriteStyle = "shorter" | "formal" | "technical" | "friendly";

interface ConversationEntry {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface PersistentInlineAskProps {
  selectedText: string;
  position: { x: number; y: number };
  fullContext?: string;
  onClose: () => void;
  onSaveInlineAsk?: (data: InlineAskData) => void;
  hasActivePopup?: boolean;
  messageIndex?: number;
  selectionOffset?: { start: number; end: number };
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  sessionId?: string;
  isResearchMode?: boolean;
  onToggleResearchMode?: (enabled: boolean) => void;
}

interface ActionResult {
  answer: string;
  confidence: number;
  citations?: Array<{ id: number; title: string; url: string; published_date?: string; snippet?: string }>;
  verified?: boolean;
  verification_status?: "verified" | "partially_supported" | "not_supported" | "insufficient_evidence";
  uses_sources?: boolean;
  research_mode?: boolean;
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

export const PersistentInlineAsk = forwardRef<HTMLDivElement, PersistentInlineAskProps>(({ 
  selectedText, 
  position, 
  fullContext, 
  onClose,
  onSaveInlineAsk,
  hasActivePopup = false,
  messageIndex = 0,
  selectionOffset = { start: 0, end: 0 },
  isMaximized = false,
  onToggleMaximize,
  sessionId,
  isResearchMode = false,
  onToggleResearchMode
}, ref) => {
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [askQuestion, setAskQuestion] = useState("");
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [showConversation, setShowConversation] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Determine border color based on state
  const getBorderClass = () => {
    if (hasActivePopup) {
      return "border-2 border-destructive shadow-destructive/20";
    }
    if (activeAction === "ask" || isLoading || showConversation) {
      return "border-2 border-green-500 shadow-green-500/20";
    }
    return "border border-border";
  };

  const handleAction = async (action: ActionType, rewriteStyle?: RewriteStyle) => {
    if (action === "ask" && !askQuestion.trim()) return;
    
    setActiveAction(action);
    setIsLoading(true);

    try {
      // Build context from previous conversation
      const conversationContext = conversation.length > 0 
        ? `\n\nPrevious conversation about this text:\n${conversation.map(c => `${c.role}: ${c.content}`).join('\n')}`
        : '';

      const { data, error } = await supabase.functions.invoke("text-action", {
        body: {
          selected_text: selectedText,
          full_answer_context: fullContext + conversationContext,
          action,
          user_query: action === "ask" ? askQuestion : undefined,
          rewrite_style: rewriteStyle,
          research_mode: isResearchMode,
        },
      });

      if (error) throw error;
      setResult(data);

      // Add to conversation if it was an ask action
      if (action === "ask" && data) {
        const newEntry: ConversationEntry[] = [
          { role: "user", content: askQuestion, timestamp: new Date() },
          { role: "assistant", content: data.answer, timestamp: new Date() }
        ];
        setConversation(prev => [...prev, ...newEntry]);
        setShowConversation(true);
        setAskQuestion(""); // Clear for next question

        // Save inline ask with conversation history
        if (onSaveInlineAsk) {
          const inlineAskData: InlineAskData = {
            id: `inline-${Date.now()}`,
            selectedText,
            question: askQuestion,
            answer: data.answer,
            confidence: data.confidence,
            timestamp: new Date(),
            messageIndex,
            startOffset: selectionOffset.start,
            endOffset: selectionOffset.end,
            conversationHistory: [...conversation, ...newEntry]
          };
          onSaveInlineAsk(inlineAskData);
        }
      }
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

  // Calculate position
  const panelWidth = isMaximized ? 520 : 380;
  const panelHeight = isMaximized ? 600 : 400;
  const left = isMaximized 
    ? (window.innerWidth - panelWidth) / 2 
    : Math.min(Math.max(position.x - panelWidth / 2, 10), window.innerWidth - panelWidth - 10);
  const top = isMaximized 
    ? window.innerHeight * 0.1
    : Math.min(position.y + 10, window.innerHeight - panelHeight - 20);

  return (
    <div 
      ref={(el) => {
        panelRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={`fixed z-50 animate-scale-in ${getBorderClass()} rounded-lg shadow-xl bg-card`}
      style={{ 
        left, 
        top,
        width: panelWidth,
        maxHeight: isMaximized ? '80vh' : '70vh',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Warning Banner for Active Popup */}
      {hasActivePopup && (
        <div className="bg-destructive/10 border-b border-destructive/30 px-3 py-2 rounded-t-lg">
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Close current popup before opening another
          </p>
        </div>
      )}

      {/* Conversation View */}
      {showConversation && conversation.length > 0 && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-3 border-b border-border ${isResearchMode ? 'bg-green-500/10' : 'bg-green-500/10'}`}>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-foreground">Inline Ask Conversation</span>
              <span className="text-xs text-muted-foreground">({conversation.length / 2} exchanges)</span>
              {isResearchMode && (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-500 rounded-full flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  Research
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {onToggleMaximize && (
                <button onClick={onToggleMaximize} className="text-muted-foreground hover:text-foreground p-1">
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              )}
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Selected Text */}
          <div className="px-3 py-2 border-b border-border bg-yellow-500/10">
            <div className="text-xs text-muted-foreground mb-1">About:</div>
            <div className="text-xs text-foreground line-clamp-2 italic">
              "{selectedText}"
            </div>
          </div>

          {/* Conversation Messages */}
          <div className={`flex-1 overflow-y-auto p-3 space-y-3 ${isMaximized ? 'max-h-80' : 'max-h-48'}`}>
            {conversation.map((entry, idx) => (
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
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-lg px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={conversationEndRef} />
          </div>

          {/* Result with Citations (in research mode) */}
          {result && isResearchMode && result.citations && result.citations.length > 0 && (
            <div className="border-t border-border bg-secondary/20 max-h-32 overflow-y-auto">
              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Verified Sources</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      result.confidence >= 80 ? 'bg-green-500/20 text-green-500' : 
                      result.confidence >= 60 ? 'bg-yellow-500/20 text-yellow-500' : 
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {result.confidence}% confidence
                    </span>
                  </div>
                  {result.verified && (
                    <span className="text-[10px] text-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {result.citations.slice(0, 3).map((citation) => (
                    <a
                      key={citation.id}
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-1.5 rounded bg-card hover:bg-secondary/50 transition-colors group text-xs"
                    >
                      <span className="text-primary font-medium">[{citation.id}]</span>
                      <span className="text-foreground line-clamp-1 group-hover:text-primary transition-colors flex-1">
                        {citation.title}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Continue Asking Input */}
          <div className="p-3 border-t border-green-500/30 bg-green-500/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={askQuestion}
                onChange={(e) => setAskQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAction("ask")}
                placeholder={isResearchMode ? "Ask with verified sources..." : "Ask a follow-up question..."}
                className="flex-1 px-3 py-2 text-sm bg-input border border-green-500/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <Button 
                size="sm" 
                onClick={() => handleAction("ask")}
                disabled={!askQuestion.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {isResearchMode && (
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Shield className="h-2.5 w-2.5 text-green-500" />
                Research mode active
              </p>
            )}
          </div>
        </div>
      )}

      {/* Initial Action Bar (only show if no conversation) */}
      {!showConversation && !activeAction && !result && (
        <div className="p-2">
          <div className="flex items-center gap-1 flex-wrap">
            {actions.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => id === "ask" ? setActiveAction("ask") : handleAction(id)}
                disabled={hasActivePopup}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
            <div className="flex-1" />
            {onToggleMaximize && (
              <button
                onClick={onToggleMaximize}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Ask Input Panel */}
      {!showConversation && activeAction === "ask" && !result && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Ask about this text</span>
            </div>
            <div className="flex items-center gap-1">
              {onToggleMaximize && (
                <button onClick={onToggleMaximize} className="text-muted-foreground hover:text-foreground p-1">
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              )}
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Research Mode Toggle */}
          <div className="flex items-center justify-between mb-3 p-2 bg-secondary/50 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Research Mode</span>
              {isResearchMode && (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-500 rounded-full flex items-center gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  Verified Sources
                </span>
              )}
            </div>
            <button
              onClick={() => onToggleResearchMode?.(!isResearchMode)}
              className="flex items-center"
            >
              {isResearchMode ? (
                <ToggleRight className="h-5 w-5 text-green-500" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          
          <div className="text-xs text-muted-foreground mb-3 p-2 bg-yellow-500/10 rounded border border-green-500/30 line-clamp-2">
            "{selectedText}"
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAction("ask")}
              placeholder={isResearchMode ? "Ask with verified sources..." : "Ask a question..."}
              className="flex-1 px-3 py-2 text-sm bg-input border border-green-500/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <Button 
              size="sm" 
              onClick={() => handleAction("ask")}
              disabled={!askQuestion.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          
          {isResearchMode && (
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-500" />
              Answers will include verified citations from trusted sources
            </p>
          )}
        </div>
      )}

      {/* Rewrite Options Panel */}
      {!showConversation && activeAction === "rewrite" && !result && (
        <div className="p-4">
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
      {!showConversation && isLoading && activeAction !== "ask" && (
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-green-500" />
            <span className="text-sm text-muted-foreground">
              {activeAction === "verify" ? "Verifying claim..." : "Processing..."}
            </span>
          </div>
        </div>
      )}

      {/* Result Panel (for non-ask actions) */}
      {!showConversation && result && activeAction !== "ask" && (
        <div className="overflow-hidden">
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
              {onToggleMaximize && (
                <button onClick={onToggleMaximize} className="text-muted-foreground hover:text-foreground p-1">
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              )}
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Selected Text */}
          <div className="px-3 py-2 border-b border-border bg-yellow-500/10">
            <div className="text-xs text-muted-foreground line-clamp-1">
              "{selectedText}"
            </div>
          </div>

          {/* Answer */}
          <div className={`p-3 overflow-y-auto ${isMaximized ? 'max-h-96' : 'max-h-60'}`}>
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
          <div className="flex items-center flex-wrap gap-2 px-3 py-2 border-t border-border text-xs text-muted-foreground">
            {result.research_mode && result.verified && (
              <span className="flex items-center gap-1 text-green-500">
                <Shield className="h-3 w-3" />
                Verified with sources
              </span>
            )}
            {result.research_mode && !result.verified && (
              <span className="flex items-center gap-1 text-yellow-500">
                <AlertTriangle className="h-3 w-3" />
                Limited sources
              </span>
            )}
            {result.uses_sources && !result.research_mode && (
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
});

PersistentInlineAsk.displayName = "PersistentInlineAsk";

// Hook for persistent text selection
export const usePersistentInlineAsk = () => {
  const [selection, setSelection] = useState<{
    text: string;
    position: { x: number; y: number };
    context?: string;
    messageIndex?: number;
    selectionOffset?: { start: number; end: number };
  } | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMouseUp = useCallback((e: React.MouseEvent, context?: string, messageIndex?: number) => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      const windowSelection = window.getSelection();
      const selectedText = windowSelection?.toString().trim();
      
      if (selectedText && selectedText.length > 3) {
        const range = windowSelection?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          setSelection({
            text: selectedText,
            position: { x: rect.left + rect.width / 2, y: rect.bottom },
            context,
            messageIndex,
            selectionOffset: {
              start: range.startOffset,
              end: range.endOffset,
            },
          });
        }
      }
    }, 10);
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setIsMaximized(false);
    window.getSelection()?.removeAllRanges();
  }, []);

  const toggleMaximize = useCallback(() => {
    setIsMaximized(prev => !prev);
  }, []);

  return { 
    selection, 
    handleMouseUp, 
    clearSelection,
    isMaximized,
    toggleMaximize
  };
};