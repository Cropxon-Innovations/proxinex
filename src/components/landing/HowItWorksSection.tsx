import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Sparkles, Brain, Search, Shield, Zap } from "lucide-react";

// Animated flowing particle
const FlowParticle = ({
  delay = 0,
  duration = 3
}: {
  delay?: number;
  duration?: number;
}) => <div className="absolute w-2 h-2 rounded-full bg-primary/80 shadow-[0_0_10px_hsl(var(--primary))]" style={{
  animation: `flowDown ${duration}s ease-in-out ${delay}s infinite`
}} />;

// Confidence indicator with animation
const ConfidenceIndicator = ({
  level
}: {
  level: "high" | "medium" | "low";
}) => {
  const config = {
    high: {
      color: "bg-green-500",
      glow: "shadow-green-500/50",
      label: "High Confidence"
    },
    medium: {
      color: "bg-yellow-500",
      glow: "shadow-yellow-500/50",
      label: "Medium"
    },
    low: {
      color: "bg-red-500",
      glow: "shadow-red-500/50",
      label: "Low"
    }
  };
  const {
    color,
    glow,
    label
  } = config[level];
  return <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} ${glow} shadow-lg animate-pulse`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>;
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
}) => <div className={`relative flex flex-col items-center transition-all duration-500 ${isActive ? "scale-105" : "scale-100"}`} style={{
  animationDelay: `${delay}s`
}}>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? "bg-primary/20 border-primary shadow-[0_0_30px_hsl(var(--primary)/0.4)]" : "bg-card/80 border-border"} border`}>
      <Icon className={`h-7 w-7 transition-colors duration-500 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
    </div>
    <span className={`mt-3 text-sm font-medium transition-colors duration-500 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
      {label}
    </span>
    {sublabel && <span className="text-xs text-muted-foreground/70">{sublabel}</span>}
  </div>;

// Flowing connection line
const FlowLine = ({
  isActive,
  direction = "down"
}: {
  isActive?: boolean;
  direction?: "down" | "right";
}) => <div className={`relative ${direction === "down" ? "h-12 w-0.5" : "w-12 h-0.5"} mx-auto my-2`}>
    <div className={`absolute inset-0 ${isActive ? "bg-primary/50" : "bg-border"} transition-colors duration-500`} />
    {isActive && <div className="absolute bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary))]" style={{
    width: direction === "down" ? "6px" : "6px",
    height: direction === "down" ? "6px" : "6px",
    left: direction === "down" ? "-2px" : "0",
    top: direction === "down" ? "0" : "-2px",
    animation: `${direction === "down" ? "flowDown" : "flowRight"} 2s ease-in-out infinite`
  }} />}
  </div>;
export const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState<"high" | "medium" | "low">("high");

  // Cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Cycle confidence indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setConfidenceLevel(prev => {
        if (prev === "high") return "medium";
        if (prev === "medium") return "low";
        return "high";
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  const messages = ["Proxinex selects the best intelligence automatically", "Open models first. Premium only when needed.", "Every answer includes a confidence score"];
  const [messageIndex, setMessageIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  return <section className="py-12 md:py-16 bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: "1s"
      }} />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>How It Works</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Intelligent Routing,{" "}
            <span className="text-primary">Transparent Results</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Proxinex is an AI Intelligence Control Plane—not a single model. 
            It automatically selects the best intelligence for each query.
          </p>
        </div>

        {/* Animated Flow Diagram */}
        <div className="max-w-4xl mx-auto mb-16">
          
        </div>

        {/* Trust Messages */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-8 flex items-center justify-center">
            <p key={messageIndex} className="text-lg text-muted-foreground animate-fade-in">
              "{messages[messageIndex]}"
            </p>
          </div>
        </div>

        {/* Trust Points */}
        <div className="max-w-3xl mx-auto mt-8 grid grid-cols-3 gap-3">
          <div className="text-center p-4 rounded-lg bg-card/50 border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">Intelligent</h3>
            <p className="text-xs text-muted-foreground">
              Best model for each query
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-card/50 border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">Transparent</h3>
            <p className="text-xs text-muted-foreground">
              Confidence & verified sources
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-card/50 border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-1">Cost-Efficient</h3>
            <p className="text-xs text-muted-foreground">
              Open first, premium when needed
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
    </section>;
};