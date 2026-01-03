import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  FileText, 
  Code, 
  Hash,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  section: string;
  preview: string;
  type: "section" | "code" | "api";
  icon: React.ComponentType<{ className?: string }>;
}

interface DocSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResultClick: (id: string) => void;
  sidebarSections: Array<{
    title: string;
    items: Array<{ label: string; id: string; icon: React.ComponentType<{ className?: string }> }>;
  }>;
}

// Search index with content previews
const searchIndex: Record<string, { preview: string; keywords: string[] }> = {
  intro: { 
    preview: "Welcome to the Proxinex API documentation. Learn how to integrate AI Intelligence Control Plane...",
    keywords: ["introduction", "getting started", "welcome", "overview", "proxinex"]
  },
  quickstart: {
    preview: "Get started with Proxinex in three simple steps. Get your API key, install the SDK, make your first request...",
    keywords: ["quick start", "setup", "install", "pip", "npm", "first request", "api key"]
  },
  auth: {
    preview: "All API requests require authentication using your API key. Bearer token, X-API-Key header...",
    keywords: ["authentication", "api key", "bearer", "token", "security", "authorization"]
  },
  routing: {
    preview: "Proxinex's intelligent routing engine automatically selects the best AI model for each query...",
    keywords: ["routing", "model selection", "auto", "cost", "quality", "intelligent"]
  },
  accuracy: {
    preview: "Every response includes a confidence score based on source quality, cross-verification, and data freshness...",
    keywords: ["accuracy", "scoring", "confidence", "verification", "sources", "quality"]
  },
  cost: {
    preview: "Real-time cost tracking with per-request breakdown. Never get surprised by your AI spend...",
    keywords: ["cost", "billing", "pricing", "tracking", "budget", "spending"]
  },
  "inline-ask": {
    preview: "Ask follow-up questions on specific text. Highlight text and get contextual answers...",
    keywords: ["inline ask", "follow-up", "highlight", "contextual", "questions"]
  },
  chat: {
    preview: "Create a chat completion with smart routing. POST /v1/chat/completions...",
    keywords: ["chat", "completions", "api", "endpoint", "messages", "response"]
  },
  embeddings: {
    preview: "Generate text embeddings for semantic search and similarity matching...",
    keywords: ["embeddings", "vectors", "semantic", "search", "similarity"]
  },
  models: {
    preview: "List available models including GPT-4o, Claude 3.5 Sonnet, Gemini 2.5 Pro, Llama 3.1...",
    keywords: ["models", "gpt", "claude", "gemini", "llama", "mistral", "deepseek"]
  },
  sources: {
    preview: "Automatic source attribution with relevance scores. Search for relevant sources and citations...",
    keywords: ["sources", "citations", "references", "links", "verification"]
  },
  "sdk-python": {
    preview: "Install the Python SDK with pip install proxinex. Full type hints and async support...",
    keywords: ["python", "sdk", "pip", "install", "library", "package"]
  },
  "sdk-javascript": {
    preview: "Install the JavaScript SDK with npm install @proxinex/sdk. TypeScript support included...",
    keywords: ["javascript", "typescript", "sdk", "npm", "node", "browser"]
  },
  "sdk-curl": {
    preview: "Make direct HTTP requests with cURL. Perfect for testing and shell scripts...",
    keywords: ["curl", "http", "rest", "api", "terminal", "command line"]
  },
  "sdk-dotnet": {
    preview: "Install the .NET SDK with dotnet add package Proxinex. Full async/await support...",
    keywords: ["dotnet", ".net", "csharp", "c#", "nuget", "package"]
  },
  limits: {
    preview: "Rate limits vary by plan. Free tier: 60 requests/minute, Pro: 300 requests/minute...",
    keywords: ["rate limits", "throttling", "requests", "quota", "limits"]
  },
  billing: {
    preview: "Usage-based pricing with no minimum commitment. Pay only for what you use...",
    keywords: ["billing", "pricing", "plans", "subscription", "payment"]
  },
  errors: {
    preview: "Error codes and handling. 400 Bad Request, 401 Unauthorized, 429 Rate Limited...",
    keywords: ["errors", "error codes", "handling", "exceptions", "debugging"]
  },
  "best-practices": {
    preview: "Security best practices, performance optimization, and recommended patterns...",
    keywords: ["best practices", "security", "performance", "optimization", "patterns"]
  },
  changelog: {
    preview: "Version history and release notes. Latest: v0.4.0-beta with public beta launch...",
    keywords: ["changelog", "versions", "releases", "updates", "history"]
  }
};

export const DocSearch: React.FC<DocSearchProps> = ({
  searchQuery,
  onSearchChange,
  onResultClick,
  sidebarSections
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    sidebarSections.forEach(section => {
      section.items.forEach(item => {
        const indexData = searchIndex[item.id];
        const labelMatch = item.label.toLowerCase().includes(query);
        const sectionMatch = section.title.toLowerCase().includes(query);
        const keywordMatch = indexData?.keywords.some(k => k.includes(query));
        const previewMatch = indexData?.preview.toLowerCase().includes(query);

        if (labelMatch || sectionMatch || keywordMatch || previewMatch) {
          results.push({
            id: item.id,
            title: item.label,
            section: section.title,
            preview: indexData?.preview || "",
            type: item.id.startsWith("sdk") ? "code" : item.id === "chat" || item.id === "embeddings" ? "api" : "section",
            icon: item.icon
          });
        }
      });
    });

    return results.slice(0, 8);
  }, [searchQuery, sidebarSections]);

  const handleResultClick = (id: string) => {
    onResultClick(id);
    onSearchChange("");
    setIsFocused(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full pl-10 pr-16 py-2 text-sm bg-background border-border"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="p-1 hover:bg-secondary rounded"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-secondary rounded text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isFocused && searchQuery && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>{searchResults.length} results for "{searchQuery}"</span>
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.id)}
                className="w-full p-3 flex items-start gap-3 hover:bg-secondary/50 transition-colors text-left border-b border-border last:border-0"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <result.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">{result.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {result.type === "code" ? "SDK" : result.type === "api" ? "API" : "Doc"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{result.preview}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{result.section}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isFocused && searchQuery && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-6 text-center">
          <Hash className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-foreground font-medium">No results found</p>
          <p className="text-xs text-muted-foreground mt-1">Try different keywords or browse the sidebar</p>
        </div>
      )}
    </div>
  );
};

export default DocSearch;
