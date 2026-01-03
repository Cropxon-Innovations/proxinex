import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, DollarSign, Star } from "lucide-react";

const mockResults = [
  {
    model: "GPT-4",
    provider: "OpenAI",
    accuracy: 94,
    latency: "1.2s",
    cost: "₹0.024",
    response: "Quantum computing uses qubits that can exist in superposition, allowing parallel processing of multiple states simultaneously...",
  },
  {
    model: "Claude 3.5",
    provider: "Anthropic",
    accuracy: 96,
    latency: "0.9s",
    cost: "₹0.018",
    response: "Unlike classical bits, quantum bits (qubits) leverage superposition and entanglement to perform computations exponentially faster...",
  },
  {
    model: "Gemini Pro",
    provider: "Google",
    accuracy: 91,
    latency: "1.1s",
    cost: "₹0.015",
    response: "Quantum computers harness quantum mechanical phenomena like superposition and entanglement to process information...",
  },
];

export const SandboxPreview = () => {
  return (
    <section className="py-12 md:py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="text-xs text-primary font-medium">Sandbox</span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2 mb-3">
            Compare AI Models Side by Side
          </h2>
          <p className="text-base text-muted-foreground">
            See how different models answer the same question. Compare accuracy, speed, and cost.
          </p>
        </div>

        {/* Mock Sandbox UI */}
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {/* Query Bar */}
            <div className="p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-2 rounded-lg bg-input border border-border text-muted-foreground text-sm">
                  "Explain quantum computing in simple terms"
                </div>
                <Button size="sm" className="bg-primary text-primary-foreground">
                  Compare
                </Button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              {mockResults.map((result, index) => (
                <div 
                  key={result.model} 
                  className="p-4 animate-fade-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Model Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-foreground">{result.model}</div>
                      <div className="text-xs text-muted-foreground">{result.provider}</div>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="h-4 w-4 fill-primary" />
                      <span className="text-sm font-medium">{result.accuracy}%</span>
                    </div>
                  </div>

                  {/* Response Preview */}
                  <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {result.response}
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-6">
            <Link to="/sandbox">
              <Button variant="outline" size="sm" className="border-border hover:bg-secondary group">
                Try Sandbox
                <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
