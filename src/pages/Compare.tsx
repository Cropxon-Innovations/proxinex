import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, X, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";

const comparisonData = [
  {
    feature: "Multi-LLM Routing",
    proxinex: true,
    perplexity: false,
    description: "Route queries to optimal models automatically",
  },
  {
    feature: "Model Sandbox",
    proxinex: true,
    perplexity: false,
    description: "Compare multiple models side-by-side",
  },
  {
    feature: "Inline Ask™",
    proxinex: true,
    perplexity: false,
    description: "Dig deeper into any part of an answer",
  },
  {
    feature: "Accuracy Scoring",
    proxinex: true,
    perplexity: false,
    description: "Trust scores with source verification",
  },
  {
    feature: "Cost Transparency",
    proxinex: true,
    perplexity: false,
    description: "See exact cost per query in real-time",
  },
  {
    feature: "Developer APIs",
    proxinex: true,
    perplexity: true,
    description: "Full API access with SDKs",
  },
  {
    feature: "Freshness Indicators",
    proxinex: true,
    perplexity: false,
    description: "Know when data was last updated",
  },
  {
    feature: "Research Mode",
    proxinex: true,
    perplexity: true,
    description: "Deep research with citations",
  },
  {
    feature: "Notebooks",
    proxinex: true,
    perplexity: false,
    description: "Save, annotate, and organize research",
  },
  {
    feature: "India-Optimized Pricing",
    proxinex: true,
    perplexity: false,
    description: "Local currency, competitive rates",
  },
];

const Compare = () => {
  return (
    <>
      <Helmet>
        <title>Proxinex vs Perplexity AI - Compare AI Platforms</title>
        <meta 
          name="description" 
          content="See how Proxinex compares to Perplexity AI. Multi-model routing, accuracy scoring, cost transparency - features Perplexity doesn't offer." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-sm text-primary font-medium">Compare</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                AI Search vs AI Intelligence Control Plane
              </h1>
              <p className="text-lg text-muted-foreground">
                Perplexity answers questions. Proxinex controls intelligence.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="max-w-4xl mx-auto">
              <div className="rounded-lg border border-border overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-3 bg-card border-b border-border">
                  <div className="p-4 font-medium text-foreground">Feature</div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="font-semibold text-primary">Proxinex</div>
                    <div className="text-xs text-muted-foreground">Control Plane</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="font-semibold text-muted-foreground">Perplexity</div>
                    <div className="text-xs text-muted-foreground">AI Search</div>
                  </div>
                </div>

                {/* Feature Rows */}
                {comparisonData.map((row, index) => (
                  <div 
                    key={row.feature}
                    className={`grid grid-cols-3 ${index !== comparisonData.length - 1 ? 'border-b border-border' : ''} hover:bg-secondary/30 transition-colors`}
                  >
                    <div className="p-4">
                      <div className="font-medium text-foreground text-sm">{row.feature}</div>
                      <div className="text-xs text-muted-foreground mt-1">{row.description}</div>
                    </div>
                    <div className="p-4 flex items-center justify-center border-l border-border">
                      {row.proxinex ? (
                        <div className="p-1 rounded-full bg-success/20 text-success">
                          <Check className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="p-1 rounded-full bg-destructive/20 text-destructive">
                          <X className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-center border-l border-border">
                      {row.perplexity ? (
                        <div className="p-1 rounded-full bg-success/20 text-success">
                          <Check className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="p-1 rounded-full bg-destructive/20 text-destructive">
                          <X className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-12 p-8 rounded-lg bg-card border border-border text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Ready to take control?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Proxinex gives you the transparency and control that other AI platforms don't.
                </p>
                <Link to="/app">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow group">
                    Try Proxinex Free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Compare;
