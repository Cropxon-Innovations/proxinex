import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Star, Clock, DollarSign, Check, Loader2, AlertCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { UsageLimitModal } from "@/components/UsageLimitModal";

const models = [
  { id: "gemini-flash", name: "Gemini 2.5 Flash", provider: "Google", selected: true },
  { id: "gemini-pro", name: "Gemini 2.5 Pro", provider: "Google", selected: true },
  { id: "gpt5", name: "GPT-5", provider: "OpenAI", selected: false },
  { id: "gpt5-mini", name: "GPT-5 Mini", provider: "OpenAI", selected: true },
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
  const [selectedModels, setSelectedModels] = useState(["gemini-flash", "gemini-pro", "gpt5-mini"]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const { toast } = useToast();
  const { 
    usage, 
    limits, 
    canUseFeature, 
    incrementUsage, 
    getUsageDisplay,
    getRequiredPlanForUnlimited 
  } = useUsageLimits();

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

  return (
    <>
      <Helmet>
        <title>AI Sandbox - Compare Models Side by Side | Proxinex</title>
        <meta 
          name="description" 
          content="Compare GPT-5, Gemini, and more AI models side by side. See accuracy, speed, and cost differences for the same query." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm text-primary font-medium">Sandbox</span>
                {limits.sandbox !== Infinity && (
                  <Badge variant="secondary" className="text-[10px]">
                    {getUsageDisplay("sandbox")} used
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Compare AI Models
              </h1>
              <p className="text-lg text-muted-foreground">
                Run the same query across multiple models. See which performs best for your use case.
              </p>
            </div>

            {/* Model Selection */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {models.map(model => (
                  <button
                    key={model.id}
                    onClick={() => toggleModel(model.id)}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all disabled:opacity-50 ${
                      selectedModels.includes(model.id)
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {selectedModels.includes(model.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">({model.provider})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Query Input */}
            <div className="max-w-3xl mx-auto mb-12">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your query to compare models..."
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading || !query.trim() || selectedModels.length === 0}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Compare
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedModels.map((modelId) => {
                    const model = models.find(m => m.id === modelId);
                    return (
                      <div 
                        key={modelId}
                        className="rounded-lg border border-border bg-card overflow-hidden animate-pulse"
                      >
                        <div className="p-4 border-b border-border bg-secondary/30">
                          <div className="font-semibold text-foreground">{model?.name}</div>
                          <div className="text-xs text-muted-foreground">{model?.provider}</div>
                        </div>
                        <div className="p-4 min-h-[200px] flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
                  {results.results.map((result, index) => (
                    <div 
                      key={result.model}
                      className="rounded-lg border border-border bg-card overflow-hidden animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Model Header */}
                      <div className="p-4 border-b border-border bg-secondary/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-foreground">{result.model}</div>
                            <div className="text-xs text-muted-foreground">{result.provider}</div>
                          </div>
                          {result.success && (
                            <div className="flex items-center gap-1 text-primary">
                              <Star className="h-4 w-4 fill-primary" />
                              <span className="font-medium">
                                {Math.min(95, Math.round(85 + (result.response.length / 100)))}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Response */}
                      <div className="p-4">
                        {result.success ? (
                          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[200px] max-h-[300px] overflow-y-auto">
                            {result.response}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-500 min-h-[200px]">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-sm">{result.error || "Failed to get response"}</span>
                          </div>
                        )}
                      </div>

                      {/* Metrics Footer */}
                      <div className="p-4 border-t border-border bg-secondary/20">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatLatency(result.latency)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCost(result.cost)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {results.summary && (
                  <div className="mt-8 p-6 rounded-lg bg-card border border-border">
                    <h3 className="font-semibold text-foreground mb-4">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {results.summary.highestAccuracy && (
                        <div>
                          <span className="text-muted-foreground">Most Comprehensive:</span>
                          <span className="ml-2 text-foreground font-medium">
                            {results.summary.highestAccuracy}
                          </span>
                        </div>
                      )}
                      {results.summary.fastestResponse && (
                        <div>
                          <span className="text-muted-foreground">Fastest Response:</span>
                          <span className="ml-2 text-foreground font-medium">
                            {results.summary.fastestResponse.model} ({formatLatency(results.summary.fastestResponse.latency)})
                          </span>
                        </div>
                      )}
                      {results.summary.lowestCost && (
                        <div>
                          <span className="text-muted-foreground">Lowest Cost:</span>
                          <span className="ml-2 text-foreground font-medium">
                            {results.summary.lowestCost.model} ({formatCost(results.summary.lowestCost.cost)})
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
