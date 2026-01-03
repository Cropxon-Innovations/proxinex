import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
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
  ExternalLink
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

const mockResponse = {
  content: `Quantum computing represents a paradigm shift in computational capability, leveraging quantum mechanical phenomena to process information in fundamentally different ways than classical computers.

**Key Concepts:**

1. **Qubits**: Unlike classical bits (0 or 1), qubits can exist in superposition—representing both states simultaneously.

2. **Entanglement**: Quantum particles can be correlated in ways that have no classical analog, enabling parallel processing of exponentially more states.

3. **Quantum Gates**: Operations on qubits that manipulate quantum states, analogous to logic gates in classical computing.

**Current State (2024):**
- IBM has achieved 1,000+ qubit processors
- Google demonstrated quantum supremacy in 2019
- Error correction remains the primary challenge
`,
  accuracy: 94,
  freshness: "2 hours ago",
  cost: "₹0.021",
  sources: [
    { title: "IBM Quantum Computing", url: "https://www.ibm.com/quantum" },
    { title: "Nature - Quantum Supremacy", url: "https://nature.com" },
    { title: "MIT Technology Review", url: "https://technologyreview.com" },
  ],
  model: "Claude 3.5 Sonnet",
};

const AppPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [hasQueried, setHasQueried] = useState(true);
  const location = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setHasQueried(true);
    }
  };

  return (
    <>
      <Helmet>
        <title>Proxinex App - AI Intelligence Control</title>
        <meta name="description" content="Access the Proxinex AI Intelligence Control Plane. Chat, research, sandbox, and more." />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside 
          className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-sidebar flex flex-col transition-all duration-300`}
        >
          {/* Logo */}
          <div className="h-16 border-b border-sidebar-border flex items-center px-4">
            <Link to="/">
              <Logo size="sm" showText={!sidebarCollapsed} />
            </Link>
          </div>

          {/* Nav Items */}
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
                  {!sidebarCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-12 border-t border-sidebar-border flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="h-16 border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-foreground">Chat</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Back to Home
                </Button>
              </Link>
            </div>
          </header>

          {/* Chat Area */}
          <div className="flex-1 flex">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {hasQueried ? (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* User Query */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-md">
                      Explain quantum computing and its current state
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="space-y-4">
                    {/* Response Content */}
                    <div className="bg-card border border-border rounded-lg p-6">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
                          {mockResponse.content}
                        </div>
                      </div>
                    </div>

                    {/* Trust Bar */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span className="text-foreground font-medium">{mockResponse.accuracy}% Accuracy</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>LIVE ({mockResponse.freshness})</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>{mockResponse.cost}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Model: {mockResponse.model}
                      </div>
                    </div>

                    {/* Sources */}
                    <div className="flex flex-wrap gap-2">
                      {mockResponse.sources.map((source, index) => (
                        <a
                          key={index}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                        >
                          <span>[{index + 1}]</span>
                          <span>{source.title}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      What can I help you with?
                    </h2>
                    <p className="text-muted-foreground">
                      Ask anything. Get accurate, cited answers.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Inspector */}
            <aside className="w-80 border-l border-border bg-card/50 p-4 hidden lg:block">
              <h3 className="font-semibold text-foreground mb-4">Response Details</h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Accuracy Score</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${mockResponse.accuracy}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{mockResponse.accuracy}%</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Freshness</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm text-foreground">LIVE</span>
                    <span className="text-xs text-muted-foreground">{mockResponse.freshness}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Query Cost</div>
                  <div className="text-lg font-semibold text-foreground">{mockResponse.cost}</div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Model Used</div>
                  <div className="text-sm text-foreground">{mockResponse.model}</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">Sources ({mockResponse.sources.length})</h4>
                <div className="space-y-2">
                  {mockResponse.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-xs text-primary mb-0.5">[{index + 1}]</div>
                      <div className="text-sm text-foreground truncate">{source.title}</div>
                    </a>
                  ))}
                </div>
              </div>
            </aside>
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
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <Button type="submit" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>Press Enter to send</span>
                <span>•</span>
                <span>Shift+Enter for new line</span>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default AppPage;
