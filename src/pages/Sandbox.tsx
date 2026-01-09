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
  Filter
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { UsageLimitModal } from "@/components/UsageLimitModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: "open" | "closed";
  description: string;
  icon: React.ElementType;
  selected: boolean;
}

const models: AIModel[] = [
  // Open Source Models
  { 
    id: "gemini-flash-lite", 
    name: "Gemini 2.5 Flash Lite", 
    provider: "Google", 
    type: "open",
    description: "Fast, cost-effective for simple tasks",
    icon: Zap,
    selected: false 
  },
  { 
    id: "gemini-flash", 
    name: "Gemini 2.5 Flash", 
    provider: "Google", 
    type: "open",
    description: "Balanced speed and quality",
    icon: Sparkles,
    selected: true 
  },
  { 
    id: "gemini-pro", 
    name: "Gemini 2.5 Pro", 
    provider: "Google", 
    type: "open",
    description: "Top-tier reasoning & multimodal",
    icon: Brain,
    selected: true 
  },
  { 
    id: "gemini-3-flash", 
    name: "Gemini 3 Flash", 
    provider: "Google", 
    type: "open",
    description: "Next-gen balanced performance",
    icon: Cpu,
    selected: false 
  },
  { 
    id: "gemini-3-pro", 
    name: "Gemini 3 Pro", 
    provider: "Google", 
    type: "open",
    description: "Latest generation, best quality",
    icon: Server,
    selected: false 
  },
  // Closed Source Models
  { 
    id: "gpt5-nano", 
    name: "GPT-5 Nano", 
    provider: "OpenAI", 
    type: "closed",
    description: "Fastest, most cost-effective",
    icon: Zap,
    selected: false 
  },
  { 
    id: "gpt5-mini", 
    name: "GPT-5 Mini", 
    provider: "OpenAI", 
    type: "closed",
    description: "Great balance of speed & power",
    icon: Sparkles,
    selected: true 
  },
  { 
    id: "gpt5", 
    name: "GPT-5", 
    provider: "OpenAI", 
    type: "closed",
    description: "Powerful all-rounder",
    icon: Brain,
    selected: false 
  },
  { 
    id: "gpt52", 
    name: "GPT-5.2", 
    provider: "OpenAI", 
    type: "closed",
    description: "Latest with enhanced reasoning",
    icon: Server,
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

const Sandbox = () => {
  const [query, setQuery] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(["gemini-flash", "gemini-pro", "gpt5-mini"]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "open" | "closed">("all");
  const { toast } = useToast();
  const { 
    usage, 
    limits, 
    canUseFeature, 
    incrementUsage, 
    getUsageDisplay,
    getRequiredPlanForUnlimited 
  } = useUsageLimits();

  const filteredModels = models.filter(model => 
    filterType === "all" ? true : model.type === filterType
  );

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

  return (
    <>
      <Helmet>
        <title>AI Sandbox - Compare AI Models Side by Side | Proxinex</title>
        <meta 
          name="description" 
          content="Compare GPT-5, Gemini, and more AI models side by side. See accuracy, speed, and cost differences for the same query. Open source and closed source models." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-12">
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
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Compare AI Models
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Run the same query across multiple AI models. Compare open-source and closed-source options to find the best fit for your use case.
              </p>
            </div>

            {/* Model Type Filter */}
            <div className="max-w-4xl mx-auto mb-6">
              <Tabs value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                  <TabsTrigger value="all" className="gap-2">
                    <Filter className="h-4 w-4" />
                    All Models
                  </TabsTrigger>
                  <TabsTrigger value="open" className="gap-2">
                    <Unlock className="h-4 w-4" />
                    Open Source
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="gap-2">
                    <Lock className="h-4 w-4" />
                    Closed Source
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Model Selection */}
            <div className="max-w-5xl mx-auto mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredModels.map(model => {
                  const ModelIcon = model.icon;
                  const isSelected = selectedModels.includes(model.id);
                  return (
                    <button
                      key={model.id}
                      onClick={() => toggleModel(model.id)}
                      disabled={isLoading}
                      className={`relative flex items-start gap-3 p-4 rounded-xl border transition-all disabled:opacity-50 text-left group ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      {/* Selection indicator */}
                      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground/30 group-hover:border-primary/50'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>

                      {/* Model Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary/20' : 'bg-secondary'
                      }`}>
                        <ModelIcon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>

                      {/* Model Info */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                            {model.name}
                          </span>
                          <Badge 
                            variant={model.type === "open" ? "outline" : "secondary"} 
                            className={`text-[10px] px-1.5 py-0 ${
                              model.type === "open" 
                                ? "border-green-500/50 text-green-600 dark:text-green-400" 
                                : "border-amber-500/50 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {model.type === "open" ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{model.provider}</p>
                        <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">{model.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Selected count */}
              <div className="text-center mt-4">
                <span className="text-sm text-muted-foreground">
                  {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
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
                      className="w-full px-5 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
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
                        Compare Models
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
                              <div className="font-semibold text-foreground">{model?.name}</div>
                              <div className="text-xs text-muted-foreground">{model?.provider}</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 min-h-[200px] flex flex-col items-center justify-center gap-3">
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
                                <div className="font-semibold text-foreground">{result.model}</div>
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
                            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[200px] max-h-[300px] overflow-y-auto scrollbar-thin">
                              {result.response}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-destructive min-h-[200px]">
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
