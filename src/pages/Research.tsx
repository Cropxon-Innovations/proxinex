import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
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
  User,
  Globe,
  BookMarked,
  RefreshCw
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

interface Source {
  title: string;
  url: string;
  relevance: number;
}

const ResearchPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [researchHistory, setResearchHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    setResearchHistory(prev => [...prev, query]);
    setQuery("");
    setIsLoading(true);

    // Generate mock sources based on query
    const mockSources: Source[] = [
      { title: "Wikipedia - " + query.split(" ").slice(0, 3).join(" "), url: "https://wikipedia.org", relevance: 0.95 },
      { title: "Nature - Research Paper", url: "https://nature.com", relevance: 0.88 },
      { title: "MIT Technology Review", url: "https://technologyreview.com", relevance: 0.82 },
      { title: "arXiv - Academic Papers", url: "https://arxiv.org", relevance: 0.79 },
    ];
    setSources(mockSources);

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
      type: "research",
      onDelta: updateAssistant,
      onDone: () => setIsLoading(false),
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

  return (
    <>
      <Helmet>
        <title>Research Mode - Proxinex</title>
        <meta name="description" content="Deep research with multi-source search, auto-citations, and cross-question memory." />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-sidebar flex flex-col transition-all duration-300`}>
          <div className="h-16 border-b border-sidebar-border flex items-center px-4">
            <Link to="/"><Logo size="sm" showText={!sidebarCollapsed} /></Link>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {sidebarItems.map((item, index) => {
              if ('divider' in item && item.divider) {
                return <div key={index} className="my-4 border-t border-sidebar-border" />;
              }
              const Icon = item.icon!;
              const isActive = item.path === "/app/research";
              return (
                <Link
                  key={item.path}
                  to={item.path!}
                  className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${
                    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="h-12 border-t border-sidebar-border flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/50">
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Search className="h-5 w-5 text-primary" />
              <h1 className="font-semibold text-foreground">Research Mode</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Deep Search</span>
            </div>
          </header>

          <div className="flex-1 flex">
            <div className="flex-1 overflow-y-auto p-6" onMouseUp={handleMouseUp}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Research Mode</h2>
                    <p className="text-muted-foreground mb-6">
                      Multi-source search with auto-citations, timeline-based freshness, and cross-question memory.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["Latest AI breakthroughs 2024", "Climate change solutions", "Web3 adoption trends"].map((s) => (
                        <button key={s} onClick={() => setQuery(s)} className="px-3 py-1.5 text-sm bg-secondary text-muted-foreground hover:text-foreground rounded-full">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((msg, i) => (
                    <div key={i} className={msg.role === "user" ? "flex justify-end" : ""}>
                      {msg.role === "user" ? (
                        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-md">{msg.content}</div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-card border border-border rounded-lg p-6">
                            <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
                              {msg.content}
                              {isLoading && i === messages.length - 1 && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
                            </div>
                          </div>
                          {i === messages.length - 1 && !isLoading && sources.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {sources.map((s, idx) => (
                                <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80">
                                  <span>[{idx + 1}]</span>
                                  <span>{s.title}</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ))}
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

            {/* Sources Panel */}
            <aside className="w-72 border-l border-border bg-card/50 p-4 hidden lg:block overflow-y-auto">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookMarked className="h-4 w-4" />
                Sources
              </h3>
              {sources.length > 0 ? (
                <div className="space-y-3">
                  {sources.map((s, idx) => (
                    <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-primary font-medium">[{idx + 1}]</span>
                        <span className="text-xs text-muted-foreground">{Math.round(s.relevance * 100)}% match</span>
                      </div>
                      <div className="text-sm text-foreground truncate">{s.title}</div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sources will appear here after your first query.</p>
              )}

              {researchHistory.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <RefreshCw className="h-3 w-3" />
                    Research Memory
                  </h4>
                  <div className="space-y-2">
                    {researchHistory.slice(-5).map((q, i) => (
                      <button key={i} onClick={() => setQuery(q)} className="w-full text-left text-xs p-2 rounded bg-muted/30 text-muted-foreground hover:text-foreground truncate">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          <div className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Research any topic..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <Button type="submit" size="lg" disabled={!query.trim() || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
          </div>
        </main>
      </div>

      {selection && <InlineAsk selectedText={selection.text} position={selection.position} onClose={clearSelection} />}
    </>
  );
};

export default ResearchPage;
