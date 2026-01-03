import { useState } from "react";
import { Pin, ChevronDown, ChevronUp, X } from "lucide-react";
import { Message } from "@/lib/chat";

interface PinnedMessagesProps {
  messages: Message[];
  onUnpin: (index: number) => void;
  onScrollToMessage: (index: number) => void;
}

export const PinnedMessages = ({ messages, onUnpin, onScrollToMessage }: PinnedMessagesProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (messages.length === 0) return null;

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
        <div className="px-4 pb-3 space-y-2 max-h-48 overflow-y-auto">
          {messages.map((message, idx) => (
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
                  {message.content}
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
          ))}
        </div>
      )}
    </div>
  );
};
