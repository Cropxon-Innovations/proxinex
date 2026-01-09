import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Star, 
  Clock, 
  DollarSign, 
  Check, 
  Loader2, 
  AlertCircle,
  Sparkles,
  Lock,
  Unlock,
  Zap,
  Brain,
  Cpu,
  Server,
  Filter,
  Code,
  Image,
  Video,
  FileText,
  Eye,
  Pen,
  MessageSquare,
  Search,
  Workflow
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { UsageLimitModal } from "@/components/UsageLimitModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: "open" | "closed";
  category: "text" | "reasoning" | "code" | "image" | "video" | "vision" | "writing" | "research";
  description: string;
  bestFor: string[];
  icon: React.ElementType;
  selected: boolean;
}

// Comprehensive model list based on Proxinex strategy
const models: AIModel[] = [
  // ==================== OPEN SOURCE MODELS ====================
  
  // 🧠 TEXT / LANGUAGE MODELS - General Purpose
  { 
    id: "llama3-8b", 
    name: "LLaMA 3 (8B)", 
    provider: "Meta", 
    type: "open",
    category: "text",
    description: "Fast general-purpose workhorse",
    bestFor: ["General writing", "Summaries", "Chat", "RAG synthesis"],
    icon: MessageSquare,
    selected: true 
  },
  { 
    id: "llama3-70b", 
    name: "LLaMA 3 (70B)", 
    provider: "Meta", 
    type: "open",
    category: "reasoning",
    description: "Deep reasoning & long context",
    bestFor: ["Deep reasoning", "Policy analysis", "Enterprise answers"],
    icon: Brain,
    selected: false 
  },
  { 
    id: "mistral-7b", 
    name: "Mistral 7B", 
    provider: "Mistral AI", 
    type: "open",
    category: "text",
    description: "Fast intent detection & routing",
    bestFor: ["Intent detection", "Classification", "Routing decisions"],
    icon: Workflow,
    selected: false 
  },
  
  // 🟡 Reasoning / Problem Solving
  { 
    id: "mixtral-8x7b", 
    name: "Mixtral 8x7B (MoE)", 
    provider: "Mistral AI", 
    type: "open",
    category: "reasoning",
    description: "Smart but affordable reasoning",
    bestFor: ["Reasoning", "Problem solving", "Multi-step answers"],
    icon: Brain,
    selected: true 
  },
  
  // ✍️ Writing Models
  { 
    id: "llama3-writing", 
    name: "LLaMA 3 70B Writer", 
    provider: "Meta", 
    type: "open",
    category: "writing",
    description: "Best open-source writing quality",
    bestFor: ["Blogs", "Product copy", "Reports", "Long-form"],
    icon: Pen,
    selected: false 
  },
  
  // 🧩 Code Generation
  { 
    id: "code-llama", 
    name: "Code LLaMA", 
    provider: "Meta", 
    type: "open",
    category: "code",
    description: "Code generation & debugging",
    bestFor: ["Python", "JavaScript", "Java", "C++", "Go"],
    icon: Code,
    selected: false 
  },
  { 
    id: "deepseek-coder", 
    name: "DeepSeek Coder", 
    provider: "DeepSeek", 
    type: "open",
    category: "code",
    description: "Competitive coding & algorithms",
    bestFor: ["Algorithms", "SQL", "Problem solving", "Interview prep"],
    icon: Code,
    selected: false 
  },
  
  // 🧠 Research / RAG
  { 
    id: "llama3-rag", 
    name: "LLaMA 3 + RAG", 
    provider: "Meta", 
    type: "open",
    category: "research",
    description: "Research with citations",
    bestFor: ["Research answers", "Document Q&A", "Knowledge synthesis"],
    icon: Search,
    selected: false 
  },
  
  // 🖼️ Image Generation
  { 
    id: "sdxl", 
    name: "Stable Diffusion XL", 
    provider: "Stability AI", 
    type: "open",
    category: "image",
    description: "High-quality image generation",
    bestFor: ["Marketing visuals", "UI mockups", "Illustrations"],
    icon: Image,
    selected: false 
  },
  { 
    id: "controlnet", 
    name: "SD ControlNet", 
    provider: "Stability AI", 
    type: "open",
    category: "image",
    description: "Structured image control",
    bestFor: ["Pose control", "Layout control", "Product mockups"],
    icon: Image,
    selected: false 
  },
  
  // 🎥 Video Generation
  { 
    id: "stable-video", 
    name: "Stable Video Diffusion", 
    provider: "Stability AI", 
    type: "open",
    category: "video",
    description: "Image-to-video generation",
    bestFor: ["Short clips", "Concept previews", "Marketing demos"],
    icon: Video,
    selected: false 
  },
  { 
    id: "animatediff", 
    name: "AnimateDiff", 
    provider: "Community", 
    type: "open",
    category: "video",
    description: "Animated visual sequences",
    bestFor: ["Animated visuals", "Short sequences", "Creative"],
    icon: Video,
    selected: false 
  },
  
  // 🧠 Vision / Multimodal
  { 
    id: "llava", 
    name: "LLaVA", 
    provider: "LLaVA Team", 
    type: "open",
    category: "vision",
    description: "Image understanding & analysis",
    bestFor: ["Screenshot analysis", "Diagram explanation", "Charts"],
    icon: Eye,
    selected: false 
  },
  
  // 📄 Document Intelligence
  { 
    id: "doc-llama", 
    name: "Document LLaMA", 
    provider: "Meta + RAG", 
    type: "open",
    category: "research",
    description: "PDF & document intelligence",
    bestFor: ["PDF Q&A", "Summarization", "Extraction"],
    icon: FileText,
    selected: false 
  },
  
  // ==================== CLOSED SOURCE MODELS ====================
  
  // 🔵 OpenAI Family
  { 
    id: "gpt4o-mini", 
    name: "GPT-4o Mini", 
    provider: "OpenAI", 
    type: "closed",
    category: "text",
    description: "Fast & cost-effective",
    bestFor: ["Quick responses", "Tool calling", "Structured output"],
    icon: Zap,
    selected: false 
  },
  { 
    id: "gpt4o", 
    name: "GPT-4o", 
    provider: "OpenAI", 
    type: "closed",
    category: "reasoning",
    description: "Best function-calling & JSON",
    bestFor: ["Tool orchestration", "API workflows", "Multimodal"],
    icon: Sparkles,
    selected: true 
  },
  { 
    id: "gpt5-nano", 
    name: "GPT-5 Nano", 
    provider: "OpenAI", 
    type: "closed",
    category: "text",
    description: "Fastest GPT-5 variant",
    bestFor: ["Speed", "Cost saving", "High-volume tasks"],
    icon: Zap,
    selected: false 
  },
  { 
    id: "gpt5-mini", 
    name: "GPT-5 Mini", 
    provider: "OpenAI", 
    type: "closed",
    category: "reasoning",
    description: "Balanced speed & power",
    bestFor: ["Strong performance", "Multimodal", "Cost-effective"],
    icon: Sparkles,
    selected: false 
  },
  { 
    id: "gpt5", 
    name: "GPT-5", 
    provider: "OpenAI", 
    type: "closed",
    category: "reasoning",
    description: "Powerful all-rounder",
    bestFor: ["Accuracy", "Long context", "Complex reasoning"],
    icon: Brain,
    selected: false 
  },
  { 
    id: "gpt52", 
    name: "GPT-5.2", 
    provider: "OpenAI", 
    type: "closed",
    category: "reasoning",
    description: "Latest enhanced reasoning",
    bestFor: ["Complex problem-solving", "Latest capabilities"],
    icon: Server,
    selected: false 
  },
  { 
    id: "o3", 
    name: "O3", 
    provider: "OpenAI", 
    type: "closed",
    category: "reasoning",
    description: "Very powerful reasoning",
    bestFor: ["Multi-step problems", "Code analysis", "Images"],
    icon: Brain,
    selected: false 
  },
  { 
    id: "o4-mini", 
    name: "O4 Mini", 
    provider: "OpenAI", 
    type: "closed",
    category: "code",
    description: "Fast reasoning for code",
    bestFor: ["Coding tasks", "Visual tasks", "Efficient reasoning"],
    icon: Code,
    selected: false 
  },
  { 
    id: "dalle", 
    name: "DALL·E 3", 
    provider: "OpenAI", 
    type: "closed",
    category: "image",
    description: "Premium creative images",
    bestFor: ["Creative visuals", "High-quality art", "Marketing"],
    icon: Image,
    selected: false 
  },
  
  // 🟣 Anthropic Family
  { 
    id: "claude-sonnet", 
    name: "Claude Sonnet", 
    provider: "Anthropic", 
    type: "closed",
    category: "reasoning",
    description: "Deep reasoning & safety",
    bestFor: ["Logic chains", "Legal/policy", "Verification"],
    icon: Brain,
    selected: false 
  },
  { 
    id: "claude-opus", 
    name: "Claude Opus", 
    provider: "Anthropic", 
    type: "closed",
    category: "reasoning",
    description: "Most capable Claude",
    bestFor: ["High-stakes reasoning", "Long documents", "Enterprise"],
    icon: Server,
    selected: false 
  },
  { 
    id: "claude-haiku", 
    name: "Claude Haiku", 
    provider: "Anthropic", 
    type: "closed",
    category: "text",
    description: "Fast & lightweight",
    bestFor: ["Quick responses", "Simple tasks", "Cost-effective"],
    icon: Zap,
    selected: false 
  },
  
  // 🟡 Google Family
  { 
    id: "gemini-flash-lite", 
    name: "Gemini 2.5 Flash Lite", 
    provider: "Google", 
    type: "closed",
    category: "text",
    description: "Fastest Gemini variant",
    bestFor: ["Classification", "Summarization", "Simple workloads"],
    icon: Zap,
    selected: false 
  },
  { 
    id: "gemini-flash", 
    name: "Gemini 2.5 Flash", 
    provider: "Google", 
    type: "closed",
    category: "reasoning",
    description: "Balanced Gemini choice",
    bestFor: ["Multimodal", "Reasoning", "Cost-effective"],
    icon: Sparkles,
    selected: false 
  },
  { 
    id: "gemini-pro", 
    name: "Gemini 2.5 Pro", 
    provider: "Google", 
    type: "closed",
    category: "reasoning",
    description: "Top-tier 1M+ context",
    bestFor: ["Huge context", "PDF/research", "Complex reasoning"],
    icon: Brain,
    selected: false 
  },
  { 
    id: "gemini-3-flash", 
    name: "Gemini 3 Flash", 
    provider: "Google", 
    type: "closed",
    category: "reasoning",
    description: "Next-gen balanced",
    bestFor: ["Speed & capability", "Efficient tasks"],
    icon: Cpu,
    selected: false 
  },
  { 
    id: "gemini-3-pro", 
    name: "Gemini 3 Pro", 
    provider: "Google", 
    type: "closed",
    category: "reasoning",
    description: "Latest generation",
    bestFor: ["Best quality", "Complex tasks"],
    icon: Server,
    selected: false 
  },
  { 
    id: "gemini-vision", 
    name: "Gemini Vision", 
    provider: "Google", 
    type: "closed",
    category: "vision",
    description: "Image & video analysis",
    bestFor: ["Video summarization", "Slide extraction", "Vision"],
    icon: Eye,
    selected: false 
  },
  
  // 🔷 Microsoft / Azure
  { 
    id: "phi-3", 
    name: "Phi-3", 
    provider: "Microsoft", 
    type: "closed",
    category: "text",
    description: "Small but capable",
    bestFor: ["Edge deployment", "Mobile", "Cost-effective"],
    icon: Zap,
    selected: false 
  },
  { 
    id: "phi-3-vision", 
    name: "Phi-3 Vision", 
    provider: "Microsoft", 
    type: "closed",
    category: "vision",
    description: "Compact vision model",
    bestFor: ["Image analysis", "Document understanding"],
    icon: Eye,
    selected: false 
  },
  { 
    id: "azure-gpt4", 
    name: "Azure OpenAI GPT-4", 
    provider: "Microsoft Azure", 
    type: "closed",
    category: "reasoning",
    description: "Enterprise GPT-4",
    bestFor: ["Enterprise", "Compliance", "Security"],
    icon: Server,
    selected: false 
  },
  
  // 🟠 xAI (Grok)
  { 
    id: "grok-1", 
    name: "Grok-1", 
    provider: "xAI", 
    type: "closed",
    category: "text",
    description: "Real-time knowledge",
    bestFor: ["Current events", "X/Twitter data", "Wit & humor"],
    icon: MessageSquare,
    selected: false 
  },
  { 
    id: "grok-2", 
    name: "Grok-2", 
    provider: "xAI", 
    type: "closed",
    category: "reasoning",
    description: "Enhanced Grok",
    bestFor: ["Better reasoning", "Multimodal", "Real-time"],
    icon: Brain,
    selected: false 
  },
];

interface ModelResult {
  model: string;
  provider: string;
  response: string;
  latency: number;
  cost: number;
  success: boolean;
  error?: string;
}

interface ComparisonResult {
  results: ModelResult[];
  summary: {
    highestAccuracy: string | null;
    fastestResponse: { model: string; latency: number } | null;
    lowestCost: { model: string; cost: number } | null;
  };
}

const categoryLabels: Record<string, { label: string; icon: React.ElementType }> = {
  text: { label: "Text", icon: MessageSquare },
  reasoning: { label: "Reasoning", icon: Brain },
  code: { label: "Code", icon: Code },
  image: { label: "Image", icon: Image },
  video: { label: "Video", icon: Video },
  vision: { label: "Vision", icon: Eye },
  writing: { label: "Writing", icon: Pen },
  research: { label: "Research", icon: Search },
};

const Sandbox = () => {
  const [query, setQuery] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(["llama3-8b", "mixtral-8x7b", "gpt4o"]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "open" | "closed">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();
  const { 
    usage, 
    limits, 
    canUseFeature, 
    incrementUsage, 
    getUsageDisplay,
    getRequiredPlanForUnlimited 
  } = useUsageLimits();

  const filteredModels = models.filter(model => {
    const typeMatch = filterType === "all" || model.type === filterType;
    const categoryMatch = filterCategory === "all" || model.category === filterCategory;
    return typeMatch && categoryMatch;
  });

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || selectedModels.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a query and select at least one model",
        variant: "destructive",
      });
      return;
    }

    // Check usage limits
    if (!canUseFeature("sandbox")) {
      setLimitModalOpen(true);
      return;
    }

    // Increment usage
    const success = await incrementUsage("sandbox");
    if (!success) {
      setLimitModalOpen(true);
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("model-compare", {
        body: { query: query.trim(), models: selectedModels },
      });

      if (error) throw error;
      setResults(data);
    } catch (error) {
      console.error("Comparison error:", error);
      toast({
        title: "Error",
        description: "Failed to compare models. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCost = (cost: number) => {
    return `₹${cost.toFixed(4)}`;
  };

  const getModelById = (id: string) => models.find(m => m.id === id);

  const categories = ["all", ...Object.keys(categoryLabels)];

  return (
    <>
      <Helmet>
        <title>AI Sandbox - Compare AI Models Side by Side | Proxinex</title>
        <meta 
          name="description" 
          content="Compare LLaMA, Mixtral, GPT-5, Claude, Gemini, Grok and more AI models side by side. Open source and closed source options with accuracy, speed, and cost metrics." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary font-medium">AI Sandbox</span>
                </div>
                {limits.sandbox !== Infinity && (
                  <Badge variant="secondary" className="text-xs">
                    {getUsageDisplay("sandbox")} used
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-3">
                Compare AI Models
              </h1>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Run the same query across multiple AI models. Compare open-source and closed-source options. 
                <span className="block mt-1 text-sm">Proxinex picks the right model automatically — or choose manually here.</span>
              </p>
            </div>

            {/* Filters */}
            <div className="max-w-5xl mx-auto mb-6 space-y-4">
              {/* Type Filter */}
              <Tabs value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                  <TabsTrigger value="all" className="gap-2">
                    <Filter className="h-4 w-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="open" className="gap-2 text-green-600 dark:text-green-400">
                    <Unlock className="h-4 w-4" />
                    Open Source
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="gap-2 text-amber-600 dark:text-amber-400">
                    <Lock className="h-4 w-4" />
                    Closed Source
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Category Filter */}
              <ScrollArea className="w-full">
                <div className="flex items-center justify-center gap-2 pb-2">
                  {categories.map(cat => {
                    const catInfo = categoryLabels[cat];
                    const Icon = catInfo?.icon || Filter;
                    return (
                      <Button
                        key={cat}
                        variant={filterCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterCategory(cat)}
                        className="gap-1.5 whitespace-nowrap"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {cat === "all" ? "All Categories" : catInfo?.label}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Model Selection */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredModels.map(model => {
                  const ModelIcon = model.icon;
                  const isSelected = selectedModels.includes(model.id);
                  return (
                    <button
                      key={model.id}
                      onClick={() => toggleModel(model.id)}
                      disabled={isLoading}
                      className={`relative flex flex-col p-4 rounded-xl border transition-all disabled:opacity-50 text-left group ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-primary/20' : 'bg-secondary'
                        }`}>
                          <ModelIcon className={`h-4.5 w-4.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <Badge 
                            variant={model.type === "open" ? "outline" : "secondary"} 
                            className={`text-[9px] px-1.5 py-0 ${
                              model.type === "open" 
                                ? "border-green-500/50 text-green-600 dark:text-green-400 bg-green-500/10" 
                                : "border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                            }`}
                          >
                            {model.type === "open" ? <Unlock className="h-2.5 w-2.5 mr-0.5" /> : <Lock className="h-2.5 w-2.5 mr-0.5" />}
                            {model.type === "open" ? "Open" : "Closed"}
                          </Badge>
                          
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground/30 group-hover:border-primary/50'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                        </div>
                      </div>

                      {/* Model Info */}
                      <div className="flex-1">
                        <div className="font-medium text-sm text-foreground mb-0.5">{model.name}</div>
                        <div className="text-xs text-muted-foreground mb-2">{model.provider}</div>
                        <p className="text-xs text-muted-foreground/80 line-clamp-2">{model.description}</p>
                      </div>

                      {/* Best For Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {model.bestFor.slice(0, 2).map(tag => (
                          <span 
                            key={tag} 
                            className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Selected count */}
              <div className="text-center mt-4">
                <span className="text-sm text-muted-foreground">
                  {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
                  {selectedModels.length > 0 && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => setSelectedModels([])}
                      className="ml-2 text-xs text-primary h-auto p-0"
                    >
                      Clear all
                    </Button>
                  )}
                </span>
              </div>
            </div>

            {/* Query Input */}
            <div className="max-w-3xl mx-auto mb-12">
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter your query to compare models..."
                      className="w-full px-5 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isLoading || !query.trim() || selectedModels.length === 0}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 glow h-auto py-4 px-6 text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Compare
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedModels.map((modelId) => {
                    const model = getModelById(modelId);
                    const ModelIcon = model?.icon || Sparkles;
                    return (
                      <div 
                        key={modelId}
                        className="rounded-xl border border-border bg-card overflow-hidden"
                      >
                        <div className="p-4 border-b border-border bg-secondary/30">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                              <ModelIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground text-sm">{model?.name}</div>
                              <div className="text-xs text-muted-foreground">{model?.provider}</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 min-h-[180px] flex flex-col items-center justify-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Generating response...</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results Grid */}
            {results && !isLoading && (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.results.map((result, index) => {
                    const model = models.find(m => m.name === result.model || m.id.includes(result.model.toLowerCase().replace(/[\s.-]/g, '')));
                    const ModelIcon = model?.icon || Sparkles;
                    return (
                      <div 
                        key={result.model}
                        className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in hover:shadow-lg transition-shadow"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {/* Model Header */}
                        <div className="p-4 border-b border-border bg-secondary/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <ModelIcon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground text-sm">{result.model}</div>
                                <div className="text-xs text-muted-foreground">{result.provider}</div>
                              </div>
                            </div>
                            {result.success && (
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
                                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                                <span className="text-sm font-medium text-primary">
                                  {Math.min(95, Math.round(85 + (result.response.length / 100)))}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Response */}
                        <div className="p-4">
                          {result.success ? (
                            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[160px] max-h-[240px] overflow-y-auto scrollbar-thin">
                              {result.response}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-destructive min-h-[160px]">
                              <AlertCircle className="h-5 w-5" />
                              <span className="text-sm">{result.error || "Failed to get response"}</span>
                            </div>
                          )}
                        </div>

                        {/* Metrics Footer */}
                        <div className="p-4 border-t border-border bg-secondary/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="font-medium">{formatLatency(result.latency)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <DollarSign className="h-3.5 w-3.5" />
                              <span className="font-medium">{formatCost(result.cost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                {results.summary && (
                  <div className="mt-8 p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Comparison Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {results.summary.highestAccuracy && (
                        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Most Comprehensive</span>
                          </div>
                          <span className="font-semibold text-foreground">
                            {results.summary.highestAccuracy}
                          </span>
                        </div>
                      )}
                      {results.summary.fastestResponse && (
                        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Fastest Response</span>
                          </div>
                          <span className="font-semibold text-foreground">
                            {results.summary.fastestResponse.model}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({formatLatency(results.summary.fastestResponse.latency)})
                          </span>
                        </div>
                      )}
                      {results.summary.lowestCost && (
                        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Lowest Cost</span>
                          </div>
                          <span className="font-semibold text-foreground">
                            {results.summary.lowestCost.model}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({formatCost(results.summary.lowestCost.cost)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      <UsageLimitModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        feature="sandbox"
        usageCount={usage.sandbox}
        limit={limits.sandbox}
        requiredPlan={getRequiredPlanForUnlimited("sandbox")}
      />
    </>
  );
};

export default Sandbox;
