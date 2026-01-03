import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PersistentInlineAsk, usePersistentInlineAsk } from "@/components/PersistentInlineAsk";
import { streamChat, Message, ChatMetrics } from "@/lib/chat";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { RelatedQueries } from "@/components/chat/RelatedQueries";
import { ProjectMemory } from "@/components/chat/ProjectMemory";
import { ThemeSelector } from "@/components/chat/ThemeSelector";
import { NotificationCenter } from "@/components/NotificationCenter";
import { KeyboardShortcutsButton, KeyboardShortcutsIndicator } from "@/components/KeyboardShortcuts";
import { ChatExport } from "@/components/chat/ChatExport";
import { TokenCounter } from "@/components/chat/TokenCounter";
import { PinnedMessages } from "@/components/chat/PinnedMessages";
import { InlineAskData, InlineAskComment } from "@/components/chat/InlineAskComment";
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Layers, 
  BookOpen, 
  FileText, 
  Image, 
  Video, 
  Code,
  BarChart3,
  Key,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  History,
  Star,
  PanelLeftClose,
  PanelLeft,
  Pin,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const sidebarItems = [
  { icon: Plus, label: "New Session", path: "/app", isNew: true },
  { icon: MessageSquare, label: "Chat", path: "/app/chat" },
  { icon: Search, label: "Research", path: "/app/research" },
  { icon: Layers, label: "Sandbox", path: "/app/sandbox" },
  { icon: BookOpen, label: "Notebooks", path: "/app/notebooks" },
  { icon: FileText, label: "Documents", path: "/app/documents" },
  { icon: Image, label: "Images", path: "/app/images" },
  { icon: Video, label: "Video", path: "/app/video" },
  { icon: Code, label: "API Playground", path: "/app/api" },
  { divider: true },
  { icon: Star, label: "Projects", path: "/app/projects" },
  { icon: BarChart3, label: "Usage & Cost", path: "/app/usage" },
  { icon: Key, label: "API Keys", path: "/app/api-keys" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

interface ChatSessionData {
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

interface MessageWithMetrics extends Message {
  metrics?: ChatMetrics;
}

const AppDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"details" | "history">("details");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<MessageWithMetrics[]>([]);
  const [lastMetrics, setLastMetrics] = useState<ChatMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentCost, setCurrentCost] = useState(0);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [autoMode, setAutoMode] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSessionData[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [relatedQueries, setRelatedQueries] = useState<string[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<MessageWithMetrics[]>([]);
  const [inlineAsks, setInlineAsks] = useState<InlineAskData[]>([]);
  const [maximizedInlineAsk, setMaximizedInlineAsk] = useState<InlineAskData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { selection, handleMouseUp, clearSelection, isMaximized, toggleMaximize } = usePersistentInlineAsk();

  // Mock memories for project
  const projectMemories = [
    { id: "1", type: "fact" as const, content: "Quantum computing uses qubits that can exist in superposition", timestamp: new Date(), verified: true, sources: 3 },
    { id: "2", type: "decision" as const, content: "Focus on practical AI applications for 2025 roadmap", timestamp: new Date(), verified: true },
    { id: "3", type: "summary" as const, content: "India's AI funding grew 47% in 2024 driven by govt initiatives", timestamp: new Date(), verified: true, sources: 5 },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat sessions from database
  useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (data && !error) {
        setChatSessions(data.map(session => ({
          id: session.id,
          title: session.title,
          preview: "Chat session",
          timestamp: new Date(session.updated_at),
          messageCount: Array.isArray(session.messages) ? session.messages.length : 0,
          verified: true,
          citationCount: 0,
        })));
      }
    };

    loadSessions();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    let assistantContent = "";
    
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent, timestamp: new Date() }];
      });
    };

    await streamChat({
      messages: [...messages, userMessage],
      type: "chat",
      onDelta: updateAssistant,
      onDone: (metrics, dynamicRelatedQueries) => {
        setIsLoading(false);
        if (metrics) {
          setLastMetrics(metrics);
          setCurrentCost(prev => prev + metrics.cost);
          // Update the last assistant message with metrics
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === "assistant") {
              return prev.map((m, i) => 
                i === prev.length - 1 ? { ...m, metrics } : m
              );
            }
            return prev;
          });
        }
        // Set dynamic related queries from AI
        if (dynamicRelatedQueries && dynamicRelatedQueries.length > 0) {
          setRelatedQueries(dynamicRelatedQueries);
        }
        // Save session to history
        saveChatSession();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        setIsLoading(false);
      },
    });
  };

  const saveChatSession = async () => {
    if (!user || messages.length === 0) return;

    const title = messages[0]?.content.slice(0, 50) || "New Chat";
    
    const { data, error } = await supabase
      .from("chat_sessions")
      .upsert({
        id: activeSessionId || undefined,
        user_id: user.id,
        title,
        messages: messages as any,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (data && !error) {
      setActiveSessionId(data.id);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId);

    if (!error) {
      setChatSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({ title: "Session deleted" });
    }
  };

  // Load inline asks for a session
  const loadInlineAsks = async (sessionId: string) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("inline_asks")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", user.id);
    
    if (data && !error) {
      const loadedAsks: InlineAskData[] = data.map(ask => ({
        id: ask.id,
        selectedText: ask.highlighted_text,
        question: ask.question,
        answer: ask.answer || "",
        confidence: 85,
        timestamp: new Date(ask.created_at),
        messageIndex: 0,
        startOffset: ask.position_start || 0,
        endOffset: ask.position_end || 0,
        conversationHistory: Array.isArray(ask.conversation_history) 
          ? ask.conversation_history as any
          : []
      }));
      setInlineAsks(loadedAsks);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("messages")
      .eq("id", sessionId)
      .single();

    if (data && !error && Array.isArray(data.messages)) {
      setMessages(data.messages as unknown as MessageWithMetrics[]);
      setActiveSessionId(sessionId);
      // Reset metrics to last message's metrics if available
      const lastAssistantMsg = (data.messages as unknown as MessageWithMetrics[])
        .filter(m => m.role === "assistant")
        .pop();
      if (lastAssistantMsg?.metrics) {
        setLastMetrics(lastAssistantMsg.metrics);
      }
      
      // Load inline asks for this session
      await loadInlineAsks(sessionId);
    }
  };

  const handleStarSession = (sessionId: string) => {
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, isStarred: !s.isStarred } : s
    ));
    toast({ title: "Session starred" });
  };

  const handleArchiveSession = (sessionId: string) => {
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, isArchived: !s.isArchived } : s
    ));
    toast({ title: "Session archived" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Handle new session - save current chat first
  const handleNewSession = async () => {
    if (messages.length > 0) {
      await saveChatSession();
      toast({ title: "Chat saved to history" });
    }
    // Reset state for new session
    setMessages([]);
    setActiveSessionId(null);
    setLastMetrics(null);
    setCurrentCost(0);
    setRelatedQueries([]);
    setQuery("");
    setPinnedMessages([]);
    setInlineAsks([]);
  };

  // Pin/Unpin message handlers
  const handlePinMessage = (index: number) => {
    const message = messages[index];
    if (!message) return;

    const isPinned = pinnedMessages.some(m => m.originalIndex === index);
    
    if (isPinned) {
      setPinnedMessages(prev => prev.filter(m => m.originalIndex !== index));
      toast({ title: "Message unpinned" });
    } else {
      setPinnedMessages(prev => [...prev, { ...message, originalIndex: index }]);
      toast({ title: "Message pinned" });
    }
  };

  const handleScrollToMessage = (index: number) => {
    messageRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Inline Ask save handler - persist to database
  const handleSaveInlineAsk = async (data: InlineAskData) => {
    setInlineAsks(prev => [...prev, data]);
    
    // Persist to database
    if (user && activeSessionId) {
      try {
        const conversationData = data.conversationHistory 
          ? data.conversationHistory.map(c => ({
              role: c.role,
              content: c.content,
              timestamp: c.timestamp.toISOString()
            }))
          : [];
        
        await supabase.from("inline_asks").insert([{
          user_id: user.id,
          session_id: activeSessionId,
          highlighted_text: data.selectedText,
          question: data.question,
          answer: data.answer,
          position_start: data.startOffset,
          position_end: data.endOffset,
          conversation_history: conversationData
        }]);
      } catch (error) {
        console.error("Failed to persist inline ask:", error);
      }
    }
    
    toast({ title: "Inline Ask saved" });
  };
  const handleVoiceStart = () => {
    setIsRecording(true);
    toast({ title: "Voice recording started", description: "Speak your query..." });
  };

  const handleVoiceStop = () => {
    setIsRecording(false);
    toast({ title: "Voice recording stopped" });
  };

  const handleFileUpload = (files: FileList) => {
    toast({ title: `${files.length} file(s) selected`, description: "Processing..." });
  };

  const handleRelatedQueryClick = (q: string) => {
    setQuery(q);
  };

  const lastAssistantMessage = messages.filter(m => m.role === "assistant").pop();

  return (
    <>
      <Helmet>
        <title>Proxinex App - AI Intelligence Control</title>
        <meta name="description" content="Access the Proxinex AI Intelligence Control Plane." />
      </Helmet>

      <div className="h-screen bg-background flex overflow-hidden">
        {/* Left Sidebar - Fixed */}
        <aside 
          className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-sidebar flex flex-col flex-shrink-0 transition-all duration-300`}
        >
          {/* Collapse Toggle at Top */}
          <div className="h-14 border-b border-sidebar-border flex items-center justify-between px-3 flex-shrink-0">
            <Link to="/" className={sidebarCollapsed ? "mx-auto" : ""}>
              <Logo size="sm" showText={!sidebarCollapsed} />
            </Link>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors ${sidebarCollapsed ? "hidden" : ""}`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {/* Expand button when collapsed */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 mx-auto mt-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              title="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}

          <nav className="flex-1 py-4 overflow-y-auto">
            {sidebarItems.map((item, index) => {
              if ('divider' in item && item.divider) {
                return <div key={index} className="my-4 border-t border-sidebar-border" />;
              }
              
              const Icon = item.icon!;
              const isActive = location.pathname === item.path;
              const isNewSession = 'isNew' in item && item.isNew;
              
              return (
                <Link
                  key={item.path}
                  to={item.path!}
                  onClick={isNewSession ? handleNewSession : undefined}
                  className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  } ${isNewSession ? 'border border-primary/50' : ''}`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isNewSession ? 'text-primary' : isActive ? 'text-primary' : ''}`} />
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          {!sidebarCollapsed && user && (
            <div className="p-4 border-t border-sidebar-border flex-shrink-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header - Fixed */}
          <header className="h-16 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-background">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-foreground">Chat</h1>
              {messages.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {messages.length} messages
                </span>
              )}
              {autoMode && (
                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Auto Mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Token Counter */}
              {query && <TokenCounter text={query} model={selectedModel} />}
              <KeyboardShortcutsIndicator />
              <span className="text-sm text-muted-foreground">
                Session: ₹{currentCost.toFixed(3)}
              </span>
              <ChatExport messages={messages} sessionTitle={messages[0]?.content.slice(0, 30) || "Chat"} />
              <KeyboardShortcutsButton />
              <NotificationCenter />
              <ThemeSelector />
            </div>
          </header>

          {/* Chat Area - Scrollable */}
          <div className="flex-1 flex overflow-hidden">
            {/* Messages Column - Scrollable */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto"
              onMouseUp={(e) => handleMouseUp(e, messages.map(m => m.content).join("\n\n"))}
            >
              {/* Pinned Messages Section */}
              {pinnedMessages.length > 0 && (
                <PinnedMessages
                  messages={pinnedMessages}
                  onUnpin={handlePinMessage}
                  onScrollToMessage={handleScrollToMessage}
                />
              )}

              <div className="p-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        What can I help you with?
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Ask anything. Get accurate, cited answers. Highlight text to use Inline Ask™.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          "Explain quantum computing",
                          "Compare React vs Vue",
                          "Latest AI research trends"
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => setQuery(suggestion)}
                            className="px-3 py-1.5 text-sm bg-secondary text-muted-foreground hover:text-foreground rounded-full transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto">
                    {messages.map((message, index) => {
                      const messageMetrics = message.metrics || (message.role === "assistant" ? lastMetrics : null);
                      const isPinned = pinnedMessages.some(m => m.originalIndex === index);
                      return (
                        <div
                          key={index}
                          ref={(el) => { messageRefs.current[index] = el; }}
                        >
                          <ChatMessage
                            role={message.role}
                            content={message.content}
                            timestamp={message.timestamp}
                            isLoading={isLoading && index === messages.length - 1 && message.role === "assistant"}
                            accuracy={messageMetrics?.accuracy || 85}
                            cost={messageMetrics?.cost || 0.012}
                            model={messageMetrics?.model || (autoMode ? "Auto (Gemini 2.5 Flash)" : selectedModel)}
                            isPinned={isPinned}
                            onPin={() => handlePinMessage(index)}
                          />
                        </div>
                      );
                    })}

                    {/* Related Queries */}
                    {!isLoading && messages.length > 0 && (
                      <RelatedQueries
                        queries={relatedQueries}
                        onQueryClick={handleRelatedQueryClick}
                      />
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Fixed */}
            {messages.length > 0 && (
              <aside className="w-80 border-l border-border bg-card/50 flex-shrink-0 hidden lg:flex flex-col overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-border flex-shrink-0">
                  <button
                    onClick={() => setRightPanelTab("details")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      rightPanelTab === "details" 
                        ? "text-primary border-b-2 border-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Star className="h-4 w-4 inline mr-1.5" />
                    Details
                  </button>
                  <button
                    onClick={() => setRightPanelTab("history")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      rightPanelTab === "history" 
                        ? "text-primary border-b-2 border-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <History className="h-4 w-4 inline mr-1.5" />
                    History
                  </button>
                </div>

                {/* Panel Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  {rightPanelTab === "details" ? (
                    <div className="p-4 space-y-4">
                      {/* Response Details */}
                      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">Accuracy Score</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: "94%" }} />
                          </div>
                          <span className="text-sm font-medium text-foreground">{lastMetrics?.accuracy || 85}%</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">Model</div>
                        <div className="text-sm text-foreground">
                          {lastMetrics?.model || (autoMode ? "Auto (Gemini 2.5 Flash)" : selectedModel)}
                        </div>
                        {lastMetrics && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {lastMetrics.inputTokens} in / {lastMetrics.outputTokens} out tokens
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">Query Cost</div>
                        <div className="text-lg font-semibold text-foreground">₹{(lastMetrics?.cost || 0.012).toFixed(3)}</div>
                      </div>

                      {/* Project Memory */}
                      <ProjectMemory
                        projectName="Current Project"
                        memories={projectMemories}
                        onDeleteMemory={(id) => toast({ title: "Memory removed" })}
                      />

                      {/* Inline Ask Tip */}
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">Inline Ask™</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Highlight any text to: Explain, Rewrite, Verify, or Ask follow-up questions.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ChatHistory
                      sessions={chatSessions}
                      activeSessionId={activeSessionId || undefined}
                      onSessionSelect={handleSelectSession}
                      onSessionDelete={handleDeleteSession}
                      onSessionStar={handleStarSession}
                      onSessionArchive={handleArchiveSession}
                    />
                  )}
                </div>
              </aside>
            )}
          </div>

          {/* Input Area - Fixed */}
          <ChatInput
            query={query}
            setQuery={setQuery}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onFileUpload={handleFileUpload}
            onImageUpload={handleFileUpload}
            onVideoUpload={handleFileUpload}
            onVoiceStart={handleVoiceStart}
            onVoiceStop={handleVoiceStop}
            isRecording={isRecording}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            autoMode={autoMode}
            onAutoModeChange={setAutoMode}
          />
        </main>
      </div>

      {/* Persistent Inline Ask Popup */}
      {selection && (
        <PersistentInlineAsk
          selectedText={selection.text}
          position={selection.position}
          fullContext={messages.map(m => m.content).join("\n\n")}
          onClose={clearSelection}
          onSaveInlineAsk={handleSaveInlineAsk}
          hasActivePopup={false}
          messageIndex={selection.messageIndex}
          selectionOffset={selection.selectionOffset}
          isMaximized={isMaximized}
          onToggleMaximize={toggleMaximize}
        />
      )}

      {/* Maximized Inline Ask Comment */}
      {maximizedInlineAsk && (
        <InlineAskComment
          data={maximizedInlineAsk}
          onMaximize={() => {}}
          onClose={() => setMaximizedInlineAsk(null)}
          isMinimized={false}
        />
      )}
    </>
  );
};

export default AppDashboard;
