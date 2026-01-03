import { useState } from "react";
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
  ChevronDown,
  Search
} from "lucide-react";
import { Helmet } from "react-helmet-async";

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
      { label: "Sources", id: "sources", icon: ExternalLink },
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
      { label: "Billing", id: "billing", icon: DollarSign },
      { label: "Changelog", id: "changelog", icon: Book },
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
  }
];

const changelog = [
  {
    version: "0.4.0-beta",
    date: "January 2, 2026",
    changes: ["Public beta launch", "Full API access", "Python and JavaScript SDKs available"]
  },
  {
    version: "0.3.0-beta",
    date: "December 15, 2025",
    changes: ["Inline Ask™ API endpoint", "Improved accuracy scoring", "Cost estimation in requests"]
  },
  {
    version: "0.2.0-beta",
    date: "November 10, 2025",
    changes: ["Multi-model routing", "Source citations", "Usage analytics dashboard"]
  },
  {
    version: "0.1.0-alpha",
    date: "August 15, 2025",
    changes: ["Initial alpha release", "Basic chat completions", "Single model support"]
  }
];

const Docs = () => {
  const [activeTab, setActiveTab] = useState<"python" | "javascript" | "curl" | "dotnet">("python");
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");
  const [playgroundInput, setPlaygroundInput] = useState("What are the key benefits of renewable energy?");
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runPlayground = async () => {
    setIsLoading(true);
    setPlaygroundResponse(null);
    
    // Simulate API call
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search docs..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono bg-secondary rounded text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>

            <nav className="p-4">
              {sidebarSections.map((section) => (
                <div key={section.title} className="mb-6">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                    {section.title}
                  </h4>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={() => setActiveSection(item.id)}
                          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                            activeSection === item.id
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                  <a href="#quickstart" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group">
                    <Zap className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">Quick Start</h3>
                    <p className="text-sm text-muted-foreground">Get up and running in minutes</p>
                  </a>
                  <a href="#chat" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group">
                    <Code className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">API Reference</h3>
                    <p className="text-sm text-muted-foreground">Complete endpoint documentation</p>
                  </a>
                  <a href="#sdk-python" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group">
                    <Database className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">SDKs</h3>
                    <p className="text-sm text-muted-foreground">Python, JavaScript, .NET & more</p>
                  </a>
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
                  Get started with Proxinex in three simple steps.
                </p>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Get your API key</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sign up and get your API key from the dashboard. Your key starts with <code className="px-1.5 py-0.5 bg-secondary rounded text-xs">pnx_</code>.
                      </p>
                      <Button variant="outline" size="sm" className="border-border">
                        <Key className="h-4 w-4 mr-2" />
                        Get API Key
                      </Button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Install the SDK</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Python</Badge>
                          <code className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm font-mono text-foreground">
                            pip install proxinex
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">npm</Badge>
                          <code className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm font-mono text-foreground">
                            npm install @proxinex/sdk
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">.NET</Badge>
                          <code className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm font-mono text-foreground">
                            dotnet add package Proxinex
                          </code>
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
                              Estimated cost: ₹0.02
                            </Badge>
                            <button
                              onClick={copyCode}
                              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy code"
                            >
                              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="p-4 bg-card overflow-x-auto">
                          <pre className="text-sm font-mono text-foreground">
                            <code>{codeExamples[activeTab]}</code>
                          </pre>
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
                  Test the Proxinex API directly from this page.
                </p>

                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="p-4 bg-secondary/30 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">Live API Playground</span>
                    </div>
                    <Badge variant="secondary">Demo Mode</Badge>
                  </div>
                  <div className="p-4 bg-card">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-foreground mb-2">Your Prompt</label>
                      <textarea
                        value={playgroundInput}
                        onChange={(e) => setPlaygroundInput(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        rows={3}
                        placeholder="Enter your question..."
                      />
                    </div>
                    <Button onClick={runPlayground} disabled={isLoading} className="mb-4">
                      <Play className="h-4 w-4 mr-2" />
                      {isLoading ? "Running..." : "Run Request"}
                    </Button>
                    
                    {playgroundResponse && (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="px-4 py-2 bg-secondary/30 border-b border-border text-sm font-medium text-muted-foreground">
                          Response
                        </div>
                        <pre className="p-4 bg-background text-sm font-mono text-foreground overflow-x-auto">
                          {playgroundResponse}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* API Endpoints */}
              <section id="chat" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">API Endpoints</h2>
                <p className="text-muted-foreground mb-6">
                  Complete list of available API endpoints.
                </p>

                <div className="space-y-3">
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
              </section>

              {/* Changelog */}
              <section id="changelog" className="mb-16 scroll-mt-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">Changelog</h2>
                <p className="text-muted-foreground mb-6">
                  Track the evolution of Proxinex API.
                </p>

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  
                  {changelog.map((release, index) => (
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
                  <a href="#intro" className="text-muted-foreground hover:text-foreground transition-colors">
                    Introduction
                  </a>
                </li>
                <li>
                  <a href="#quickstart" className="text-muted-foreground hover:text-foreground transition-colors">
                    Quick Start
                  </a>
                </li>
                <li>
                  <a href="#playground" className="text-muted-foreground hover:text-foreground transition-colors">
                    API Playground
                  </a>
                </li>
                <li>
                  <a href="#chat" className="text-muted-foreground hover:text-foreground transition-colors">
                    API Endpoints
                  </a>
                </li>
                <li>
                  <a href="#changelog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Changelog
                  </a>
                </li>
              </ul>

              {/* Example Response */}
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
