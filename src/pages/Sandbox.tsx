import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Send, Star, Clock, DollarSign, Check } from "lucide-react";
import { Helmet } from "react-helmet-async";

const models = [
  { id: "gpt4", name: "GPT-4", provider: "OpenAI", selected: true },
  { id: "claude", name: "Claude 3.5", provider: "Anthropic", selected: true },
  { id: "gemini", name: "Gemini Pro", provider: "Google", selected: true },
  { id: "llama", name: "Llama 3.1", provider: "Meta", selected: false },
];

const mockResults = [
  {
    model: "GPT-4",
    provider: "OpenAI",
    accuracy: 94,
    latency: "1.2s",
    cost: "₹0.024",
    response: `The speed of light in a vacuum is exactly **299,792,458 meters per second** (approximately 300,000 km/s or about 186,282 miles per second).

**Key Facts:**
- This is a fundamental physical constant, denoted as *c*
- Nothing with mass can travel at this speed
- It takes light about 8 minutes and 20 seconds to travel from the Sun to Earth
- The speed of light is used to define the meter in the SI unit system`,
  },
  {
    model: "Claude 3.5",
    provider: "Anthropic",
    accuracy: 96,
    latency: "0.9s",
    cost: "₹0.018",
    response: `Light travels at precisely **299,792,458 m/s** in a vacuum—a fundamental constant of nature designated *c*.

**Context:**
- This speed is the cosmic speed limit; nothing can exceed it
- In other media (water, glass), light travels slower
- Einstein's special relativity is built upon this constant
- Light from the Moon reaches Earth in ~1.3 seconds`,
  },
  {
    model: "Gemini Pro",
    provider: "Google",
    accuracy: 93,
    latency: "1.1s",
    cost: "₹0.015",
    response: `The speed of light is **299,792,458 meters per second** in a vacuum.

**Important Points:**
- Symbol: *c* (from Latin "celeritas" meaning speed)
- Approximately 3 × 10⁸ m/s for quick calculations
- Defines the relationship E = mc²
- Light year = distance light travels in one year (~9.46 trillion km)`,
  },
];

const Sandbox = () => {
  const [query, setQuery] = useState("What is the speed of light?");
  const [selectedModels, setSelectedModels] = useState(["gpt4", "claude", "gemini"]);
  const [hasQueried, setHasQueried] = useState(true);

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setHasQueried(true);
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Sandbox - Compare Models Side by Side | Proxinex</title>
        <meta 
          name="description" 
          content="Compare GPT-4, Claude, Gemini, and more AI models side by side. See accuracy, speed, and cost differences for the same query." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-sm text-primary font-medium">Sandbox</span>
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
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
                  />
                </div>
                <Button type="submit" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                  <Send className="h-5 w-5 mr-2" />
                  Compare
                </Button>
              </form>
            </div>

            {/* Results Grid */}
            {hasQueried && (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {mockResults.map((result, index) => (
                    <div 
                      key={result.model}
                      className="rounded-lg border border-border bg-card overflow-hidden animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Model Header */}
                      <div className="p-4 border-b border-border bg-secondary/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-foreground">{result.model}</div>
                            <div className="text-xs text-muted-foreground">{result.provider}</div>
                          </div>
                          <div className="flex items-center gap-1 text-primary">
                            <Star className="h-4 w-4 fill-primary" />
                            <span className="font-medium">{result.accuracy}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Response */}
                      <div className="p-4">
                        <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-[200px]">
                          {result.response}
                        </div>
                      </div>

                      {/* Metrics Footer */}
                      <div className="p-4 border-t border-border bg-secondary/20">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{result.latency}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{result.cost}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-8 p-6 rounded-lg bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-4">Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Highest Accuracy:</span>
                      <span className="ml-2 text-foreground font-medium">Claude 3.5 (96%)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fastest Response:</span>
                      <span className="ml-2 text-foreground font-medium">Claude 3.5 (0.9s)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lowest Cost:</span>
                      <span className="ml-2 text-foreground font-medium">Gemini Pro (₹0.015)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Sandbox;
