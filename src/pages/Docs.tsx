import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Code, 
  Database, 
  Key, 
  Zap, 
  ChevronRight,
  Copy,
  Check,
  Play,
  Terminal,
  FileCode,
  Layers,
  Clock,
  DollarSign,
  Shield,
  ExternalLink,
  Search,
  Brain,
  Target,
  BarChart3,
  MessageSquare,
  Lock,
  Globe,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { DocSearch } from "@/components/docs/DocSearch";
import { InteractiveCodeEditor } from "@/components/docs/InteractiveCodeEditor";
import { SyntaxHighlighter } from "@/components/docs/SyntaxHighlighter";

const sidebarSections = [
  {
    title: "Getting Started",
    items: [
      { label: "Introduction", id: "intro", icon: Book },
      { label: "Quick Start", id: "quickstart", icon: Zap },
      { label: "Authentication", id: "auth", icon: Key },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { label: "Model Routing", id: "routing", icon: Layers },
      { label: "Accuracy Scoring", id: "accuracy", icon: Shield },
      { label: "Cost Tracking", id: "cost", icon: DollarSign },
      { label: "Inline Ask™", id: "inline-ask", icon: Code },
    ],
  },
  {
    title: "API Reference",
    items: [
      { label: "Chat Completions", id: "chat", icon: Terminal },
      { label: "Embeddings", id: "embeddings", icon: Database },
      { label: "Models", id: "models", icon: Layers },
      { label: "Sources & Citations", id: "sources", icon: ExternalLink },
    ],
  },
  {
    title: "SDKs",
    items: [
      { label: "Python", id: "sdk-python", icon: FileCode },
      { label: "JavaScript", id: "sdk-javascript", icon: FileCode },
      { label: "cURL", id: "sdk-curl", icon: Terminal },
      { label: ".NET", id: "sdk-dotnet", icon: FileCode },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Rate Limits", id: "limits", icon: Clock },
      { label: "Billing & Pricing", id: "billing", icon: DollarSign },
      { label: "Error Handling", id: "errors", icon: AlertTriangle },
      { label: "Best Practices", id: "best-practices", icon: Target },
      { label: "Changelog", id: "changelog", icon: Book },
    ],
  },
  {
    title: "Integrations",
    items: [
      { label: "Razorpay Webhooks", id: "razorpay-webhooks", icon: Zap },
    ],
  },
];

const codeExamples = {
  python: `from proxinex import Proxinex

client = Proxinex(api_key="pnx_your_api_key")

# Basic chat completion with smart routing
response = client.chat.completions.create(
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum entanglement"}
    ],
    routing="auto",           # Let Proxinex select the best model
    track_cost=True,          # Enable cost tracking
    require_sources=True      # Request citation sources
)

# Access the response
print(response.content)
print(f"Model used: {response.model}")
print(f"Accuracy score: {response.accuracy}%")
print(f"Cost: ₹{response.cost}")

# Access sources
for source in response.sources:
    print(f"  - {source.title}: {source.url}")`,
  javascript: `import Proxinex from '@proxinex/sdk';

const client = new Proxinex({
  apiKey: 'pnx_your_api_key'
});

// Basic chat completion with smart routing
const response = await client.chat.completions.create({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain quantum entanglement' }
  ],
  routing: 'auto',           // Let Proxinex select the best model
  trackCost: true,           // Enable cost tracking
  requireSources: true       // Request citation sources
});

// Access the response
console.log(response.content);
console.log(\`Model used: \${response.model}\`);
console.log(\`Accuracy score: \${response.accuracy}%\`);
console.log(\`Cost: ₹\${response.cost}\`);

// Access sources
response.sources.forEach(source => {
  console.log(\`  - \${source.title}: \${source.url}\`);
});`,
  curl: `curl -X POST https://api.proxinex.com/v1/chat/completions \\
  -H "Authorization: Bearer pnx_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain quantum entanglement"}
    ],
    "routing": "auto",
    "track_cost": true,
    "require_sources": true
  }'

# Response:
# {
#   "id": "pnx_abc123xyz",
#   "content": "Quantum entanglement is...",
#   "model": "claude-3.5-sonnet",
#   "accuracy": 96,
#   "cost": 0.018,
#   "sources": [...]
# }`,
  dotnet: `using Proxinex;

var client = new ProxinexClient("pnx_your_api_key");

// Basic chat completion with smart routing
var response = await client.Chat.Completions.CreateAsync(new ChatRequest
{
    Messages = new[]
    {
        new Message { Role = "system", Content = "You are a helpful assistant." },
        new Message { Role = "user", Content = "Explain quantum entanglement" }
    },
    Routing = "auto",           // Let Proxinex select the best model
    TrackCost = true,           // Enable cost tracking
    RequireSources = true       // Request citation sources
});

// Access the response
Console.WriteLine(response.Content);
Console.WriteLine($"Model used: {response.Model}");
Console.WriteLine($"Accuracy score: {response.Accuracy}%");
Console.WriteLine($"Cost: ₹{response.Cost}");

// Access sources
foreach (var source in response.Sources)
{
    Console.WriteLine($"  - {source.Title}: {source.Url}");
}`
};

const apiEndpoints = [
  {
    method: "POST",
    path: "/v1/chat/completions",
    description: "Create a chat completion with smart routing",
    badge: "Core"
  },
  {
    method: "POST",
    path: "/v1/embeddings",
    description: "Generate text embeddings",
    badge: "Embeddings"
  },
  {
    method: "GET",
    path: "/v1/models",
    description: "List available models",
    badge: "Models"
  },
  {
    method: "POST",
    path: "/v1/inline-ask",
    description: "Ask follow-up questions on specific text",
    badge: "Inline Ask™"
  },
  {
    method: "GET",
    path: "/v1/usage",
    description: "Get usage statistics and costs",
    badge: "Billing"
  },
  {
    method: "GET",
    path: "/v1/sources/search",
    description: "Search for relevant sources and citations",
    badge: "Sources"
  },
  {
    method: "POST",
    path: "/v1/verify",
    description: "Verify claims with source citations",
    badge: "Verification"
  }
];

const changelog = [
  {
    version: "0.4.0-beta",
    date: "January 2, 2026",
    changes: ["Public beta launch", "Full API access", "Python and JavaScript SDKs available", "Enhanced accuracy scoring algorithm"]
  },
  {
    version: "0.3.0-beta",
    date: "December 15, 2025",
    changes: ["Inline Ask™ API endpoint", "Improved accuracy scoring", "Cost estimation in requests", "Multi-source verification"]
  },
  {
    version: "0.2.0-beta",
    date: "November 10, 2025",
    changes: ["Multi-model routing", "Source citations", "Usage analytics dashboard", "Rate limiting improvements"]
  },
  {
    version: "0.1.0-alpha",
    date: "August 15, 2025",
    changes: ["Initial alpha release", "Basic chat completions", "Single model support"]
  }
];

const availableModels = [
  { name: "GPT-4o", provider: "OpenAI", speed: "Fast", cost: "₹0.05/1K tokens", specialty: "General, Code" },
  { name: "Claude 3.5 Sonnet", provider: "Anthropic", speed: "Fast", cost: "₹0.03/1K tokens", specialty: "Analysis, Writing" },
  { name: "Gemini 2.5 Pro", provider: "Google", speed: "Medium", cost: "₹0.04/1K tokens", specialty: "Research, Math" },
  { name: "Llama 3.1 70B", provider: "Meta", speed: "Fast", cost: "₹0.01/1K tokens", specialty: "General Purpose" },
  { name: "Mistral Large", provider: "Mistral", speed: "Very Fast", cost: "₹0.02/1K tokens", specialty: "Reasoning" },
  { name: "DeepSeek R1", provider: "DeepSeek", speed: "Medium", cost: "₹0.008/1K tokens", specialty: "Deep Reasoning" },
];

const errorCodes = [
  { code: "400", name: "Bad Request", description: "Invalid request parameters or malformed JSON" },
  { code: "401", name: "Unauthorized", description: "Missing or invalid API key" },
  { code: "403", name: "Forbidden", description: "API key doesn't have permission for this resource" },
  { code: "404", name: "Not Found", description: "Requested resource doesn't exist" },
  { code: "429", name: "Rate Limited", description: "Too many requests, please slow down" },
  { code: "500", name: "Internal Error", description: "Server error, please retry" },
  { code: "503", name: "Service Unavailable", description: "Service temporarily unavailable" },
];

const Docs = () => {
  const [activeTab, setActiveTab] = useState<"python" | "javascript" | "curl" | "dotnet">("python");
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");
  const [playgroundInput, setPlaygroundInput] = useState("What are the key benefits of renewable energy?");
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const copyCode = (code?: string) => {
    navigator.clipboard.writeText(code || codeExamples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runPlayground = async () => {
    setIsLoading(true);
    setPlaygroundResponse(null);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setPlaygroundResponse(`{
  "id": "pnx_demo_${Date.now()}",
  "content": "Renewable energy offers several significant benefits: 1) Environmental sustainability - reduces greenhouse gas emissions and pollution, 2) Energy independence - decreases reliance on imported fuels, 3) Cost stability - unlike fossil fuels, renewable sources have predictable costs, 4) Job creation - the renewable sector creates numerous employment opportunities, 5) Inexhaustible supply - sun, wind, and water are naturally replenished.",
  "model": "claude-3.5-sonnet",
  "accuracy": 94,
  "freshness": "2026-01-03T10:30:00Z",
  "cost": {
    "amount": 0.024,
    "currency": "INR"
  },
  "sources": [
    {
      "title": "International Energy Agency",
      "url": "https://www.iea.org/renewables",
      "relevance": 0.96
    },
    {
      "title": "UN Environment Programme",
      "url": "https://www.unep.org/energy",
      "relevance": 0.92
    }
  ],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 156,
    "total_tokens": 174
  }
}`);
    setIsLoading(false);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setSearchQuery("");
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter sidebar based on search
  const filteredSidebarSections = searchQuery.trim() 
    ? sidebarSections.map(section => ({
        ...section,
        items: section.items.filter(item => 
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.items.length > 0)
    : sidebarSections;

  return (
    <>
      <Helmet>
        <title>Documentation - Proxinex API Reference & SDKs</title>
        <meta 
          name="description" 
          content="Complete documentation for the Proxinex API. Learn how to integrate AI intelligence control into your applications with our Python, JavaScript, and .NET SDKs." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="pt-16 flex">
          {/* Sidebar */}
          <aside className="w-72 border-r border-border bg-card/50 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden lg:block">
            {/* Search */}
            <div className="p-4 border-b border-border">
              <DocSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onResultClick={scrollToSection}
                sidebarSections={sidebarSections}
              />
            </div>

            <nav className="p-4">
              {filteredSidebarSections.map((section) => (
                <div key={section.title} className="mb-6">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                    {section.title}
                  </h4>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                            activeSection === item.id
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                          {searchQuery && (
                            <Badge variant="outline" className="ml-auto text-[9px] px-1">
                              match
                            </Badge>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {searchQuery && filteredSidebarSections.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No results for "{searchQuery}"</p>
                </div>
              )}
            </nav>

            {/* Version Badge */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">v0.4.0-beta</Badge>
                <span>Beta Phase</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-4xl mx-auto px-6 py-12">
              {/* Intro */}
              <section id="intro" className="mb-16 scroll-mt-20">
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <Book className="h-4 w-4" />
                  <span>Getting Started</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground">Introduction</span>
                </div>

                <h1 className="text-4xl font-bold text-foreground mb-4">
                  Proxinex Documentation
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Welcome to the Proxinex API documentation. Learn how to integrate the AI Intelligence 
                  Control Plane into your applications with smart routing, accuracy scoring, and full cost transparency.
                </p>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <button onClick={() => scrollToSection('quickstart')} className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group text-left">
                    <Zap className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">Quick Start</h3>
                    <p className="text-sm text-muted-foreground">Get up and running in minutes</p>
                  </button>
                  <button onClick={() => scrollToSection('chat')} className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group text-left">
                    <Code className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">API Reference</h3>
                    <p className="text-sm text-muted-foreground">Complete endpoint documentation</p>
                  </button>
                  <button onClick={() => scrollToSection('sdk-python')} className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group text-left">
                    <Database className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">SDKs</h3>
                    <p className="text-sm text-muted-foreground">Python, JavaScript, .NET & more</p>
                  </button>
                </div>

                {/* Key Features Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Intelligent Routing</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Automatically routes queries to the best AI model based on task complexity, cost, and accuracy requirements.</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Accuracy Scoring</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Every response includes a confidence score based on source quality, cross-verification, and data freshness.</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Cost Transparency</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Real-time cost tracking with per-request breakdown. Never get surprised by your AI spend.</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold text-foreground">Source Citations</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Automatic source attribution with relevance scores. Build trustworthy AI applications.</p>
                  </div>
                </div>

                {/* Beta Notice */}
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 animate-pulse" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Beta Notice</h4>
                    <p className="text-sm text-muted-foreground">
                      Proxinex is currently in public beta. APIs may change before the stable release. 
                      Started development in August 2025.
                    </p>
                  </div>
                </div>
              </section>

              {/* Quick Start */}
              <section id="quickstart" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Quick Start</h2>
                <p className="text-muted-foreground mb-6">
                  Get started with Proxinex in three simple steps. You'll be making AI requests in under 5 minutes.
                </p>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">Get your API key</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sign up and get your API key from the dashboard. Your key starts with <code className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">pnx_</code> and should be kept secret.
                      </p>
                      <div className="p-4 rounded-lg border border-border bg-card mb-3">
                        <p className="text-sm text-muted-foreground mb-2">Your API key format:</p>
                        <code className="block px-3 py-2 bg-background border border-border rounded text-sm font-mono text-foreground">
                          pnx_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                        </code>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <Info className="h-4 w-4 text-primary flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          <strong>Security tip:</strong> Never expose your API key in client-side code. Use environment variables or a backend proxy.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">Install the SDK</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Choose your preferred language and install the Proxinex SDK:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs w-16 justify-center">Python</Badge>
                          <code className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm font-mono text-foreground">
                            pip install proxinex
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => copyCode('pip install proxinex')}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs w-16 justify-center">npm</Badge>
                          <code className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm font-mono text-foreground">
                            npm install @proxinex/sdk
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => copyCode('npm install @proxinex/sdk')}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs w-16 justify-center">.NET</Badge>
                          <code className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm font-mono text-foreground">
                            dotnet add package Proxinex
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => copyCode('dotnet add package Proxinex')}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">Make your first request</h3>
                      
                      {/* Code Tabs */}
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="flex border-b border-border bg-secondary/30">
                          {(["python", "javascript", "curl", "dotnet"] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                                activeTab === tab
                                  ? 'text-primary bg-card border-b-2 border-primary -mb-px'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {tab === "dotnet" ? ".NET" : tab}
                            </button>
                          ))}
                          <div className="ml-auto pr-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Est. cost: ₹0.02
                            </Badge>
                            <button
                              onClick={() => copyCode()}
                              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy code"
                            >
                              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="p-4 bg-card overflow-x-auto">
                          <SyntaxHighlighter code={codeExamples[activeTab]} language={activeTab} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Code Playground */}
                <div className="mt-10">
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    Try it Live
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Edit the code below and run it to see real API responses with syntax highlighting.
                  </p>
                  <InteractiveCodeEditor
                    initialCode={codeExamples.python}
                    language="python"
                    title="Live API Playground"
                    description="Edit this code and click 'Run Code' to execute it against the Proxinex API"
                  />
                </div>
              </section>

              {/* Authentication */}
              <section id="auth" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Authentication</h2>
                <p className="text-muted-foreground mb-6">
                  All API requests require authentication using your API key. Here's everything you need to know about securing your requests.
                </p>

                <div className="space-y-6">
                  {/* API Key Format */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      API Key Types
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="default" className="mt-0.5">Live</Badge>
                        <div>
                          <code className="text-sm font-mono text-foreground">pnx_live_...</code>
                          <p className="text-sm text-muted-foreground mt-1">Production keys for live applications. All requests are billed.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="secondary" className="mt-0.5">Test</Badge>
                        <div>
                          <code className="text-sm font-mono text-foreground">pnx_test_...</code>
                          <p className="text-sm text-muted-foreground mt-1">Test keys for development. Limited to 100 requests/day with mock responses.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Authentication Methods */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Authentication Methods
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Bearer Token (Recommended)</h4>
                        <code className="block px-3 py-2 bg-background border border-border rounded text-sm font-mono text-foreground">
                          Authorization: Bearer pnx_live_your_api_key
                        </code>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">X-API-Key Header</h4>
                        <code className="block px-3 py-2 bg-background border border-border rounded text-sm font-mono text-foreground">
                          X-API-Key: pnx_live_your_api_key
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Security Best Practices */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Security Best Practices
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        Store API keys in environment variables, never in code
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        Use backend proxies to prevent client-side key exposure
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        Rotate keys regularly and revoke unused keys
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        Set up usage alerts to detect unusual activity
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Model Routing */}
              <section id="routing" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Model Routing</h2>
                <p className="text-muted-foreground mb-6">
                  Proxinex's intelligent routing engine automatically selects the best AI model for each query based on multiple factors including task complexity, required accuracy, and cost optimization.
                </p>

                <div className="space-y-6">
                  {/* How It Works */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      How Intelligent Routing Works
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                          <span className="text-primary font-semibold">1</span>
                        </div>
                        <h4 className="text-sm font-medium text-foreground mb-1">Query Analysis</h4>
                        <p className="text-xs text-muted-foreground">Intent detection, complexity scoring, domain classification</p>
                      </div>
                      <div className="text-center p-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                          <span className="text-primary font-semibold">2</span>
                        </div>
                        <h4 className="text-sm font-medium text-foreground mb-1">Model Selection</h4>
                        <p className="text-xs text-muted-foreground">Match to optimal model based on specialty and performance</p>
                      </div>
                      <div className="text-center p-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                          <span className="text-primary font-semibold">3</span>
                        </div>
                        <h4 className="text-sm font-medium text-foreground mb-1">Response Delivery</h4>
                        <p className="text-xs text-muted-foreground">Execute with accuracy scoring and source verification</p>
                      </div>
                    </div>
                  </div>

                  {/* Routing Modes */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-4">Routing Modes</h3>
                    <div className="space-y-4">
                      <div className="p-3 rounded border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default">auto</Badge>
                          <span className="text-sm font-medium text-foreground">Automatic (Recommended)</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Let Proxinex select the optimal model based on query analysis.</p>
                        <code className="text-xs font-mono text-muted-foreground">"routing": "auto"</code>
                      </div>
                      <div className="p-3 rounded border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">cost</Badge>
                          <span className="text-sm font-medium text-foreground">Cost Optimized</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Prioritize cheaper models while maintaining quality thresholds.</p>
                        <code className="text-xs font-mono text-muted-foreground">"routing": "cost"</code>
                      </div>
                      <div className="p-3 rounded border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">quality</Badge>
                          <span className="text-sm font-medium text-foreground">Quality First</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Always use the highest-quality model regardless of cost.</p>
                        <code className="text-xs font-mono text-muted-foreground">"routing": "quality"</code>
                      </div>
                      <div className="p-3 rounded border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">speed</Badge>
                          <span className="text-sm font-medium text-foreground">Speed Priority</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Optimize for fastest response time.</p>
                        <code className="text-xs font-mono text-muted-foreground">"routing": "speed"</code>
                      </div>
                      <div className="p-3 rounded border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">manual</Badge>
                          <span className="text-sm font-medium text-foreground">Manual Selection</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Specify the exact model to use.</p>
                        <code className="text-xs font-mono text-muted-foreground">"model": "claude-3.5-sonnet"</code>
                      </div>
                    </div>
                  </div>

                  {/* Code Example */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="px-4 py-2 bg-secondary/30 border-b border-border text-sm font-medium text-foreground">
                      Routing Configuration Example
                    </div>
                    <div className="p-4 bg-card overflow-x-auto">
                      <pre className="text-sm font-mono text-foreground">{`response = client.chat.completions.create(
    messages=[{"role": "user", "content": "Complex research query..."}],
    routing="auto",
    routing_config={
        "min_accuracy": 90,      # Minimum accuracy threshold
        "max_cost": 0.10,        # Maximum cost per request (₹)
        "prefer_providers": ["anthropic", "openai"],
        "fallback_enabled": True
    }
)`}</pre>
                    </div>
                  </div>
                </div>
              </section>

              {/* Accuracy Scoring */}
              <section id="accuracy" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Accuracy Scoring</h2>
                <p className="text-muted-foreground mb-6">
                  Every Proxinex response includes a confidence score (0-100) that indicates the reliability of the answer based on multiple verification factors.
                </p>

                <div className="space-y-6">
                  {/* Scoring Factors */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Accuracy Score Components
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-emerald-500">40%</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Source Quality</h4>
                          <p className="text-sm text-muted-foreground">Authority and reliability of cited sources</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-500">25%</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Cross-Verification</h4>
                          <p className="text-sm text-muted-foreground">Consistency across multiple sources</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-amber-500">20%</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Data Freshness</h4>
                          <p className="text-sm text-muted-foreground">How recent the source information is</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-purple-500">15%</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Model Confidence</h4>
                          <p className="text-sm text-muted-foreground">AI model's internal certainty measure</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Interpretation */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-4">Score Interpretation</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 rounded bg-emerald-500/10">
                        <Badge className="bg-emerald-500">90-100</Badge>
                        <span className="text-sm text-foreground">High confidence - Multiple verified sources agree</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded bg-blue-500/10">
                        <Badge className="bg-blue-500">70-89</Badge>
                        <span className="text-sm text-foreground">Good confidence - Well-sourced with minor uncertainty</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded bg-amber-500/10">
                        <Badge className="bg-amber-500">50-69</Badge>
                        <span className="text-sm text-foreground">Moderate confidence - Consider verification</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded bg-red-500/10">
                        <Badge className="bg-red-500">&lt;50</Badge>
                        <span className="text-sm text-foreground">Low confidence - Additional research recommended</span>
                      </div>
                    </div>
                  </div>

                  {/* Response Example */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="px-4 py-2 bg-secondary/30 border-b border-border text-sm font-medium text-foreground">
                      Accuracy Score in Response
                    </div>
                    <div className="p-4 bg-card overflow-x-auto">
                      <pre className="text-sm font-mono text-foreground">{`{
  "content": "...",
  "accuracy": {
    "score": 94,
    "breakdown": {
      "source_quality": 38,      // out of 40
      "cross_verification": 23,  // out of 25
      "freshness": 18,           // out of 20
      "model_confidence": 15     // out of 15
    },
    "sources_count": 5,
    "freshness_date": "2026-01-02T15:30:00Z"
  }
}`}</pre>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cost Tracking */}
              <section id="cost" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Cost Tracking</h2>
                <p className="text-muted-foreground mb-6">
                  Proxinex provides complete cost transparency with real-time tracking at the request level. Never get surprised by your AI spend.
                </p>

                <div className="space-y-6">
                  {/* Cost Breakdown */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Cost Breakdown Structure
                    </h3>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="p-4 bg-background overflow-x-auto">
                        <pre className="text-sm font-mono text-foreground">{`{
  "cost": {
    "total": 0.024,
    "currency": "INR",
    "breakdown": {
      "input_tokens": 0.008,   // Tokens in your prompt
      "output_tokens": 0.014,  // Tokens in the response
      "routing": 0.001,        // Routing engine overhead
      "sources": 0.001         // Source verification
    },
    "model_used": "claude-3.5-sonnet",
    "tokens": {
      "input": 45,
      "output": 156,
      "total": 201
    }
  }
}`}</pre>
                      </div>
                    </div>
                  </div>

                  {/* Cost Controls */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-4">Cost Control Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded border border-border">
                        <h4 className="text-sm font-medium text-foreground mb-1">Budget Limits</h4>
                        <p className="text-xs text-muted-foreground">Set daily/monthly spending caps</p>
                        <code className="text-xs font-mono text-muted-foreground mt-2 block">"max_daily_spend": 100.00</code>
                      </div>
                      <div className="p-3 rounded border border-border">
                        <h4 className="text-sm font-medium text-foreground mb-1">Per-Request Limits</h4>
                        <p className="text-xs text-muted-foreground">Cap cost per individual request</p>
                        <code className="text-xs font-mono text-muted-foreground mt-2 block">"max_cost": 0.50</code>
                      </div>
                      <div className="p-3 rounded border border-border">
                        <h4 className="text-sm font-medium text-foreground mb-1">Alerts</h4>
                        <p className="text-xs text-muted-foreground">Get notified at spending thresholds</p>
                        <code className="text-xs font-mono text-muted-foreground mt-2 block">"alert_threshold": 80</code>
                      </div>
                      <div className="p-3 rounded border border-border">
                        <h4 className="text-sm font-medium text-foreground mb-1">Cost Estimation</h4>
                        <p className="text-xs text-muted-foreground">Preview cost before execution</p>
                        <code className="text-xs font-mono text-muted-foreground mt-2 block">"dry_run": true</code>
                      </div>
                    </div>
                  </div>

                  {/* Usage API */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="px-4 py-2 bg-secondary/30 border-b border-border text-sm font-medium text-foreground">
                      Get Usage Statistics
                    </div>
                    <div className="p-4 bg-card overflow-x-auto">
                      <pre className="text-sm font-mono text-foreground">{`# Get current month's usage
usage = client.usage.get(
    period="month",
    group_by="model"
)

# Response:
# {
#   "total_cost": 245.67,
#   "total_requests": 12456,
#   "by_model": {
#     "claude-3.5-sonnet": {"cost": 120.50, "requests": 5234},
#     "gpt-4o": {"cost": 89.30, "requests": 4567},
#     ...
#   }
# }`}</pre>
                    </div>
                  </div>
                </div>
              </section>

              {/* Inline Ask */}
              <section id="inline-ask" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Inline Ask™</h2>
                <p className="text-muted-foreground mb-6">
                  Inline Ask™ enables context-aware follow-up questions on any piece of text. Perfect for building interactive reading experiences, documentation assistants, and educational tools.
                </p>

                <div className="space-y-6">
                  {/* How It Works */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      How Inline Ask™ Works
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">1</div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">User Highlights Text</h4>
                          <p className="text-sm text-muted-foreground">Select any portion of text in your application</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">2</div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Ask a Question</h4>
                          <p className="text-sm text-muted-foreground">Type a follow-up question about the highlighted content</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">3</div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Get Contextual Answer</h4>
                          <p className="text-sm text-muted-foreground">Receive an answer that understands both the text and your question</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Usage */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="px-4 py-2 bg-secondary/30 border-b border-border text-sm font-medium text-foreground">
                      Inline Ask™ API Request
                    </div>
                    <div className="p-4 bg-card overflow-x-auto">
                      <pre className="text-sm font-mono text-foreground">{`response = client.inline_ask.create(
    highlighted_text="Quantum entanglement is a phenomenon where two particles become interconnected.",
    surrounding_context="Article about quantum physics...",
    question="How is this used in quantum computing?",
    require_sources=True
)

# Response:
# {
#   "answer": "Quantum entanglement is fundamental to quantum computing...",
#   "confidence": 92,
#   "sources": [...],
#   "related_questions": [
#     "What is quantum supremacy?",
#     "How do qubits differ from classical bits?"
#   ]
# }`}</pre>
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-4">Use Cases</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Documentation Portals</h4>
                          <p className="text-xs text-muted-foreground">Let users ask questions inline</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-foreground">E-Learning Platforms</h4>
                          <p className="text-xs text-muted-foreground">Interactive textbook experiences</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Legal Document Review</h4>
                          <p className="text-xs text-muted-foreground">Clarify complex clauses instantly</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Research Tools</h4>
                          <p className="text-xs text-muted-foreground">Deep-dive into papers and reports</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* API Playground */}
              <section id="playground" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">API Playground</h2>
                <p className="text-muted-foreground mb-6">
                  Test the Proxinex API directly from this page with live responses. Edit the code and run it to see real results.
                </p>

                <InteractiveCodeEditor
                  initialCode={`# Try the Proxinex API live!
from proxinex import Proxinex

client = Proxinex(api_key="pnx_demo_key")

# Ask any question
response = client.chat.completions.create(
    messages=[
        {"role": "user", "content": "What is machine learning?"}
    ],
    routing="auto",
    track_cost=True
)

print(response.content)
print(f"Accuracy: {response.accuracy}%")`}
                  language="python"
                  title="API Playground"
                  description="Click 'Run Code' to execute this request and see the live response"
                />
              </section>

              {/* Chat Completions API */}
              <section id="chat" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Chat Completions</h2>
                <p className="text-muted-foreground mb-6">
                  The core API endpoint for conversational AI with intelligent routing, accuracy scoring, and source citations.
                </p>

                <div className="space-y-6">
                  {/* Endpoint */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="default" className="font-mono">POST</Badge>
                      <code className="text-sm font-mono text-foreground">/v1/chat/completions</code>
                    </div>
                    
                    {/* Request Parameters */}
                    <h4 className="text-sm font-semibold text-foreground mb-3">Request Parameters</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 font-medium text-foreground">Parameter</th>
                            <th className="text-left py-2 font-medium text-foreground">Type</th>
                            <th className="text-left py-2 font-medium text-foreground">Required</th>
                            <th className="text-left py-2 font-medium text-foreground">Description</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b border-border">
                            <td className="py-2 font-mono">messages</td>
                            <td className="py-2">array</td>
                            <td className="py-2"><Badge variant="destructive" className="text-xs">Required</Badge></td>
                            <td className="py-2">Array of message objects with role and content</td>
                          </tr>
                          <tr className="border-b border-border">
                            <td className="py-2 font-mono">routing</td>
                            <td className="py-2">string</td>
                            <td className="py-2"><Badge variant="outline" className="text-xs">Optional</Badge></td>
                            <td className="py-2">auto, cost, quality, or speed</td>
                          </tr>
                          <tr className="border-b border-border">
                            <td className="py-2 font-mono">model</td>
                            <td className="py-2">string</td>
                            <td className="py-2"><Badge variant="outline" className="text-xs">Optional</Badge></td>
                            <td className="py-2">Specific model to use (overrides routing)</td>
                          </tr>
                          <tr className="border-b border-border">
                            <td className="py-2 font-mono">require_sources</td>
                            <td className="py-2">boolean</td>
                            <td className="py-2"><Badge variant="outline" className="text-xs">Optional</Badge></td>
                            <td className="py-2">Include source citations in response</td>
                          </tr>
                          <tr className="border-b border-border">
                            <td className="py-2 font-mono">track_cost</td>
                            <td className="py-2">boolean</td>
                            <td className="py-2"><Badge variant="outline" className="text-xs">Optional</Badge></td>
                            <td className="py-2">Include cost breakdown in response</td>
                          </tr>
                          <tr className="border-b border-border">
                            <td className="py-2 font-mono">stream</td>
                            <td className="py-2">boolean</td>
                            <td className="py-2"><Badge variant="outline" className="text-xs">Optional</Badge></td>
                            <td className="py-2">Enable streaming responses</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-mono">max_tokens</td>
                            <td className="py-2">integer</td>
                            <td className="py-2"><Badge variant="outline" className="text-xs">Optional</Badge></td>
                            <td className="py-2">Maximum tokens in response</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* All API Endpoints */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">All Endpoints</h3>
                    {apiEndpoints.map((endpoint) => (
                      <div 
                        key={endpoint.path}
                        className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={endpoint.method === "POST" ? "default" : "secondary"} className="font-mono text-xs">
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                          <Badge variant="outline" className="text-xs ml-auto">{endpoint.badge}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Embeddings */}
              <section id="embeddings" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Embeddings</h2>
                <p className="text-muted-foreground mb-6">
                  Generate high-quality text embeddings for semantic search, clustering, and recommendation systems.
                </p>

                <div className="space-y-6">
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="px-4 py-2 bg-secondary/30 border-b border-border text-sm font-medium text-foreground">
                      Generate Embeddings
                    </div>
                    <div className="p-4 bg-card overflow-x-auto">
                      <pre className="text-sm font-mono text-foreground">{`# Generate embeddings for text
embeddings = client.embeddings.create(
    input=["How does photosynthesis work?"],
    model="text-embedding-3-large",
    dimensions=1536
)

# Response:
# {
#   "data": [
#     {
#       "embedding": [0.0023, -0.0156, 0.0834, ...],
#       "index": 0
#     }
#   ],
#   "model": "text-embedding-3-large",
#   "usage": {"total_tokens": 8}
# }`}</pre>
                    </div>
                  </div>

                  {/* Embedding Models */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-4">Available Embedding Models</h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <code className="text-sm font-mono text-foreground">text-embedding-3-large</code>
                          <Badge variant="default" className="text-xs">Recommended</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">3072 dimensions, highest accuracy</p>
                      </div>
                      <div className="p-3 rounded border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <code className="text-sm font-mono text-foreground">text-embedding-3-small</code>
                          <Badge variant="secondary" className="text-xs">Cost-efficient</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">1536 dimensions, good balance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Models */}
              <section id="models" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Available Models</h2>
                <p className="text-muted-foreground mb-6">
                  Proxinex provides access to all major AI models through a single API. The intelligent routing system selects the optimal model for each query.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                    <thead className="bg-secondary/30">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-foreground">Model</th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">Provider</th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">Speed</th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">Cost</th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableModels.map((model, i) => (
                        <tr key={model.name} className={i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'}>
                          <td className="py-3 px-4 font-mono text-foreground">{model.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{model.provider}</td>
                          <td className="py-3 px-4">
                            <Badge variant={model.speed === 'Very Fast' ? 'default' : 'secondary'} className="text-xs">
                              {model.speed}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{model.cost}</td>
                          <td className="py-3 px-4 text-muted-foreground">{model.specialty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Sources & Citations */}
              <section id="sources" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Sources & Citations</h2>
                <p className="text-muted-foreground mb-6">
                  Proxinex automatically provides source citations for factual claims, ensuring transparency and verifiability.
                </p>

                <div className="space-y-6">
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="px-4 py-2 bg-secondary/30 border-b border-border text-sm font-medium text-foreground">
                      Sources Response Structure
                    </div>
                    <div className="p-4 bg-card overflow-x-auto">
                      <pre className="text-sm font-mono text-foreground">{`{
  "sources": [
    {
      "id": "src_1",
      "title": "World Health Organization - Climate Change",
      "url": "https://www.who.int/climate-change",
      "relevance": 0.96,
      "domain_authority": 98,
      "published_date": "2025-11-15",
      "excerpt": "Climate change is one of the biggest health threats..."
    },
    {
      "id": "src_2",
      "title": "Nature Climate Change Journal",
      "url": "https://nature.com/nclimate/...",
      "relevance": 0.91,
      "domain_authority": 95,
      "published_date": "2025-12-01",
      "excerpt": "Recent studies show accelerating warming..."
    }
  ],
  "citation_map": {
    "[1]": "src_1",
    "[2]": "src_2"
  }
}`}</pre>
                    </div>
                  </div>

                  {/* Verification API */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Claim Verification
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use the verification endpoint to fact-check specific claims against reliable sources.
                    </p>
                    <div className="rounded border border-border overflow-hidden">
                      <div className="p-3 bg-background overflow-x-auto">
                        <pre className="text-sm font-mono text-foreground">{`result = client.verify.claim(
    claim="The Amazon rainforest produces 20% of Earth's oxygen",
    require_sources=True
)

# Returns verification status, corrected facts if needed, and sources`}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SDK Sections */}
              <section id="sdk-python" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Python SDK</h2>
                <p className="text-muted-foreground mb-6">
                  The official Python SDK provides a simple and intuitive interface for the Proxinex API.
                </p>

                <div className="space-y-6">
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-3">Installation</h3>
                    <div className="rounded border border-border overflow-hidden">
                      <SyntaxHighlighter code="pip install proxinex" language="python" />
                    </div>
                  </div>

                  <InteractiveCodeEditor
                    initialCode={codeExamples.python}
                    language="python"
                    title="Python Example"
                    description="Edit and run this Python code to test the API"
                  />

                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-3">Async Support</h3>
                    <div className="rounded border border-border overflow-hidden">
                      <SyntaxHighlighter 
                        code={`import asyncio
from proxinex import AsyncProxinex

async def main():
    client = AsyncProxinex(api_key="pnx_your_api_key")
    response = await client.chat.completions.create(
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.content)

asyncio.run(main())`}
                        language="python"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section id="sdk-javascript" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">JavaScript SDK</h2>
                <p className="text-muted-foreground mb-6">
                  Full TypeScript support with modern async/await patterns.
                </p>

                <div className="space-y-6">
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-3">Installation</h3>
                    <div className="rounded border border-border overflow-hidden">
                      <SyntaxHighlighter code="npm install @proxinex/sdk" language="javascript" />
                    </div>
                  </div>

                  <InteractiveCodeEditor
                    initialCode={codeExamples.javascript}
                    language="javascript"
                    title="JavaScript Example"
                    description="Edit and run this JavaScript code to test the API"
                  />
                </div>
              </section>

              <section id="sdk-curl" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">cURL Examples</h2>
                <p className="text-muted-foreground mb-6">
                  Direct HTTP requests for any language or platform.
                </p>

                <InteractiveCodeEditor
                  initialCode={codeExamples.curl}
                  language="curl"
                  title="cURL Example"
                  description="Copy this cURL command to test in your terminal"
                />
              </section>

              <section id="sdk-dotnet" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">.NET SDK</h2>
                <p className="text-muted-foreground mb-6">
                  Native C# SDK with full async support.
                </p>

                <div className="space-y-6">
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-3">Installation</h3>
                    <div className="rounded border border-border overflow-hidden">
                      <SyntaxHighlighter code="dotnet add package Proxinex" language="dotnet" />
                    </div>
                  </div>

                  <InteractiveCodeEditor
                    initialCode={codeExamples.dotnet}
                    language="dotnet"
                    title=".NET Example"
                    description="Edit and run this C# code to test the API"
                  />
                </div>
              </section>

              {/* Rate Limits */}
              <section id="limits" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Rate Limits</h2>
                <p className="text-muted-foreground mb-6">
                  Rate limits ensure fair usage and API stability. Limits vary by plan.
                </p>

                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                      <thead className="bg-secondary/30">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-foreground">Plan</th>
                          <th className="text-left py-3 px-4 font-medium text-foreground">Requests/min</th>
                          <th className="text-left py-3 px-4 font-medium text-foreground">Tokens/min</th>
                          <th className="text-left py-3 px-4 font-medium text-foreground">Requests/day</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-card">
                          <td className="py-3 px-4 text-foreground">Free</td>
                          <td className="py-3 px-4 text-muted-foreground">20</td>
                          <td className="py-3 px-4 text-muted-foreground">10,000</td>
                          <td className="py-3 px-4 text-muted-foreground">500</td>
                        </tr>
                        <tr className="bg-secondary/10">
                          <td className="py-3 px-4 text-foreground">Pro</td>
                          <td className="py-3 px-4 text-muted-foreground">100</td>
                          <td className="py-3 px-4 text-muted-foreground">100,000</td>
                          <td className="py-3 px-4 text-muted-foreground">10,000</td>
                        </tr>
                        <tr className="bg-card">
                          <td className="py-3 px-4 text-foreground">Business</td>
                          <td className="py-3 px-4 text-muted-foreground">500</td>
                          <td className="py-3 px-4 text-muted-foreground">500,000</td>
                          <td className="py-3 px-4 text-muted-foreground">50,000</td>
                        </tr>
                        <tr className="bg-secondary/10">
                          <td className="py-3 px-4 text-foreground">Enterprise</td>
                          <td className="py-3 px-4 text-muted-foreground">Custom</td>
                          <td className="py-3 px-4 text-muted-foreground">Custom</td>
                          <td className="py-3 px-4 text-muted-foreground">Unlimited</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-3">Rate Limit Headers</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-border">
                        <code className="font-mono text-foreground">X-RateLimit-Limit</code>
                        <span className="text-muted-foreground">Maximum requests per minute</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <code className="font-mono text-foreground">X-RateLimit-Remaining</code>
                        <span className="text-muted-foreground">Requests remaining</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <code className="font-mono text-foreground">X-RateLimit-Reset</code>
                        <span className="text-muted-foreground">Unix timestamp when limit resets</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Billing & Pricing */}
              <section id="billing" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Billing & Pricing</h2>
                <p className="text-muted-foreground mb-6">
                  Transparent, pay-as-you-go pricing with no hidden fees. Only pay for what you use.
                </p>

                <div className="space-y-6">
                  {/* Pricing Tiers */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <h3 className="font-semibold text-foreground mb-2">Free Tier</h3>
                      <p className="text-2xl font-bold text-foreground mb-2">₹0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> 500 requests/day</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> 10,000 tokens/min</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Basic models</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg border-2 border-primary bg-card relative">
                      <Badge className="absolute -top-2 right-4">Popular</Badge>
                      <h3 className="font-semibold text-foreground mb-2">Pro</h3>
                      <p className="text-2xl font-bold text-foreground mb-2">₹999<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> 10,000 requests/day</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> 100,000 tokens/min</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> All models</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Priority support</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <h3 className="font-semibold text-foreground mb-2">Enterprise</h3>
                      <p className="text-2xl font-bold text-foreground mb-2">Custom</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Unlimited requests</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Custom rate limits</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Dedicated support</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> SLA guarantee</li>
                      </ul>
                    </div>
                  </div>

                  {/* Usage Tracking */}
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Track Your Usage
                    </h3>
                    <div className="rounded border border-border overflow-hidden">
                      <SyntaxHighlighter 
                        code={`# Get current billing period usage
usage = client.billing.usage()

# Response:
# {
#   "current_period": {"start": "2026-01-01", "end": "2026-01-31"},
#   "total_cost": 45.67,
#   "total_requests": 2345,
#   "total_tokens": 456789,
#   "remaining_free_tier": 0
# }`}
                        language="python"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Error Handling */}
              <section id="errors" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Error Handling</h2>
                <p className="text-muted-foreground mb-6">
                  Proxinex uses standard HTTP status codes and returns detailed error messages.
                </p>

                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                      <thead className="bg-secondary/30">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-foreground">Code</th>
                          <th className="text-left py-3 px-4 font-medium text-foreground">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-foreground">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errorCodes.map((error, i) => (
                          <tr key={error.code} className={i % 2 === 0 ? 'bg-card' : 'bg-secondary/10'}>
                            <td className="py-3 px-4">
                              <Badge variant={parseInt(error.code) >= 500 ? "destructive" : "secondary"} className="font-mono">
                                {error.code}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-medium text-foreground">{error.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{error.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Error Response Example */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="px-4 py-2 bg-secondary/30 border-b border-border text-sm font-medium text-foreground">
                      Error Response Format
                    </div>
                    <div className="p-4 bg-card overflow-x-auto">
                      <pre className="text-sm font-mono text-foreground">{`{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "You have exceeded the rate limit of 100 requests per minute.",
    "type": "rate_limit_error",
    "retry_after": 45
  }
}`}</pre>
                    </div>
                  </div>
                </div>
              </section>

              {/* Best Practices */}
              <section id="best-practices" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Best Practices</h2>
                <p className="text-muted-foreground mb-6">
                  Follow these guidelines to get the most out of the Proxinex API.
                </p>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Use Streaming for Long Responses</h4>
                        <p className="text-sm text-muted-foreground">Enable streaming for better UX on long-form content. Users see responses incrementally.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Implement Exponential Backoff</h4>
                        <p className="text-sm text-muted-foreground">When you hit rate limits, use exponential backoff instead of immediate retries.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Set Reasonable max_tokens</h4>
                        <p className="text-sm text-muted-foreground">Limit output tokens to control costs and response times. Use lower values for quick queries.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Cache Frequent Queries</h4>
                        <p className="text-sm text-muted-foreground">Cache responses for common queries to reduce API calls and improve latency.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Monitor Accuracy Scores</h4>
                        <p className="text-sm text-muted-foreground">Track accuracy scores over time. Low scores may indicate need for prompt refinement.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Changelog */}
              <section id="changelog" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Changelog</h2>
                <p className="text-muted-foreground mb-6">
                  Track the evolution of Proxinex API.
                </p>

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  
                  {changelog.map((release) => (
                    <div key={release.version} className="relative pl-10 pb-8 last:pb-0">
                      <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">{release.version}</Badge>
                        <span className="text-sm text-muted-foreground">{release.date}</span>
                      </div>
                      <ul className="space-y-1">
                        {release.changes.map((change, i) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* Razorpay Webhooks */}
              <section id="razorpay-webhooks" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Razorpay Webhook Configuration</h2>
                <p className="text-muted-foreground mb-6">
                  Set up Razorpay webhooks to receive real-time payment and subscription events.
                </p>

                {/* Setup Steps */}
                <div className="space-y-6">
                  <div className="p-6 rounded-lg border border-border bg-card">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                      Get Your Webhook URL
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your webhook endpoint is automatically configured. Copy the URL below:
                    </p>
                    <div className="p-3 rounded-md bg-secondary font-mono text-sm break-all">
                      https://jfmrvhrpwyxxjpcblavp.supabase.co/functions/v1/razorpay-webhook
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border border-border bg-card">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                      Configure in Razorpay Dashboard
                    </h3>
                    <ol className="space-y-3 text-sm text-foreground">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">a</span>
                        <span>Log in to your <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Razorpay Dashboard</a></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">b</span>
                        <span>Navigate to <strong>Settings → Webhooks</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">c</span>
                        <span>Click <strong>"+ Add New Webhook"</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">d</span>
                        <span>Paste your webhook URL from Step 1</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">e</span>
                        <span>Enter a <strong>Secret</strong> (this should match your <code className="px-1 py-0.5 rounded bg-secondary text-xs">RAZORPAY_KEY_SECRET</code> environment variable)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">f</span>
                        <span>Click <strong>"Create Webhook"</strong></span>
                      </li>
                    </ol>
                  </div>

                  <div className="p-6 rounded-lg border border-border bg-card">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                      Select Webhook Events
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enable the following events for full subscription management:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        { event: "payment.captured", desc: "When a payment is successfully captured" },
                        { event: "payment.failed", desc: "When a payment attempt fails" },
                        { event: "subscription.activated", desc: "When a subscription becomes active" },
                        { event: "subscription.charged", desc: "When a subscription renewal is charged" },
                        { event: "subscription.pending", desc: "When a subscription payment is pending" },
                        { event: "subscription.halted", desc: "When a subscription is halted due to failures" },
                        { event: "subscription.cancelled", desc: "When a subscription is cancelled" },
                      ].map((item) => (
                        <div key={item.event} className="p-3 rounded-md bg-secondary">
                          <code className="text-xs font-medium text-primary">{item.event}</code>
                          <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border border-border bg-card">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                      Verify Webhook Setup
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      After saving, Razorpay will show your webhook as "Active". You can test it by:
                    </p>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Making a test payment in Razorpay's test mode</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Checking your backend logs for incoming webhook events</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Verifying subscription status updates in your database</span>
                      </li>
                    </ul>
                  </div>

                  {/* Important Notes */}
                  <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Important Notes</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Webhook signature verification is enabled by default for security</li>
                          <li>• Ensure your <code className="px-1 py-0.5 rounded bg-secondary text-xs">RAZORPAY_KEY_SECRET</code> is correctly set in your environment</li>
                          <li>• Webhooks are processed idempotently to handle retries safely</li>
                          <li>• Failed webhook deliveries will be retried by Razorpay automatically</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>

          {/* Right Sidebar - On This Page */}
          <aside className="w-56 border-l border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden xl:block">
            <nav className="p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                On this page
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => scrollToSection('intro')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Introduction
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('quickstart')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Quick Start
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('auth')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Authentication
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('routing')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Model Routing
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('accuracy')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Accuracy Scoring
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('cost')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Cost Tracking
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('inline-ask')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Inline Ask™
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('chat')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    API Reference
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('billing')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Billing
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('changelog')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Changelog
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('razorpay-webhooks')} className="text-muted-foreground hover:text-foreground transition-colors text-left">
                    Razorpay Webhooks
                  </button>
                </li>
              </ul>

              {/* Quick Links */}
              <div className="mt-8 pt-8 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Quick Links
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/sandbox" className="text-primary hover:underline flex items-center gap-1">
                      Try Sandbox <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="/app/api-keys" className="text-primary hover:underline flex items-center gap-1">
                      Get API Key <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </aside>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Docs;
