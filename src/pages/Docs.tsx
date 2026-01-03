import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Book, 
  Code, 
  Database, 
  Key, 
  Zap, 
  Settings,
  ChevronRight,
  Copy,
  Check
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const sidebarSections = [
  {
    title: "Getting Started",
    items: [
      { label: "Introduction", href: "#intro", active: true },
      { label: "Quick Start", href: "#quickstart" },
      { label: "Authentication", href: "#auth" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { label: "Model Routing", href: "#routing" },
      { label: "Accuracy Scoring", href: "#accuracy" },
      { label: "Cost Tracking", href: "#cost" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { label: "Chat Completions", href: "#chat" },
      { label: "Embeddings", href: "#embeddings" },
      { label: "Models", href: "#models" },
    ],
  },
  {
    title: "SDKs",
    items: [
      { label: "Python", href: "#python" },
      { label: "JavaScript", href: "#javascript" },
      { label: "REST API", href: "#rest" },
    ],
  },
];

const codeExamples = {
  python: `from proxinex import Proxinex

client = Proxinex(api_key="your-api-key")

response = client.chat.completions.create(
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ],
    routing="auto",  # Let Proxinex choose the best model
    track_cost=True
)

print(response.content)
print(f"Accuracy: {response.accuracy}%")
print(f"Cost: {response.cost}")`,
  javascript: `import Proxinex from 'proxinex';

const client = new Proxinex({ apiKey: 'your-api-key' });

const response = await client.chat.completions.create({
  messages: [
    { role: 'user', content: 'Explain quantum computing' }
  ],
  routing: 'auto', // Let Proxinex choose the best model
  trackCost: true
});

console.log(response.content);
console.log(\`Accuracy: \${response.accuracy}%\`);
console.log(\`Cost: \${response.cost}\`);`,
  curl: `curl https://api.proxinex.com/v1/chat/completions \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ],
    "routing": "auto",
    "track_cost": true
  }'`,
};

const Docs = () => {
  const [activeTab, setActiveTab] = useState<"python" | "javascript" | "curl">("python");
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Documentation - Proxinex API Reference & SDKs</title>
        <meta 
          name="description" 
          content="Complete documentation for the Proxinex API. Learn how to integrate AI intelligence control into your applications with our Python and JavaScript SDKs." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="pt-16 flex">
          {/* Sidebar */}
          <aside className="w-64 border-r border-border bg-card/50 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden lg:block">
            <nav className="p-4">
              {sidebarSections.map((section) => (
                <div key={section.title} className="mb-6">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {section.title}
                  </h4>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            item.active
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-4xl mx-auto px-6 py-12">
              {/* Intro */}
              <section id="intro" className="mb-16">
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
                  Learn how to integrate the Proxinex AI Intelligence Control Plane into your applications. 
                  Route queries to optimal models, track accuracy, and control costs.
                </p>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                  <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                    <Zap className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">Quick Start</h3>
                    <p className="text-sm text-muted-foreground">Get up and running in minutes</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                    <Code className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">API Reference</h3>
                    <p className="text-sm text-muted-foreground">Complete endpoint documentation</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                    <Database className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">SDKs</h3>
                    <p className="text-sm text-muted-foreground">Python, JavaScript, and more</p>
                  </div>
                </div>
              </section>

              {/* Quick Start */}
              <section id="quickstart" className="mb-16">
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
                        Sign up and get your API key from the dashboard.
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
                      <div className="bg-card border border-border rounded-lg p-3 font-mono text-sm text-foreground">
                        pip install proxinex
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
                          {(["python", "javascript", "curl"] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                                activeTab === tab
                                  ? 'text-primary bg-card'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                          <div className="ml-auto pr-2 flex items-center">
                            <button
                              onClick={copyCode}
                              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="p-4 bg-card">
                          <pre className="text-sm font-mono text-foreground overflow-x-auto">
                            <code>{codeExamples[activeTab]}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Response Example */}
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-foreground mb-4">Response Format</h2>
                <p className="text-muted-foreground mb-6">
                  Every response includes accuracy scoring, cost tracking, and source citations.
                </p>

                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="px-4 py-2 border-b border-border bg-secondary/30 text-sm font-medium text-muted-foreground">
                    Response
                  </div>
                  <div className="p-4 bg-card">
                    <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`{
  "id": "pnx_abc123",
  "content": "Quantum computing leverages...",
  "model": "claude-3.5-sonnet",
  "accuracy": 96,
  "freshness": "2024-01-15T10:30:00Z",
  "cost": {
    "amount": 0.018,
    "currency": "INR"
  },
  "sources": [
    {
      "title": "IBM Quantum Computing",
      "url": "https://ibm.com/quantum",
      "relevance": 0.95
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 245,
    "total_tokens": 257
  }
}`}
                    </pre>
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
                  <a href="#response" className="text-muted-foreground hover:text-foreground transition-colors">
                    Response Format
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Docs;
