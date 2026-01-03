import { useState } from "react";
import { 
  MessageSquare, 
  Trash2, 
  MoreVertical, 
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
  verified: boolean;
  citationCount: number;
  projectId?: string;
  projectName?: string;
}

interface ChatHistoryProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionStar?: (sessionId: string) => void;
}

export const ChatHistory = ({
  sessions,
  activeSessionId,
  onSessionSelect,
  onSessionDelete,
  onSessionStar,
}: ChatHistoryProps) => {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Group sessions by project
  const groupedSessions = sessions.reduce((acc, session) => {
    const projectKey = session.projectId || "general";
    if (!acc[projectKey]) {
      acc[projectKey] = {
        name: session.projectName || "General",
        sessions: [],
      };
    }
    acc[projectKey].sessions.push(session);
    return acc;
  }, {} as Record<string, { name: string; sessions: ChatSession[] }>);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">History</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedSessions).map(([projectId, { name, sessions: projectSessions }]) => (
          <div key={projectId} className="border-b border-border">
            {/* Project Header */}
            <button
              onClick={() => setExpandedProject(expandedProject === projectId ? null : projectId)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 transition-colors"
            >
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground flex-1 text-left">
                {name}
              </span>
              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {projectSessions.length}
              </span>
            </button>

            {/* Sessions */}
            {(expandedProject === projectId || projectId === "general") && (
              <div className="pb-1">
                {projectSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative mx-2 mb-1 rounded-lg transition-colors ${
                      activeSessionId === session.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <button
                      onClick={() => onSessionSelect(session.id)}
                      className="w-full p-2 text-left"
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {session.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {session.preview}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(session.timestamp, { addSuffix: true })}
                            </span>
                            {session.verified && (
                              <span className="text-[10px] text-success flex items-center gap-0.5">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </span>
                            )}
                            {session.citationCount > 0 && (
                              <span className="text-[10px] text-primary">
                                {session.citationCount} citations
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSessionStar?.(session.id)}>
                            <Star className="h-4 w-4 mr-2" />
                            Star
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onSessionDelete(session.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No chat history yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
