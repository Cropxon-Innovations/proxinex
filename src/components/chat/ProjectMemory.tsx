import { 
  Brain, 
  CheckCircle, 
  FileText, 
  Lightbulb,
  Trash2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

interface MemoryItem {
  id: string;
  type: "fact" | "decision" | "summary";
  content: string;
  timestamp: Date;
  verified: boolean;
  sources?: number;
}

interface ProjectMemoryProps {
  projectName: string;
  memories: MemoryItem[];
  onDeleteMemory?: (id: string) => void;
}

export const ProjectMemory = ({ projectName, memories, onDeleteMemory }: ProjectMemoryProps) => {
  const [expanded, setExpanded] = useState(true);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "fact":
        return <CheckCircle className="h-3.5 w-3.5 text-success" />;
      case "decision":
        return <Lightbulb className="h-3.5 w-3.5 text-warning" />;
      case "summary":
        return <FileText className="h-3.5 w-3.5 text-primary" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "fact":
        return "Verified Fact";
      case "decision":
        return "Decision";
      case "summary":
        return "Summary";
      default:
        return type;
    }
  };

  if (memories.length === 0) return null;

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-3 hover:bg-secondary/30 transition-colors"
      >
        <Brain className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground flex-1 text-left">
          What Proxinex remembers
        </span>
        <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
          {memories.length}
        </span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Memory Items */}
      {expanded && (
        <div className="border-t border-border">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="group flex items-start gap-3 p-3 hover:bg-secondary/20 transition-colors border-b border-border last:border-0"
            >
              {getTypeIcon(memory.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-medium text-muted-foreground">
                    {getTypeLabel(memory.type)}
                  </span>
                  {memory.verified && (
                    <span className="text-[10px] text-success">• Verified</span>
                  )}
                  {memory.sources && memory.sources > 0 && (
                    <span className="text-[10px] text-primary">• {memory.sources} sources</span>
                  )}
                </div>
                <p className="text-sm text-foreground/90">{memory.content}</p>
              </div>
              <button
                onClick={() => onDeleteMemory?.(memory.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {expanded && (
        <div className="px-3 py-2 bg-secondary/30 border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            Only verified facts, decisions, and summaries are stored. 
            Casual chat and low-confidence content are not remembered.
          </p>
        </div>
      )}
    </div>
  );
};
