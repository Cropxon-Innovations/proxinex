import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingDown, Zap, Brain, Sparkles, Lock } from "lucide-react";

interface Model {
  name: string;
  tier: "open" | "premium";
  costPer1k: number;
  icon: React.ReactNode;
  description: string;
}

const models: Model[] = [
  { 
    name: "GPT-4o", 
    tier: "premium", 
    costPer1k: 5.00,
    icon: <Sparkles className="h-4 w-4" />,
    description: "Best for complex reasoning"
  },
  { 
    name: "Claude 3.5", 
    tier: "premium", 
    costPer1k: 4.50,
    icon: <Brain className="h-4 w-4" />,
    description: "Best for analysis & writing"
  },
  { 
    name: "Gemini Pro", 
    tier: "premium", 
    costPer1k: 3.50,
    icon: <Zap className="h-4 w-4" />,
    description: "Best for multimodal tasks"
  },
  { 
    name: "Llama 3.1", 
    tier: "open", 
    costPer1k: 0.50,
    icon: <Lock className="h-4 w-4" />,
    description: "Fast & cost-effective"
  },
  { 
    name: "Mixtral", 
    tier: "open", 
    costPer1k: 0.35,
    icon: <Lock className="h-4 w-4" />,
    description: "Great for general tasks"
  },
];

export const PricingCalculator = () => {
  const [queries, setQueries] = useState([5000]);
  const [openModelRatio, setOpenModelRatio] = useState([70]);
  const [selectedModels, setSelectedModels] = useState<string[]>(["GPT-4o", "Llama 3.1"]);

  const calculations = useMemo(() => {
    const totalQueries = queries[0];
    const openRatio = openModelRatio[0] / 100;
    const premiumRatio = 1 - openRatio;

    const openQueries = Math.round(totalQueries * openRatio);
    const premiumQueries = Math.round(totalQueries * premiumRatio);

    // Average costs
    const avgOpenCost = models.filter(m => m.tier === "open").reduce((a, b) => a + b.costPer1k, 0) / 
                        models.filter(m => m.tier === "open").length;
    const avgPremiumCost = models.filter(m => m.tier === "premium").reduce((a, b) => a + b.costPer1k, 0) / 
                          models.filter(m => m.tier === "premium").length;

    const proxinexCost = (openQueries / 1000 * avgOpenCost) + (premiumQueries / 1000 * avgPremiumCost);
    const directPremiumCost = totalQueries / 1000 * avgPremiumCost;
    const savings = directPremiumCost - proxinexCost;
    const savingsPercent = (savings / directPremiumCost) * 100;

    return {
      totalQueries,
      openQueries,
      premiumQueries,
      proxinexCost,
      directPremiumCost,
      savings,
      savingsPercent
    };
  }, [queries, openModelRatio]);

  const toggleModel = (modelName: string) => {
    setSelectedModels(prev => 
      prev.includes(modelName) 
        ? prev.filter(m => m !== modelName)
        : [...prev, modelName]
    );
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Calculator className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Cost Calculator</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Estimate Your Savings
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            See how Proxinex's intelligent routing saves you money by using open models when possible.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-6">Configure Usage</h3>
              
              {/* Queries Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-foreground">Monthly Queries</label>
                  <span className="text-lg font-bold text-primary">{queries[0].toLocaleString()}</span>
                </div>
                <Slider
                  value={queries}
                  onValueChange={setQueries}
                  min={1000}
                  max={100000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1K</span>
                  <span>100K</span>
                </div>
              </div>

              {/* Open Model Ratio */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-foreground">Open Model Usage</label>
                  <span className="text-lg font-bold text-primary">{openModelRatio[0]}%</span>
                </div>
                <Slider
                  value={openModelRatio}
                  onValueChange={setOpenModelRatio}
                  min={30}
                  max={95}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>30% (More complex queries)</span>
                  <span>95% (Simple queries)</span>
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Available Models</label>
                <div className="grid grid-cols-2 gap-2">
                  {models.map((model) => (
                    <button
                      key={model.name}
                      onClick={() => toggleModel(model.name)}
                      className={`
                        p-3 rounded-lg border text-left transition-all
                        ${selectedModels.includes(model.name) 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-card/50 opacity-60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {model.icon}
                        <span className="text-sm font-medium text-foreground">{model.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={model.tier === "premium" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {model.tier}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          ₹{model.costPer1k}/1K
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Results */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-6">Estimated Costs</h3>

              {/* Query Distribution */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Query Distribution</span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${openModelRatio[0]}%` }}
                  />
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${100 - openModelRatio[0]}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-emerald-500">{calculations.openQueries.toLocaleString()} Open</span>
                  <span className="text-primary">{calculations.premiumQueries.toLocaleString()} Premium</span>
                </div>
              </div>

              {/* Cost Comparison */}
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">Direct Premium API Cost</span>
                    <span className="text-lg font-bold text-muted-foreground line-through">
                      ₹{calculations.directPremiumCost.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">All queries routed to premium models</p>
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-foreground font-medium">With Proxinex</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{calculations.proxinexCost.toFixed(0)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Intelligent routing optimizes costs</p>
                </div>
              </div>

              {/* Savings */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/20 to-primary/20 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium text-foreground">Your Savings</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-500">
                    ₹{calculations.savings.toFixed(0)}
                  </span>
                  <span className="text-lg text-emerald-500">
                    ({calculations.savingsPercent.toFixed(0)}% saved)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Per month with intelligent model routing
                </p>
              </div>

              {/* CTA */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Start free • No credit card required • 50 queries/day
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
