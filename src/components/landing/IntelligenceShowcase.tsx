import { ArrowRight, Shield, Brain, Zap, CheckCircle } from "lucide-react";
import proxinexIntelligence from "@/assets/proxinex-intelligence.png";

export const IntelligenceShowcase = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-card/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-4">
            <Brain className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">The Proxinex Difference</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            From Black Box to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Complete Control
            </span>
          </h2>
          <p className="text-base text-muted-foreground">
            Stop guessing. Start governing. See how Proxinex transforms AI chaos into controlled intelligence.
          </p>
        </div>

        {/* Image Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Decorative glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl blur-xl opacity-50" />
          
          {/* Image wrapper */}
          <div className="relative bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-3 md:p-6 shadow-xl">
            <img 
              src={proxinexIntelligence} 
              alt="Proxinex Control Intelligence - From black box AI problems to a governed workflow with intent detection, smart routing, premium verification, and governed answers with confidence scores"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-card/50 border border-border/50">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-xs">The Problem</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Black box AI with unpredictable costs</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-card/50 border border-border/50">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-xs">Smart Routing</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Routes to optimal model</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-card/50 border border-border/50">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-xs">Verification</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Premium when needed</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-card/50 border border-border/50">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-xs">Confidence</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Scores you can trust</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
