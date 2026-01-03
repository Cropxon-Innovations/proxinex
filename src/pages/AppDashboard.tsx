import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { InlineAsk, useTextSelection } from "@/components/InlineAsk";
import { streamChat, Message } from "@/lib/chat";
import { useToast } from "@/hooks/use-toast";
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
  Send,
  Star,
  Clock,
  DollarSign,
  ExternalLink,
  LogOut,
  Loader2,
  User
} from "lucide-react";
import { Helmet } from "react-helmet-async";

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
  { icon: Key, label: "API Keys", path: "/app/keys" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

const AppDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCost, setCurrentCost] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { selection, handleMouseUp, clearSelection } = useTextSelection();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const lastAssistantMessage = messages.filter(m => m.role === "assistant").pop();

  return (
    <>
      <Helmet>
        <title>Proxinex App - AI Intelligence Control</title>
        <meta name="description" content="Access the Proxinex AI Intelligence Control Plane." />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside 
          className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-sidebar flex flex-col transition-all duration-300`}
        >
          <div className="h-16 border-b border-sidebar-border flex items-center px-4">
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
            <div className="p-4 border-t border-sidebar-border">
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
            className="h-12 border-t border-sidebar-border flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-foreground">Chat</h1>
              {messages.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {messages.length} messages
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Session cost: ₹{currentCost.toFixed(3)}
              </span>
            </div>
          </header>

          {/* Chat Area */}
          <div className="flex-1 flex">
            <div 
              className="flex-1 overflow-y-auto p-6"
              onMouseUp={handleMouseUp}
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
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((message, index) => (
                    <div key={index} className={message.role === "user" ? "flex justify-end" : ""}>
                      {message.role === "user" ? (
                        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-md">
                          {message.content}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-card border border-border rounded-lg p-6">
                            <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
                              {message.content}
                              {isLoading && index === messages.length - 1 && (
                                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                              )}
                            </div>
                          </div>

                          {index === messages.length - 1 && !isLoading && (
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-primary fill-primary" />
                                <span className="text-foreground font-medium">94% Accuracy</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>LIVE</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                <span>₹0.018</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Right Panel */}
            {lastAssistantMessage && (
              <aside className="w-80 border-l border-border bg-card/50 p-4 hidden lg:block overflow-y-auto">
                <h3 className="font-semibold text-foreground mb-4">Response Details</h3>
                
                <div className="space-y-4">
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
                    <div className="text-xs text-muted-foreground mb-1">Freshness</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm text-foreground">LIVE</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Query Cost</div>
                    <div className="text-lg font-semibold text-foreground">₹0.018</div>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Model</div>
                    <div className="text-sm text-foreground">Gemini 2.5 Flash</div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Inline Ask™</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Highlight any text in the response to ask follow-up questions.
                  </p>
                </div>
              </aside>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask anything..."
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={!query.trim() || isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Inline Ask Popup */}
      {selection && (
        <InlineAsk
          selectedText={selection.text}
          position={selection.position}
          onClose={clearSelection}
        />
      )}
    </>
  );
};

export default AppDashboard;
