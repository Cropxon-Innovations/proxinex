import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Sparkles, Brain, Search, Shield, Zap } from "lucide-react";

// Animated flowing particle
const FlowParticle = ({ delay = 0, duration = 3 }: { delay?: number; duration?: number }) => (
  <div
    className="absolute w-2 h-2 rounded-full bg-primary/80 shadow-[0_0_10px_hsl(var(--primary))]"
    style={{
      animation: `flowDown ${duration}s ease-in-out ${delay}s infinite`,
    }}
  />
);

// Confidence indicator with animation
const ConfidenceIndicator = ({ level }: { level: "high" | "medium" | "low" }) => {
  const config = {
    high: { color: "bg-green-500", glow: "shadow-green-500/50", label: "High Confidence" },
    medium: { color: "bg-yellow-500", glow: "shadow-yellow-500/50", label: "Medium" },
    low: { color: "bg-red-500", glow: "shadow-red-500/50", label: "Low" },
  };

  const { color, glow, label } = config[level];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} ${glow} shadow-lg animate-pulse`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
};

// Flow node component
const FlowNode = ({ 
  icon: Icon, 
  label, 
  sublabel,
  isActive,
  delay = 0
}: { 
  icon: React.ElementType; 
  label: string; 
  sublabel?: string;
  isActive?: boolean;
  delay?: number;
}) => (
  <div 
    className={`relative flex flex-col items-center transition-all duration-500 ${
      isActive ? "scale-105" : "scale-100"
    }`}
    style={{ animationDelay: `${delay}s` }}
  >
    <div 
      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
        isActive 
          ? "bg-primary/20 border-primary shadow-[0_0_30px_hsl(var(--primary)/0.4)]" 
          : "bg-card/80 border-border"
      } border`}
    >
      <Icon className={`h-7 w-7 transition-colors duration-500 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
    </div>
    <span className={`mt-3 text-sm font-medium transition-colors duration-500 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
      {label}
    </span>
    {sublabel && (
      <span className="text-xs text-muted-foreground/70">{sublabel}</span>
    )}
  </div>
);

// Flowing connection line
const FlowLine = ({ isActive, direction = "down" }: { isActive?: boolean; direction?: "down" | "right" }) => (
  <div className={`relative ${direction === "down" ? "h-12 w-0.5" : "w-12 h-0.5"} mx-auto my-2`}>
    <div className={`absolute inset-0 ${isActive ? "bg-primary/50" : "bg-border"} transition-colors duration-500`} />
    {isActive && (
      <div 
        className="absolute bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]"
        style={{
          width: direction === "down" ? "6px" : "6px",
          height: direction === "down" ? "6px" : "6px",
          left: direction === "down" ? "-2px" : "0",
          top: direction === "down" ? "0" : "-2px",
          animation: `${direction === "down" ? "flowDown" : "flowRight"} 2s ease-in-out infinite`,
        }}
      />
    )}
  </div>
);

export const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState<"high" | "medium" | "low">("high");

  // Cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Cycle confidence indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setConfidenceLevel((prev) => {
        if (prev === "high") return "medium";
        if (prev === "medium") return "low";
        return "high";
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const messages = [
    "Proxinex selects the best intelligence automatically",
    "Open models first. Premium only when needed.",
    "Every answer includes a confidence score",
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Sparkles className="h-4 w-4" />
            <span>How It Works</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Intelligent Routing,{" "}
            <span className="text-primary">Transparent Results</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proxinex is an AI Intelligence Control Plane—not a single model. 
            It automatically selects the best intelligence for each query.
          </p>
        </div>

        {/* Animated Flow Diagram */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-12">
            {/* Flow Chart */}
            <div className="flex flex-col items-center">
              {/* User Prompt */}
              <FlowNode 
                icon={Search} 
                label="Your Prompt" 
                sublabel="Any question"
                isActive={activeStep === 0}
              />
              
              <FlowLine isActive={activeStep >= 1} />
              
              {/* Intent Detection */}
              <FlowNode 
                icon={Brain} 
                label="Intent Detection" 
                sublabel="Understanding your need"
                isActive={activeStep === 1}
              />
              
              <FlowLine isActive={activeStep >= 2} />
              
              {/* Smart Router */}
              <div className="relative">
                <FlowNode 
                  icon={Zap} 
                  label="Smart Model Router" 
                  sublabel="Selecting optimal path"
                  isActive={activeStep === 2}
                />
                
                {/* Multiple path indicators */}
                {activeStep === 2 && (
                  <div className="absolute -left-20 -right-20 top-1/2 flex justify-between pointer-events-none">
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-primary/30" />
                    <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-primary/30" />
                  </div>
                )}
              </div>
              
              <FlowLine isActive={activeStep >= 3} />
              
              {/* Open Models */}
              <FlowNode 
                icon={Sparkles} 
                label="Open Models" 
                sublabel="Primary intelligence"
                isActive={activeStep === 3}
              />
              
              <FlowLine isActive={activeStep >= 4} />
              
              {/* Verification */}
              <div className="relative">
                <FlowNode 
                  icon={Shield} 
                  label="Verification" 
                  sublabel="Only if required"
                  isActive={activeStep === 4}
                />
                
                {/* Fade in/out effect for premium verification */}
                <div 
                  className={`absolute -right-32 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 transition-opacity duration-1000 ${
                    activeStep === 4 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Premium verification
                </div>
              </div>
              
              <FlowLine isActive={activeStep >= 5} />
              
              {/* Answer with Confidence */}
              <div className="flex flex-col items-center">
                <FlowNode 
                  icon={CheckCircle} 
                  label="Answer" 
                  isActive={activeStep === 5}
                />
                
                {/* Confidence Indicator */}
                <div className={`mt-4 transition-opacity duration-500 ${activeStep === 5 ? "opacity-100" : "opacity-50"}`}>
                  <ConfidenceIndicator level={confidenceLevel} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Messages */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-8 flex items-center justify-center">
            <p 
              key={messageIndex}
              className="text-lg text-muted-foreground animate-fade-in"
            >
              "{messages[messageIndex]}"
            </p>
          </div>
        </div>

        {/* Trust Points */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-xl bg-card/50 border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Intelligent</h3>
            <p className="text-sm text-muted-foreground">
              Automatically selects the best model for each query type
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-card/50 border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Transparent</h3>
            <p className="text-sm text-muted-foreground">
              Every answer shows confidence scores and verified sources
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-card/50 border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Cost-Efficient</h3>
            <p className="text-sm text-muted-foreground">
              Open models first, premium only when truly needed
            </p>
          </div>
        </div>
      </div>

      {/* CSS for flow animations */}
      <style>{`
        @keyframes flowDown {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        
        @keyframes flowRight {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
};
