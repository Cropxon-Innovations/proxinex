import { useState } from "react";
import { 
  Star, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  Share2,
  MoreHorizontal,
  ExternalLink,
  Loader2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import ReactMarkdown from "react-markdown";

interface Citation {
  id: number;
  title: string;
  url: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
  accuracy?: number;
  cost?: number;
  model?: string;
  citations?: Citation[];
  verified?: boolean;
  onCopy?: () => void;
}

export const ChatMessage = ({
  role,
  content,
  timestamp,
  isLoading,
  accuracy = 94,
  cost = 0.018,
  model = "Gemini 2.5 Flash",
  citations = [],
  verified = true,
  onCopy,
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

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
        {/* Content */}
        <div className="p-5">
          {isLoading && !content ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Thinking...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90 prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-table:text-sm">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mb-3 mt-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold text-foreground mb-2 mt-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-medium text-foreground mb-2 mt-3">{children}</h3>,
                  p: ({ children }) => <p className="text-sm leading-relaxed mb-3 text-foreground/90">{children}</p>,
                  ul: ({ children }) => <ul className="space-y-2 mb-4 ml-1">{children}</ul>,
                  ol: ({ children }) => <ol className="space-y-2 mb-4 ml-1 list-decimal list-inside">{children}</ol>,
                  li: ({ children }) => (
                    <li className="flex items-start gap-2 text-sm text-foreground/90">
                      <span className="text-primary mt-1.5">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  code: ({ className, children }) => {
                    const isInline = !className;
                    if (isInline) {
                      return <code className="text-primary bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>;
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
                  thead: ({ children }) => <thead className="bg-secondary/50">{children}</thead>,
                  th: ({ children }) => <th className="px-3 py-2 text-left font-medium text-foreground border-b border-border">{children}</th>,
                  td: ({ children }) => <td className="px-3 py-2 text-foreground/90 border-b border-border">{children}</td>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground my-4">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      {children}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
              {isLoading && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
              )}
            </div>
          )}
        </div>

        {/* Trust Bar */}
        {!isLoading && (
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

            {citations.length > 0 && (
              <div className="flex items-center gap-1.5 text-primary">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="text-xs">{citations.length} sources</span>
              </div>
            )}

            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
              >
                <Copy className={`h-3.5 w-3.5 ${copied ? "text-success" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Citations */}
        {citations.length > 0 && !isLoading && (
          <div className="px-5 py-3 border-t border-border bg-card">
            <div className="flex flex-wrap gap-2">
              {citations.map((citation) => (
                <a
                  key={citation.id}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-secondary text-muted-foreground rounded-full hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <span className="text-primary font-medium">[{citation.id}]</span>
                  <span className="truncate max-w-[150px]">{citation.title}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
