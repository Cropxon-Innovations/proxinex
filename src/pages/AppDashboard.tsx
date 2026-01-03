import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SelectToAsk, useSelectToAsk } from "@/components/SelectToAsk";
import { streamChat, Message } from "@/lib/chat";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatHistory } from "@/components/chat/ChatHistory";
import { RelatedQueries } from "@/components/chat/RelatedQueries";
import { ProjectMemory } from "@/components/chat/ProjectMemory";
import { ThemeSelector } from "@/components/chat/ThemeSelector";
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
  Star
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
}

const AppDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"details" | "history">("details");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentCost, setCurrentCost] = useState(0);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [autoMode, setAutoMode] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSessionData[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { selection, handleMouseUp, clearSelection } = useSelectToAsk();

  // Mock memories for project
  const projectMemories = [
    { id: "1", type: "fact" as const, content: "Quantum computing uses qubits that can exist in superposition", timestamp: new Date(), verified: true, sources: 3 },
    { id: "2", type: "decision" as const, content: "Focus on practical AI applications for 2025 roadmap", timestamp: new Date(), verified: true },
    { id: "3", type: "summary" as const, content: "India's AI funding grew 47% in 2024 driven by govt initiatives", timestamp: new Date(), verified: true, sources: 5 },
  ];

  // Related queries based on last message
  const relatedQueries = messages.length > 0 ? [
    "What are the key challenges in quantum computing?",
    "Compare quantum vs classical computing performance",
    "Top quantum computing companies in 2025",
    "Quantum computing applications in AI"
  ] : [];

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
      onDone: () => {
        setIsLoading(false);
        setCurrentCost(prev => prev + 0.018);
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

  const handleSelectSession = async (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("messages")
      .eq("id", sessionId)
      .single();

    if (data && !error && Array.isArray(data.messages)) {
      setMessages(data.messages as unknown as Message[]);
      setActiveSessionId(sessionId);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
          <div className="h-16 border-b border-sidebar-border flex items-center px-4 flex-shrink-0">
            <Link to="/">
              <Logo size="sm" showText={!sidebarCollapsed} />
            </Link>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {sidebarItems.map((item, index) => {
              if ('divider' in item && item.divider) {
                return <div key={index} className="my-4 border-t border-sidebar-border" />;
              }
              
              const Icon = item.icon!;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path!}
                  className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  } ${'isNew' in item && item.isNew ? 'border border-primary/50' : ''}`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${'isNew' in item && item.isNew ? 'text-primary' : ''}`} />
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

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-12 border-t border-sidebar-border flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Session: ₹{currentCost.toFixed(3)}
              </span>
              <ThemeSelector />
            </div>
          </header>

          {/* Chat Area - Scrollable */}
          <div className="flex-1 flex overflow-hidden">
            {/* Messages Column - Scrollable */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6"
              onMouseUp={(e) => handleMouseUp(e)}
            >
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
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      role={message.role}
                      content={message.content}
                      timestamp={message.timestamp}
                      isLoading={isLoading && index === messages.length - 1 && message.role === "assistant"}
                      accuracy={94}
                      cost={0.018}
                      model={autoMode ? "Auto (Gemini 2.5 Flash)" : selectedModel}
                    />
                  ))}

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
                          <span className="text-sm font-medium text-foreground">94%</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">Model</div>
                        <div className="text-sm text-foreground">
                          {autoMode ? "Auto (Gemini 2.5 Flash)" : selectedModel}
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">Query Cost</div>
                        <div className="text-lg font-semibold text-foreground">₹0.018</div>
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

      {/* Select-to-Ask Popup */}
      {selection && (
        <SelectToAsk
          selectedText={selection.text}
          position={selection.position}
          fullContext={messages.map(m => m.content).join("\n\n")}
          onClose={clearSelection}
        />
      )}
    </>
  );
};

export default AppDashboard;
