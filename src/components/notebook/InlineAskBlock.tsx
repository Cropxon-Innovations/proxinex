import { useState } from "react";
import { 
  Sparkles, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Calendar,
  Shield,
  User,
  Bot,
  Quote
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Citation {
  id: number;
  title: string;
  url: string;
  published_date?: string;
  snippet?: string;
  score?: number;
}

interface ConversationEntry {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface InlineAskContent {
  selectedText: string;
  conversation: ConversationEntry[];
  citations?: Citation[];
  confidence?: number;
  isResearchMode?: boolean;
  timestamp: string;
}

interface InlineAskBlockProps {
  content: string;
  onDelete?: () => void;
}

// Citation Badge Component
const CitationBadge = ({ citation, index }: { citation: Citation; index: number }) => {
  const domain = (() => {
    try {
      return new URL(citation.url).hostname.replace("www.", "");
    } catch {
      return citation.url;
    }
  })();

  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-2 p-2 rounded-lg bg-card hover:bg-secondary/50 border border-border hover:border-primary/30 transition-all"
    >
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-[10px] font-bold flex items-center justify-center">
        {index + 1}
      </span>
      
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {citation.title}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground truncate">{domain}</span>
          {citation.score && (
            <span className={`text-[10px] px-1 py-0.5 rounded ${
              citation.score >= 80 
                ? "bg-emerald-500/10 text-emerald-500" 
                : citation.score >= 50 
                ? "bg-amber-500/10 text-amber-500"
                : "bg-muted text-muted-foreground"
            }`}>
              {citation.score}%
            </span>
          )}
        </div>
        {citation.published_date && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
            <Calendar className="h-2.5 w-2.5" />
            {new Date(citation.published_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })}
          </div>
        )}
      </div>
      
      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
};

export const InlineAskBlock = ({ content, onDelete }: InlineAskBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllConversation, setShowAllConversation] = useState(false);

  // Parse the JSON content
  let parsedContent: InlineAskContent;
  try {
    parsedContent = JSON.parse(content);
  } catch {
    return (
      <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
        <p className="text-sm text-destructive">Failed to parse inline ask content</p>
      </div>
    );
  }

  const { selectedText, conversation, citations, confidence, isResearchMode, timestamp } = parsedContent;

  const displayedConversation = showAllConversation ? conversation : conversation.slice(-4);

  const getConfidenceColor = () => {
    if (!confidence) return "bg-muted text-muted-foreground";
    if (confidence >= 80) return "bg-emerald-500/20 text-emerald-500";
    if (confidence >= 60) return "bg-amber-500/20 text-amber-500";
    return "bg-red-500/20 text-red-500";
  };

  return (
    <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-primary/10 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Inline Ask</span>
              {isResearchMode && (
                <Badge variant="outline" className="text-[10px] h-4 border-emerald-500/50 text-emerald-500 gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  Research
                </Badge>
              )}
              {confidence && (
                <Badge variant="secondary" className={`text-[10px] h-4 ${getConfidenceColor()}`}>
                  {confidence}% confident
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {conversation.length / 2} exchange{conversation.length > 2 ? 's' : ''} • {new Date(timestamp).toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            <MessageCircle className="h-3 w-3 mr-1" />
            {conversation.length} messages
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Selected Text Quote */}
          <div className="relative pl-4 border-l-2 border-primary/50">
            <Quote className="absolute -left-2.5 -top-1 h-4 w-4 text-primary/50 bg-card rounded" />
            <p className="text-sm text-muted-foreground italic line-clamp-3">{selectedText}</p>
          </div>

          {/* Conversation */}
          <div className="space-y-3">
            {conversation.length > 4 && !showAllConversation && (
              <button
                onClick={() => setShowAllConversation(true)}
                className="w-full text-xs text-primary hover:underline py-1"
              >
                Show {conversation.length - 4} earlier messages
              </button>
            )}
            
            {displayedConversation.map((entry, index) => (
              <div key={index} className={`flex gap-2 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {entry.role === 'assistant' && (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  entry.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary/50 text-foreground'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                  <span className="text-[10px] opacity-60 mt-1 block">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {entry.role === 'user' && (
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Citations */}
          {citations && citations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">Sources</span>
                <Badge variant="outline" className="text-[10px] h-4">
                  {citations.length} citation{citations.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="grid gap-2">
                {citations.map((citation, idx) => (
                  <CitationBadge key={citation.id || idx} citation={citation} index={idx} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineAskBlock;
