import { useState, useMemo } from "react";
import { 
  MessageSquare, 
  Clock,
  CheckCircle,
  Star,
  Archive,
  Calendar,
  ChevronDown,
  ChevronRight,
  Search,
  Pin,
  CalendarDays,
  CalendarRange,
  History,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChatActionsMenu } from "./ChatActionsMenu";
import { ChatReadAloud } from "./ChatReadAloud";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, getMonth, getYear } from "date-fns";

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
  isPinned?: boolean;
  isResearch?: boolean;
  content?: string; // For read aloud
}

type DateFilter = "all" | "today" | "yesterday" | "this_week" | "this_month" | "this_year";
type CategoryFilter = "all" | "chat" | "research";

interface ChatHistoryProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionStar?: (sessionId: string) => void;
  onSessionArchive?: (sessionId: string) => void;
  onSessionPin?: (sessionId: string) => void;
  onSessionRename?: (sessionId: string, newTitle: string) => void;
  onSessionExport?: (sessionId: string) => void;
}

export const ChatHistory = ({
  sessions,
  activeSessionId,
  onSessionSelect,
  onSessionDelete,
  onSessionStar,
  onSessionArchive,
  onSessionPin,
  onSessionRename,
  onSessionExport,
}: ChatHistoryProps) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["today", "yesterday"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [showArchived, setShowArchived] = useState(false);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(s => showArchived ? s.isArchived : !s.isArchived);
    
    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(s => 
        categoryFilter === "research" ? s.isResearch : !s.isResearch
      );
    }
    
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
  }, [sessions, searchQuery, dateFilter, categoryFilter, showArchived]);

  // Group sessions by timeline - NO separate pinned group, just show inline icons
  const groupedSessions = useMemo(() => {
    const groups: Record<string, { label: string; icon: JSX.Element; sessions: ChatSession[]; order: number }> = {};
    
    const baseGroups = {
      today: { label: "Today", icon: <Calendar className="h-4 w-4 text-green-400" />, sessions: [] as ChatSession[], order: 0 },
      yesterday: { label: "Yesterday", icon: <Calendar className="h-4 w-4 text-blue-400" />, sessions: [] as ChatSession[], order: 1 },
      this_week: { label: "This Week", icon: <CalendarDays className="h-4 w-4 text-purple-400" />, sessions: [] as ChatSession[], order: 2 },
      this_month: { label: "This Month", icon: <CalendarRange className="h-4 w-4 text-orange-400" />, sessions: [] as ChatSession[], order: 3 },
    };
    
    Object.assign(groups, baseGroups);

    // Sort sessions - pinned first within each group, then by date
    const sorted = [...filteredSessions].sort((a, b) => {
      // Pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Starred items next
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      // Then by date
      const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
      const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    sorted.forEach(session => {
      const date = session.timestamp instanceof Date ? session.timestamp : new Date(session.timestamp);
      
      if (isToday(date)) {
        groups.today.sessions.push(session);
      } else if (isYesterday(date)) {
        groups.yesterday.sessions.push(session);
      } else if (isThisWeek(date)) {
        groups.this_week.sessions.push(session);
      } else if (isThisMonth(date)) {
        groups.this_month.sessions.push(session);
      } else if (isThisYear(date)) {
        const monthKey = `month_${getMonth(date)}`;
        const monthLabel = format(date, "MMMM yyyy");
        if (!groups[monthKey]) {
          groups[monthKey] = {
            label: monthLabel,
            icon: <CalendarRange className="h-4 w-4 text-muted-foreground" />,
            sessions: [],
            order: 100 + (12 - getMonth(date)),
          };
        }
        groups[monthKey].sessions.push(session);
      } else {
        const year = getYear(date);
        const yearKey = `year_${year}`;
        if (!groups[yearKey]) {
          groups[yearKey] = {
            label: year.toString(),
            icon: <History className="h-4 w-4 text-muted-foreground" />,
            sessions: [],
            order: 1000 + (2030 - year),
          };
        }
        groups[yearKey].sessions.push(session);
      }
    });

    const sortedGroups: typeof groups = {};
    Object.entries(groups)
      .sort(([, a], [, b]) => a.order - b.order)
      .forEach(([key, value]) => {
        sortedGroups[key] = value;
      });

    return sortedGroups;
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
    { value: "all", label: "All" },
    { value: "today", label: "Today" },
    { value: "this_week", label: "Week" },
    { value: "this_month", label: "Month" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Collapsible Header */}
      <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="p-3 border-b border-border flex items-center justify-between hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">History</h3>
              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {sessions.filter(s => !s.isArchived).length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={showArchived ? "secondary" : "ghost"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowArchived(!showArchived);
                }}
                className="h-6 w-6 p-0"
              >
                <Archive className="h-3 w-3" />
              </Button>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isHistoryOpen ? "rotate-180" : ""}`} />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {/* Filters */}
          <div className="p-3 border-b border-border space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-1">
              <Button
                variant={categoryFilter === "all" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCategoryFilter("all")}
                className="h-6 px-2 text-[10px] flex-1"
              >
                <Filter className="h-3 w-3 mr-1" />
                All
              </Button>
              <Button
                variant={categoryFilter === "chat" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCategoryFilter("chat")}
                className="h-6 px-2 text-[10px] flex-1"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Chat
              </Button>
              <Button
                variant={categoryFilter === "research" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCategoryFilter("research")}
                className="h-6 px-2 text-[10px] flex-1"
              >
                <Search className="h-3 w-3 mr-1" />
                Research
              </Button>
            </div>
            
            {/* Date Filter */}
            <div className="flex gap-1 flex-wrap">
              {dateFilterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={dateFilter === option.value ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDateFilter(option.value)}
                  className="h-6 px-2 text-[10px] flex-1"
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
                              {session.isResearch ? (
                                <Search className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              ) : (
                                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  {session.isPinned && (
                                    <Pin className="h-3 w-3 text-primary fill-primary" />
                                  )}
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
                                  {/* Category Tag */}
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                                    session.isResearch 
                                      ? "bg-primary/20 text-primary" 
                                      : "bg-muted text-muted-foreground"
                                  }`}>
                                    {session.isResearch ? "Research" : "Chat"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>

                          <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {session.content && (
                              <ChatReadAloud content={session.content} sessionTitle={session.title} />
                            )}
                            
                            <ChatActionsMenu
                              sessionId={session.id}
                              sessionTitle={session.title}
                              isPinned={session.isPinned}
                              isArchived={session.isArchived}
                              onRename={(id, newTitle) => onSessionRename?.(id, newTitle)}
                              onPin={(id) => onSessionPin?.(id)}
                              onArchive={(id) => onSessionArchive?.(id)}
                              onDelete={(id) => onSessionDelete(id)}
                              onExport={(id) => onSessionExport?.(id)}
                            />
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
                  {searchQuery ? "No matches found" : showArchived ? "No archived sessions" : "No history yet"}
                </p>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="p-3 border-t border-border bg-secondary/30">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{sessions.filter(s => !s.isArchived && !s.isResearch).length} chats</span>
              <span>{sessions.filter(s => !s.isArchived && s.isResearch).length} research</span>
              <span>{sessions.filter(s => s.isPinned).length} pinned</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
