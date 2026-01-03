import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Brain, 
  GitBranch, 
  Cpu, 
  ShieldCheck, 
  Lock, 
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface FlowStep {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  conditional?: boolean;
  premium?: boolean;
  isAnswer?: boolean;
}

const steps: FlowStep[] = [
  { icon: <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />, label: "Your Prompt", sublabel: "Any question" },
  { icon: <Brain className="h-5 w-5 md:h-6 md:w-6" />, label: "Intent Detection", sublabel: "Understanding your need" },
  { icon: <GitBranch className="h-5 w-5 md:h-6 md:w-6" />, label: "Smart Router", sublabel: "Selecting optimal path" },
  { icon: <Cpu className="h-5 w-5 md:h-6 md:w-6" />, label: "Open Models", sublabel: "Primary intelligence" },
  { icon: <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />, label: "Verification", sublabel: "Only if required", conditional: true },
  { icon: <Lock className="h-5 w-5 md:h-6 md:w-6" />, label: "Premium Check", sublabel: "High-impact only", premium: true },
  { icon: <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />, label: "Answer", sublabel: "Verified result", isAnswer: true }
];

const trustMessages = [
  "Right intelligence, every time",
  "Open models first. Premium only when needed.",
  "Confidence you can see",
  "Not a black box"
];

export const IntelligenceFlow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [confidence, setConfidence] = useState<"high" | "medium" | "low">("high");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => {
        const next = (prev + 1) % 8;
        
        if (next === 4) {
          setShowVerification(Math.random() > 0.5);
          setShowPremium(Math.random() > 0.7);
        }
        
        if (next === 6) {
          const rand = Math.random();
          setConfidence(rand > 0.3 ? "high" : rand > 0.1 ? "medium" : "low");
        }
        
        if (next === 0) {
          setShowVerification(false);
          setShowPremium(false);
        }
        
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % trustMessages.length);
    }, 4000);
    return () => clearInterval(messageInterval);
  }, []);

  // Auto-scroll to active step
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const stepWidth = 180; // Approximate width of each step + connector
      const scrollPosition = Math.max(0, (activeStep * stepWidth) - (container.clientWidth / 2) + stepWidth);
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  }, [activeStep]);

  const getStepState = (index: number) => {
    const isActive = activeStep === index;
    const isCompleted = activeStep > index;
    
    // Handle conditional steps
    if (index === 4 && !showVerification) return { isActive: false, isCompleted: false, isVisible: true, opacity: 0.3 };
    if (index === 5 && !showPremium) return { isActive: false, isCompleted: false, isVisible: true, opacity: 0.3 };
    
    return { isActive, isCompleted, isVisible: true, opacity: 1 };
  };

  const getConfidenceColor = () => {
    switch (confidence) {
      case "high": return "from-emerald-500/20 to-emerald-500/5 border-emerald-500/40";
      case "medium": return "from-amber-500/20 to-amber-500/5 border-amber-500/40";
      case "low": return "from-red-500/20 to-red-500/5 border-red-500/40";
    }
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-card/20 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">How It Works</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Intelligent Routing, </span>
            <span className="text-primary">Transparent Results</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proxinex is an AI Intelligence Control Plane—not a single model. It automatically selects the best intelligence for each query.
          </p>
        </div>

        {/* Horizontal Flow Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Scroll indicators */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* Scrollable Flow */}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div className="flex items-center gap-2 md:gap-4 min-w-max px-4 md:px-8 py-8">
              {steps.map((step, index) => {
                const state = getStepState(index);
                const isLastStep = index === steps.length - 1;
                
                return (
                  <div key={index} className="flex items-center">
                    {/* Step Card */}
                    <div 
                      className={`
                        relative flex flex-col items-center p-4 md:p-6 rounded-2xl transition-all duration-500 min-w-[140px] md:min-w-[160px]
                        ${step.conditional ? 'border-2 border-dashed' : 'border-2'}
                        ${state.isActive 
                          ? 'border-primary bg-gradient-to-b from-primary/20 to-primary/5 shadow-xl shadow-primary/20 scale-105' 
                          : state.isCompleted 
                            ? 'border-primary/40 bg-gradient-to-b from-primary/10 to-transparent' 
                            : 'border-border/50 bg-card/30'
                        }
                        ${step.premium ? 'bg-gradient-to-b from-amber-500/10 to-card/30' : ''}
                        ${step.isAnswer && activeStep >= 6 ? `bg-gradient-to-b ${getConfidenceColor()}` : ''}
                      `}
                      style={{ opacity: state.opacity }}
                    >
                      {/* Animated ring for active step */}
                      {state.isActive && (
                        <div className="absolute inset-0 rounded-2xl animate-pulse">
                          <div className="absolute inset-0 rounded-2xl border-2 border-primary/50" />
                        </div>
                      )}
                      
                      {/* Icon */}
                      <div className={`
                        p-3 md:p-4 rounded-xl mb-3 transition-all duration-500
                        ${state.isActive 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110' 
                          : state.isCompleted 
                            ? 'bg-primary/30 text-primary' 
                            : 'bg-secondary text-muted-foreground'
                        }
                      `}>
                        {step.icon}
                      </div>
                      
                      {/* Label */}
                      <span className={`
                        text-sm md:text-base font-semibold text-center transition-colors duration-300
                        ${state.isActive || state.isCompleted ? 'text-foreground' : 'text-muted-foreground'}
                      `}>
                        {step.label}
                      </span>
                      
                      {/* Sublabel */}
                      <span className="text-[11px] md:text-xs text-muted-foreground text-center mt-1">
                        {step.sublabel}
                      </span>

                      {/* Confidence Badge for Answer */}
                      {step.isAnswer && activeStep >= 6 && (
                        <div className={`
                          mt-3 px-3 py-1 rounded-full text-xs font-medium
                          ${confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                          ${confidence === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''}
                          ${confidence === 'low' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
                        `}>
                          {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
                        </div>
                      )}
                    </div>

                    {/* Connector */}
                    {!isLastStep && (
                      <div className="flex items-center w-8 md:w-16 mx-1">
                        <div className="relative w-full h-1 rounded-full bg-border/30 overflow-hidden">
                          {/* Progress fill */}
                          <div 
                            className={`
                              absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-full
                              transition-all duration-700 ease-out
                            `}
                            style={{ 
                              width: state.isCompleted ? '100%' : state.isActive ? '50%' : '0%' 
                            }}
                          />
                          {/* Animated particle */}
                          {state.isActive && (
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"
                              style={{
                                animation: 'flowParticle 1.5s ease-in-out infinite'
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${activeStep === index 
                    ? 'w-6 bg-primary' 
                    : activeStep > index 
                      ? 'w-1.5 bg-primary/50' 
                      : 'w-1.5 bg-border'
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* Trust Message */}
        <div className="mt-10 text-center">
          <p 
            key={messageIndex}
            className="text-lg md:text-xl text-muted-foreground italic animate-fade-in"
          >
            "{trustMessages[messageIndex]}"
          </p>
        </div>

        {/* Tagline */}
        <div className="mt-12 text-center">
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            Proxinex
          </p>
          <p className="text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent font-medium">
            Control Intelligence.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes flowParticle {
          0% { 
            left: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            left: 100%;
            opacity: 0;
          }
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.2);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.4);
        }
      `}</style>
    </section>
  );
};
