import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Pin, 
  MessageSquare, 
  Search, 
  ArrowLeft, 
  Star, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Clock,
  User,
  Bot,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Message } from "@/lib/chat";

interface PinnedChat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
  pinnedMessages: Message[];
}

export default function PinnedContent() {
  const { user } = useAuth();
  const [pinnedChats, setPinnedChats] = useState<PinnedChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedChats, setExpandedChats] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<"all" | "chats" | "messages">("all");

  useEffect(() => {
    if (user) {
      fetchPinnedContent();
    }
  }, [user]);

  const fetchPinnedContent = async () => {
    if (!user) return;
    
    try {
      // Fetch pinned chats
      const { data: pinnedChatsData, error: pinnedError } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_pinned", true)
        .order("updated_at", { ascending: false });

      if (pinnedError) throw pinnedError;

      // Fetch all chats that have pinned messages
      const { data: allChats, error: allError } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (allError) throw allError;

      // Process chats to find pinned messages
      const processedChats: PinnedChat[] = [];
      const pinnedChatIds = new Set(pinnedChatsData?.map(c => c.id) || []);

      // Add pinned chats first
      pinnedChatsData?.forEach(chat => {
        const messages = Array.isArray(chat.messages) 
          ? (chat.messages as unknown as Message[])
          : [];
        const pinnedMessages = messages.filter(m => m.isPinned);
        
        processedChats.push({
          id: chat.id,
          title: chat.title,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          messages,
          pinnedMessages
        });
      });

      // Add chats with pinned messages that aren't already pinned chats
      allChats?.forEach(chat => {
        if (pinnedChatIds.has(chat.id)) return;
        
        const messages = Array.isArray(chat.messages) 
          ? (chat.messages as unknown as Message[])
          : [];
        const pinnedMessages = messages.filter(m => m.isPinned);
        
        if (pinnedMessages.length > 0) {
          processedChats.push({
            id: chat.id,
            title: chat.title,
            created_at: chat.created_at,
            updated_at: chat.updated_at,
            messages,
            pinnedMessages
          });
        }
      });

      setPinnedChats(processedChats);
    } catch (error) {
      console.error("Error fetching pinned content:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChatExpanded = (chatId: string) => {
    setExpandedChats(prev => ({
      ...prev,
      [chatId]: !prev[chatId]
    }));
  };

  const filteredChats = pinnedChats.filter(chat => {
    const matchesSearch = 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.pinnedMessages.some(m => 
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    if (filterType === "chats") {
      return matchesSearch && chat.pinnedMessages.length === 0;
    }
    if (filterType === "messages") {
      return matchesSearch && chat.pinnedMessages.length > 0;
    }
    return matchesSearch;
  });

  const totalPinnedMessages = pinnedChats.reduce(
    (acc, chat) => acc + chat.pinnedMessages.length, 
    0
  );

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, idx) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={idx} className="bg-warning/40 text-foreground rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/app">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Pin className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Pinned Content</h1>
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-5xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Pin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pinnedChats.length}</p>
                <p className="text-sm text-muted-foreground">Pinned Chats</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-xl bg-accent/20">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalPinnedMessages}</p>
                <p className="text-sm text-muted-foreground">Pinned Messages</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-xl bg-warning/20">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {pinnedChats.filter(c => c.pinnedMessages.length > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Chats with Pins</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pinned content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={(v: "all" | "chats" | "messages") => setFilterType(v)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pinned</SelectItem>
              <SelectItem value="chats">Pinned Chats Only</SelectItem>
              <SelectItem value="messages">With Pinned Messages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Pin className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Pinned Content</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {searchQuery 
                  ? "No results match your search. Try a different query."
                  : "Pin important chats or messages to access them quickly here."}
              </p>
              <Link to="/app" className="mt-4">
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Go to Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-4">
              {filteredChats.map(chat => (
                <Collapsible
                  key={chat.id}
                  open={expandedChats[chat.id]}
                  onOpenChange={() => toggleChatExpanded(chat.id)}
                >
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="flex flex-row items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Pin className="h-4 w-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-base">
                              {searchQuery ? highlightMatch(chat.title, searchQuery) : chat.title}
                            </CardTitle>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(chat.updated_at), "MMM d, yyyy")}
                              </span>
                              {chat.pinnedMessages.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {chat.pinnedMessages.length} pinned message{chat.pinnedMessages.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/app?chat=${chat.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ExternalLink className="h-3 w-3" />
                              Open
                            </Button>
                          </Link>
                          {expandedChats[chat.id] ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      {chat.pinnedMessages.length > 0 ? (
                        <CardContent className="p-4 pt-0 space-y-3">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Pinned Messages
                          </div>
                          {chat.pinnedMessages.map((message, idx) => (
                            <div 
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                            >
                              <div className={`p-1.5 rounded-full ${
                                message.role === 'user' 
                                  ? 'bg-primary/20' 
                                  : 'bg-accent/20'
                              }`}>
                                {message.role === 'user' ? (
                                  <User className="h-3 w-3 text-primary" />
                                ) : (
                                  <Bot className="h-3 w-3 text-accent" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium capitalize text-foreground">
                                    {message.role}
                                  </span>
                                  <Pin className="h-3 w-3 text-warning" />
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {searchQuery 
                                    ? highlightMatch(message.content, searchQuery) 
                                    : message.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      ) : (
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground text-center py-4">
                            This chat is pinned but has no pinned messages.
                          </p>
                        </CardContent>
                      )}
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
