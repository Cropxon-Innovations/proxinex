import { ArrowRight, Shield, Brain, Zap, CheckCircle } from "lucide-react";
import proxinexIntelligence from "@/assets/proxinex-intelligence.png";

export const IntelligenceShowcase = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-card/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">The Proxinex Difference</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            From Black Box to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Complete Control
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Stop guessing. Start governing. See how Proxinex transforms AI chaos into controlled intelligence.
          </p>
        </div>

        {/* Image Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Decorative glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-2xl opacity-50" />
          
          {/* Image wrapper */}
          <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-4 md:p-8 shadow-xl">
            <img 
              src={proxinexIntelligence} 
              alt="Proxinex Control Intelligence - From black box AI problems to a governed workflow with intent detection, smart routing, premium verification, and governed answers with confidence scores"
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">The Problem</h4>
              <p className="text-xs text-muted-foreground mt-1">Black box AI with unpredictable costs and uncertain reliability</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">Smart Routing</h4>
              <p className="text-xs text-muted-foreground mt-1">Intelligently routes each task to the optimal model</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">Verification</h4>
              <p className="text-xs text-muted-foreground mt-1">Premium verification only when needed for high-risk queries</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">Confidence</h4>
              <p className="text-xs text-muted-foreground mt-1">Every response includes a confidence score you can trust</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
