import { useState, useMemo } from "react";
import { 
  MessageSquare, 
  Trash2, 
  MoreVertical, 
  Clock,
  CheckCircle,
  Star,
  FolderOpen,
  Archive,
  Calendar,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, parseISO } from "date-fns";

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
  isArchived?: boolean;
  isStarred?: boolean;
}

type DateFilter = "all" | "today" | "yesterday" | "this_week" | "this_month" | "this_year";

interface ChatHistoryProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionStar?: (sessionId: string) => void;
  onSessionArchive?: (sessionId: string) => void;
}

export const ChatHistory = ({
  sessions,
  activeSessionId,
  onSessionSelect,
  onSessionDelete,
  onSessionStar,
  onSessionArchive,
}: ChatHistoryProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["today", "yesterday"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [showArchived, setShowArchived] = useState(false);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(s => showArchived ? s.isArchived : !s.isArchived);
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) || 
        s.preview.toLowerCase().includes(query)
      );
    }
    
    // Date filter
    if (dateFilter !== "all") {
      filtered = filtered.filter(s => {
        const date = s.timestamp instanceof Date ? s.timestamp : new Date(s.timestamp);
        switch (dateFilter) {
          case "today": return isToday(date);
          case "yesterday": return isYesterday(date);
          case "this_week": return isThisWeek(date);
          case "this_month": return isThisMonth(date);
          case "this_year": return isThisYear(date);
          default: return true;
        }
      });
    }
    
    return filtered;
  }, [sessions, searchQuery, dateFilter, showArchived]);

  // Group sessions by date category
  const groupedSessions = useMemo(() => {
    const groups: Record<string, { label: string; icon: JSX.Element; sessions: ChatSession[] }> = {
      starred: { label: "Starred", icon: <Star className="h-4 w-4 text-yellow-400" />, sessions: [] },
      today: { label: "Today", icon: <Calendar className="h-4 w-4 text-green-400" />, sessions: [] },
      yesterday: { label: "Yesterday", icon: <Calendar className="h-4 w-4 text-blue-400" />, sessions: [] },
      this_week: { label: "This Week", icon: <Calendar className="h-4 w-4 text-purple-400" />, sessions: [] },
      this_month: { label: "This Month", icon: <Calendar className="h-4 w-4 text-orange-400" />, sessions: [] },
      older: { label: "Older", icon: <Clock className="h-4 w-4 text-muted-foreground" />, sessions: [] },
    };

    // Sort by timestamp descending
    const sorted = [...filteredSessions].sort((a, b) => {
      const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    sorted.forEach(session => {
      if (session.isStarred) {
        groups.starred.sessions.push(session);
        return;
      }
      
      const date = session.timestamp instanceof Date ? session.timestamp : new Date(session.timestamp);
      
      if (isToday(date)) {
        groups.today.sessions.push(session);
      } else if (isYesterday(date)) {
        groups.yesterday.sessions.push(session);
      } else if (isThisWeek(date)) {
        groups.this_week.sessions.push(session);
      } else if (isThisMonth(date)) {
        groups.this_month.sessions.push(session);
      } else {
        groups.older.sessions.push(session);
      }
    });

    return groups;
  }, [filteredSessions]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday " + format(date, "h:mm a");
    } else if (isThisWeek(date)) {
      return format(date, "EEEE h:mm a");
    } else if (isThisYear(date)) {
      return format(date, "MMM d, h:mm a");
    }
    return format(date, "MMM d, yyyy");
  };

  const dateFilterOptions: { value: DateFilter; label: string }[] = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "this_year", label: "This Year" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">History</h3>
          <div className="flex items-center gap-1">
            <Button
              variant={showArchived ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="h-7 px-2"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
        
        {/* Date Filter */}
        <div className="flex gap-1 flex-wrap">
          {dateFilterOptions.map((option) => (
            <Button
              key={option.value}
              variant={dateFilter === option.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setDateFilter(option.value)}
              className="h-6 px-2 text-[10px]"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedSessions).map(([groupKey, { label, icon, sessions: groupSessions }]) => {
          if (groupSessions.length === 0) return null;
          
          const isExpanded = expandedGroups.has(groupKey);
          
          return (
            <div key={groupKey} className="border-b border-border">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {icon}
                <span className="text-xs font-medium text-muted-foreground flex-1 text-left">
                  {label}
                </span>
                <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {groupSessions.length}
                </span>
              </button>

              {/* Sessions */}
              {isExpanded && (
                <div className="pb-1">
                  {groupSessions.map((session) => (
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
                            <div className="flex items-center gap-1.5">
                              {session.isStarred && (
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              )}
                              <p className="text-sm font-medium text-foreground truncate">
                                {session.title}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {session.preview}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(session.timestamp)}
                              </span>
                              {session.verified && (
                                <span className="text-[10px] text-green-500 flex items-center gap-0.5">
                                  <CheckCircle className="h-3 w-3" />
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                {session.messageCount} msgs
                              </span>
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
                              <Star className={`h-4 w-4 mr-2 ${session.isStarred ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                              {session.isStarred ? 'Unstar' : 'Star'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSessionArchive?.(session.id)}>
                              <Archive className="h-4 w-4 mr-2" />
                              {session.isArchived ? 'Unarchive' : 'Archive'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
          );
        })}

        {filteredSessions.length === 0 && (
          <div className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No chats match your search" : showArchived ? "No archived chats" : "No chat history yet"}
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-border bg-secondary/30">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{sessions.filter(s => !s.isArchived).length} active chats</span>
          <span>{sessions.filter(s => s.isArchived).length} archived</span>
        </div>
      </div>
    </div>
  );
};
