import { useState } from "react";
import { Pin, ChevronDown, ChevronUp, X, Search } from "lucide-react";
import { Message } from "@/lib/chat";

interface PinnedMessagesProps {
  messages: Message[];
  onUnpin: (index: number) => void;
  onScrollToMessage: (index: number) => void;
}

export const PinnedMessages = ({ messages, onUnpin, onScrollToMessage }: PinnedMessagesProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  if (messages.length === 0) return null;

  // Filter messages based on search query
  const filteredMessages = searchQuery.trim()
    ? messages.filter(message => 
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, idx) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={idx} className="bg-yellow-500/40 text-foreground rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg mx-6 mt-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-foreground hover:bg-primary/10 rounded-t-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-primary" />
          <span>Pinned Messages ({messages.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Pinned Messages List */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-2">
          {/* Search Input */}
          {messages.length > 1 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pinned messages..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Search Results Count */}
          {searchQuery && (
            <div className="text-xs text-muted-foreground">
              {filteredMessages.length} of {messages.length} messages match
            </div>
          )}

          {/* Messages List */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredMessages.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-2">
                No pinned messages match your search
              </div>
            ) : (
              filteredMessages.map((message, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 bg-card rounded-md border border-border group hover:bg-secondary/50 transition-colors"
                >
                  <button
                    onClick={() => onScrollToMessage(message.originalIndex || idx)}
                    className="flex-1 text-left"
                  >
                    <div className="text-xs text-muted-foreground mb-1 capitalize">
                      {message.role}
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      {searchQuery ? highlightMatch(message.content, searchQuery) : message.content}
                    </p>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpin(message.originalIndex || idx);
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Unpin message"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};