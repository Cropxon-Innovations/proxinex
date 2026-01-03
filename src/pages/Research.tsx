import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SelectToAsk, useSelectToAsk } from "@/components/SelectToAsk";
import { searchWithTavily, ResearchResponse } from "@/lib/tavily";
import { CitationAnswer } from "@/components/CitationAnswer";
import { SourceVerificationLoader } from "@/components/SourceVerificationLoader";
import { useToast } from "@/hooks/use-toast";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { Button } from "@/components/ui/button";
import { 
  Send,
  Globe,
  BookMarked,
  RefreshCw,
  Loader2,
  Search
} from "lucide-react";
import { Helmet } from "react-helmet-async";

interface ResearchMessage {
  role: "user" | "assistant";
  content: string;
  response?: ResearchResponse;
  timestamp: Date;
}

const ResearchPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ResearchMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [researchHistory, setResearchHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { selection, handleMouseUp, clearSelection } = useSelectToAsk();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: ResearchMessage = { 
      role: "user", 
      content: query, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setResearchHistory(prev => [...prev, query]);
    setQuery("");
    setIsLoading(true);

    // Add loading placeholder with verification state
    setMessages(prev => [...prev, { 
      role: "assistant", 
      content: "", 
      response: undefined,
      timestamp: new Date() 
    }]);

    try {
      const response = await searchWithTavily(query);
      
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: response.answer,
          response,
          timestamp: new Date(),
        };
        return updated;
      });

      if (response.error) {
        toast({
          title: "Research Error",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform research",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Research Mode - Proxinex</title>
        <meta name="description" content="Deep research with multi-source search, auto-citations, and cross-question memory." />
      </Helmet>

      <div className="h-screen bg-background flex overflow-hidden">
        {/* Sidebar */}
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={user}
          onSignOut={handleSignOut}
        />

        {/* Main */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-background">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Search className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground text-sm">Research Mode</h1>
                <span className="text-xs text-muted-foreground">Tavily + RAG</span>
              </div>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6" onMouseUp={handleMouseUp}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Research Mode</h2>
                    <p className="text-muted-foreground mb-6">
                      Real-time web search with verified sources, inline citations¹²³, and confidence scoring.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["Latest AI breakthroughs 2025", "Climate change solutions", "India's AI funding growth"].map((s) => (
                        <button key={s} onClick={() => setQuery(s)} className="px-3 py-1.5 text-sm bg-secondary text-muted-foreground hover:text-foreground rounded-full transition-colors">
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
                        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-md">
                          {msg.content}
                        </div>
                      ) : (
                        msg.response ? (
                          <CitationAnswer
                            answer={msg.response.answer}
                            confidence={msg.response.confidence}
                            confidence_label={msg.response.confidence_label}
                            citations={msg.response.citations}
                            isLoading={isLoading && i === messages.length - 1}
                          />
                        ) : (
                          <SourceVerificationLoader 
                            sources={[]} 
                            isComplete={false}
                          />
                        )
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Sources Panel */}
            <aside className="w-72 border-l border-border bg-card/50 p-4 hidden lg:block overflow-y-auto flex-shrink-0">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                <BookMarked className="h-4 w-4" />
                Sources
              </h3>
              {messages.length > 0 && messages[messages.length - 1].response?.citations ? (
                <div className="space-y-3">
                  {messages[messages.length - 1].response!.citations.map((citation) => (
                    <a 
                      key={citation.id} 
                      href={citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-primary font-medium">[{citation.id}]</span>
                        <span className="text-xs text-muted-foreground">{citation.score}% match</span>
                      </div>
                      <div className="text-sm text-foreground line-clamp-2">{citation.title}</div>
                      {citation.published_date && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(citation.published_date).toLocaleDateString()}
                        </div>
                      )}
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
                      <button 
                        key={i} 
                        onClick={() => setQuery(q)} 
                        className="w-full text-left text-xs p-2 rounded bg-muted/30 text-muted-foreground hover:text-foreground truncate transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          <div className="border-t border-border p-4 flex-shrink-0 bg-background">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Research any topic with real-time sources..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <Button type="submit" size="lg" disabled={!query.trim() || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
          </div>
        </main>
      </div>

      {selection && <SelectToAsk selectedText={selection.text} position={selection.position} fullContext={messages.map(m => m.content).join("\n\n")} onClose={clearSelection} />}
    </>
  );
};

export default ResearchPage;
