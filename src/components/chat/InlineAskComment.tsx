import { useState } from "react";
import { 
  MessageSquare, 
  Sparkles, 
  Maximize2, 
  X,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Trash2,
  Edit3,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updatedData: Partial<InlineAskData>) => void;
  isMinimized?: boolean;
}

export const InlineAskComment = ({ 
  data, 
  onMaximize, 
  onClose,
  onDelete,
  onEdit,
  isMinimized = true 
}: InlineAskCommentProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(data.question);
  const [editedAnswer, setEditedAnswer] = useState(data.answer);

  const getConfidenceColor = () => {
    if (data.confidence >= 80) return "text-green-500";
    if (data.confidence >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const exchangeCount = data.conversationHistory 
    ? Math.floor(data.conversationHistory.length / 2)
    : 1;

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(data.id, {
        question: editedQuestion,
        answer: editedAnswer
      });
    }
    setIsEditing(false);
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(data.id);
    }
    setShowDeleteConfirm(false);
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
        <span className="bg-yellow-400/30 dark:bg-yellow-500/20 border-b-2 border-yellow-500 px-0.5 rounded">
          <MessageSquare className="inline h-3 w-3 text-yellow-600 dark:text-yellow-500 mr-0.5" />
        </span>
        
        {/* Hover Preview Tooltip - Proxinex Ask */}
        {isHovered && (
          <div className="absolute z-50 left-0 top-full mt-1 w-72 p-3 bg-card border border-border rounded-lg shadow-xl animate-scale-in">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Proxinex Ask</span>
                <span className={`text-xs ${getConfidenceColor()}`}>
                  {data.confidence}%
                </span>
              </div>
              {onDelete && (
                <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                  <AlertDialogTrigger asChild>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete inline ask"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Proxinex Ask?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this Proxinex Ask and all its conversation history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            {exchangeCount > 1 && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <MessageCircle className="h-3 w-3" />
                {exchangeCount} exchanges
              </div>
            )}
            
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
              Click to view full conversation
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
            <span className="font-medium text-foreground">Proxinex Ask Details</span>
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
            {onEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-muted-foreground hover:text-primary transition-colors"
                title="Edit Proxinex Ask"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete Proxinex Ask"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Proxinex Ask?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this Proxinex Ask and all its conversation history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
        ) : isEditing ? (
          <>
            {/* Editable Question */}
            <div className="p-4 border-b border-border">
              <div className="text-xs text-muted-foreground mb-1">Your Question</div>
              <textarea
                value={editedQuestion}
                onChange={(e) => setEditedQuestion(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                rows={2}
              />
            </div>

            {/* Editable Answer */}
            <div className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Answer</div>
              <textarea
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-input border border-border rounded-lg text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                rows={6}
              />
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-secondary/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditedQuestion(data.question);
                  setEditedAnswer(data.answer);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="bg-primary text-primary-foreground"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          </>
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
          </>
        )}
      </div>
    </div>
  );
};

// Component to render highlighted text with inline ask markers
interface HighlightedTextProps {
  text: string;
  inlineAsks: InlineAskData[];
  onInlineAskClick: (data: InlineAskData) => void;
  onDelete?: (id: string) => void;
}

export const HighlightedText = ({ text, inlineAsks, onInlineAskClick, onDelete }: HighlightedTextProps) => {
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
        onDelete={onDelete}
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
  onDelete?: (id: string) => void;
}

const HighlightedSegment = ({ text, data, onClick, onDelete }: HighlightedSegmentProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getConfidenceColor = () => {
    if (data.confidence >= 80) return "text-green-500";
    if (data.confidence >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const exchangeCount = data.conversationHistory 
    ? Math.floor(data.conversationHistory.length / 2)
    : 1;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(data.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <span
      className="relative inline cursor-pointer bg-yellow-400/30 dark:bg-yellow-500/20 border-b-2 border-yellow-500 hover:bg-yellow-400/50 dark:hover:bg-yellow-500/30 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {text}
      <MessageSquare className="inline h-3 w-3 text-yellow-600 dark:text-yellow-500 ml-0.5" />
      
      {/* Proxinex Ask Tooltip on hover */}
      {isHovered && (
        <div className="absolute z-50 left-0 top-full mt-1 w-72 p-3 bg-card border border-border rounded-lg shadow-xl animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Proxinex Ask</span>
              <span className={`text-xs ${getConfidenceColor()}`}>
                {data.confidence}%
              </span>
            </div>
            {onDelete && (
              <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogTrigger asChild>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete Proxinex Ask"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Proxinex Ask?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this Proxinex Ask and all its conversation history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          {exchangeCount > 1 && (
            <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <MessageCircle className="h-3 w-3" />
              {exchangeCount} exchanges
            </div>
          )}
          <p className="text-xs text-muted-foreground mb-1 italic">
            Q: {data.question}
          </p>
          <p className="text-xs text-foreground line-clamp-3">
            {data.answer}
          </p>
          <div className="text-xs text-primary mt-2 flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />
            Click to view full conversation
          </div>
        </div>
      )}
    </span>
  );
};