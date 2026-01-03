import { useState, useEffect } from "react";
import { 
  Clock, 
  DollarSign, 
  CheckCircle, 
  ExternalLink,
  Loader2,
  Sparkles,
  Cpu,
} from "lucide-react";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { FeedbackActions } from "@/components/chat/FeedbackActions";
import { SourcesDisplay, Source } from "@/components/chat/SourcesDisplay";
import ReactMarkdown from "react-markdown";
import { ProxinexIcon } from "@/components/Logo";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
  accuracy?: number;
  cost?: number;
  model?: string;
  sources?: Source[];
  verified?: boolean;
  onCopy?: () => void;
  onFeedback?: (type: "up" | "down" | "love", reason?: string) => void;
}

export const ChatMessage = ({
  role,
  content,
  timestamp,
  isLoading,
  accuracy = 94,
  cost = 0.018,
  model = "Gemini 2.5 Flash",
  sources = [],
  verified = true,
  onCopy,
  onFeedback,
}: ChatMessageProps) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Typing animation effect for assistant messages
  useEffect(() => {
    if (role === "assistant" && content && !isLoading) {
      setIsTyping(true);
      let index = 0;
      const typingSpeed = 5; // ms per character
      
      // If content is short or already displayed, show immediately
      if (content.length < 50 || displayedContent === content) {
        setDisplayedContent(content);
        setIsTyping(false);
        return;
      }

      const timer = setInterval(() => {
        if (index <= content.length) {
          setDisplayedContent(content.slice(0, index));
          index += 3; // Type 3 characters at a time for speed
        } else {
          clearInterval(timer);
          setDisplayedContent(content);
          setIsTyping(false);
        }
      }, typingSpeed);

      return () => clearInterval(timer);
    } else if (isLoading) {
      setDisplayedContent(content);
    }
  }, [content, role, isLoading]);

  if (role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md max-w-md">
          <p className="text-sm">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 animate-fade-in">
      {/* Response Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header with Logo */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-secondary/20">
          <div className="relative">
            <ProxinexIcon 
              className={`w-7 h-7 ${isLoading ? "animate-pulse" : ""}`}
            />
            {isLoading && (
              <div className="absolute inset-0 rounded-lg border-2 border-primary/50 animate-ping" />
            )}
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-foreground">Proxinex</span>
            <span className="text-xs text-muted-foreground ml-2">
              <Cpu className="h-3 w-3 inline mr-1" />
              {model}
            </span>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4 animate-spin" />
              <span className="text-xs">Thinking...</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {isLoading && !content ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm">Generating response...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90 prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-table:text-sm">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mb-3 mt-0 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold text-foreground mb-2 mt-4 flex items-center gap-2 text-primary">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-medium text-foreground mb-2 mt-3">{children}</h3>,
                  p: ({ children }) => <p className="text-sm leading-relaxed mb-3 text-foreground/90">{children}</p>,
                  ul: ({ children }) => <ul className="space-y-2 mb-4 ml-1">{children}</ul>,
                  ol: ({ children }) => <ol className="space-y-2 mb-4 ml-1 list-decimal list-inside">{children}</ol>,
                  li: ({ children }) => (
                    <li className="flex items-start gap-2 text-sm text-foreground/90">
                      <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  code: ({ className, children }) => {
                    const isInline = !className;
                    if (isInline) {
                      return <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono border border-primary/20">{children}</code>;
                    }
                    return (
                      <pre className="bg-secondary border border-border rounded-lg p-4 overflow-x-auto">
                        <code className="text-xs font-mono text-foreground">{children}</code>
                      </pre>
                    );
                  },
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-4 rounded-lg border border-border">
                      <table className="w-full text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-primary/10">{children}</thead>,
                  th: ({ children }) => <th className="px-3 py-2 text-left font-medium text-primary border-b border-border">{children}</th>,
                  td: ({ children }) => <td className="px-3 py-2 text-foreground/90 border-b border-border">{children}</td>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4 bg-primary/5 py-2 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      {children}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ),
                  strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
                }}
              >
                {displayedContent || content}
              </ReactMarkdown>
              {(isLoading || isTyping) && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 rounded" />
              )}
            </div>
          )}
        </div>

        {/* Inline Sources */}
        {sources.length > 0 && !isLoading && (
          <div className="px-5 pb-3">
            <SourcesDisplay sources={sources} inline />
          </div>
        )}

        {/* Trust Bar */}
        {!isLoading && content && (
          <div className="px-5 py-3 border-t border-border bg-secondary/30 flex flex-wrap items-center gap-4 text-sm">
            <ConfidenceBadge score={accuracy} />
            
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">LIVE</span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="text-xs">₹{cost.toFixed(3)}</span>
            </div>

            {verified && (
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Verified</span>
              </div>
            )}

            {sources.length > 0 && (
              <div className="flex items-center gap-1.5 text-primary">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="text-xs">{sources.length} sources</span>
              </div>
            )}

            <div className="flex-1" />

            {/* Feedback Actions */}
            <FeedbackActions
              content={content}
              onFeedback={onFeedback}
            />
          </div>
        )}

        {/* Full Sources Section */}
        {sources.length > 0 && !isLoading && (
          <div className="px-5 py-4 border-t border-border bg-card">
            <SourcesDisplay sources={sources} />
          </div>
        )}
      </div>
    </div>
  );
};
