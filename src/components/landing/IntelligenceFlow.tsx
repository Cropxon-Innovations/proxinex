import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Brain, 
  GitBranch, 
  Cpu, 
  ShieldCheck, 
  Lock, 
  CheckCircle2 
} from "lucide-react";

interface FlowNodeProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
  completed: boolean;
  conditional?: boolean;
  premium?: boolean;
  isAnswer?: boolean;
  confidence?: "high" | "medium" | "low";
}

const FlowNode = ({ 
  icon, 
  label, 
  sublabel, 
  active, 
  completed, 
  conditional, 
  premium,
  isAnswer,
  confidence 
}: FlowNodeProps) => {
  const getConfidenceColor = () => {
    if (!isAnswer) return "";
    switch (confidence) {
      case "high": return "ring-2 ring-emerald-500/50";
      case "medium": return "ring-2 ring-amber-500/50";
      case "low": return "ring-2 ring-red-500/50";
      default: return "";
    }
  };

  return (
    <div 
      className={`
        relative flex flex-col items-center p-4 rounded-xl transition-all duration-500
        ${conditional ? 'border-dashed border-2' : 'border'}
        ${active ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border bg-card/50'}
        ${completed && !active ? 'border-primary/30 bg-primary/5' : ''}
        ${premium ? 'bg-gradient-to-br from-amber-500/10 to-card' : ''}
        ${isAnswer && confidence === 'high' ? 'bg-gradient-to-br from-emerald-500/10 to-card' : ''}
        ${getConfidenceColor()}
        min-w-[120px] md:min-w-[140px]
      `}
    >
      <div className={`
        p-3 rounded-lg mb-2 transition-all duration-500
        ${active ? 'bg-primary text-primary-foreground scale-110' : 'bg-secondary text-muted-foreground'}
        ${completed && !active ? 'bg-primary/20 text-primary' : ''}
      `}>
        {icon}
      </div>
      <span className={`
        text-xs md:text-sm font-medium text-center transition-colors duration-300
        ${active ? 'text-foreground' : 'text-muted-foreground'}
      `}>
        {label}
      </span>
      <span className="text-[10px] md:text-xs text-muted-foreground text-center mt-1">
        {sublabel}
      </span>
      {isAnswer && confidence && (
        <div className={`
          mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium
          ${confidence === 'high' ? 'bg-emerald-500/20 text-emerald-400' : ''}
          ${confidence === 'medium' ? 'bg-amber-500/20 text-amber-400' : ''}
          ${confidence === 'low' ? 'bg-red-500/20 text-red-400' : ''}
        `}>
          {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
        </div>
      )}
    </div>
  );
};

const FlowConnector = ({ active, completed, dashed }: { active: boolean; completed: boolean; dashed?: boolean }) => (
  <div className="flex items-center justify-center w-8 md:w-12 flex-shrink-0">
    <div className={`
      h-0.5 w-full relative overflow-hidden
      ${dashed ? 'border-t-2 border-dashed border-border' : 'bg-border'}
    `}>
      {(active || completed) && !dashed && (
        <div 
          className={`
            absolute inset-y-0 left-0 bg-primary transition-all duration-1000 ease-out
            ${completed ? 'w-full' : 'w-0'}
          `}
        />
      )}
      {active && (
        <div className="absolute inset-0 flex items-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" 
            style={{ 
              animation: 'flowParticle 2s ease-in-out infinite',
              marginLeft: `${Math.random() * 50}%`
            }} 
          />
        </div>
      )}
    </div>
  </div>
);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => {
        const next = (prev + 1) % 8;
        
        // Randomly show verification steps
        if (next === 4) {
          setShowVerification(Math.random() > 0.5);
          setShowPremium(Math.random() > 0.7);
        }
        
        // Set confidence level at end
        if (next === 6) {
          const rand = Math.random();
          setConfidence(rand > 0.3 ? "high" : rand > 0.1 ? "medium" : "low");
        }
        
        // Reset
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

  const steps = [
    { icon: <MessageSquare className="h-5 w-5" />, label: "Your Prompt", sublabel: "Any question" },
    { icon: <Brain className="h-5 w-5" />, label: "Intent Detection", sublabel: "Understanding your need" },
    { icon: <GitBranch className="h-5 w-5" />, label: "Smart Router", sublabel: "Selecting optimal path" },
    { icon: <Cpu className="h-5 w-5" />, label: "Open Models", sublabel: "Primary intelligence" },
    { icon: <ShieldCheck className="h-5 w-5" />, label: "Verification", sublabel: "Only if required", conditional: true },
    { icon: <Lock className="h-5 w-5" />, label: "Premium Check", sublabel: "High-impact only", premium: true },
    { icon: <CheckCircle2 className="h-5 w-5" />, label: "Answer", sublabel: "Verified result", isAnswer: true }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background via-card/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Intelligent Routing. Transparent Results.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proxinex automatically selects the best intelligence for every query.
          </p>
        </div>

        {/* Flow Visualization */}
        <div className="relative max-w-6xl mx-auto">
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-3xl" />
          
          {/* Flow Container */}
          <div className="relative p-6 md:p-8 rounded-2xl border border-border bg-card/30 backdrop-blur-sm overflow-x-auto">
            <div className="flex items-center justify-start md:justify-center gap-1 min-w-max md:min-w-0">
              {/* Step 1: Your Prompt */}
              <FlowNode 
                {...steps[0]} 
                active={activeStep === 0} 
                completed={activeStep > 0}
              />
              <FlowConnector active={activeStep === 0} completed={activeStep > 0} />
              
              {/* Step 2: Intent Detection */}
              <FlowNode 
                {...steps[1]} 
                active={activeStep === 1} 
                completed={activeStep > 1}
              />
              <FlowConnector active={activeStep === 1} completed={activeStep > 1} />
              
              {/* Step 3: Smart Router */}
              <FlowNode 
                {...steps[2]} 
                active={activeStep === 2} 
                completed={activeStep > 2}
              />
              <FlowConnector active={activeStep === 2} completed={activeStep > 2} />
              
              {/* Step 4: Open Models */}
              <FlowNode 
                {...steps[3]} 
                active={activeStep === 3} 
                completed={activeStep > 3}
              />
              
              {/* Conditional Verification Steps */}
              {(showVerification || activeStep >= 4) && (
                <>
                  <FlowConnector 
                    active={activeStep === 3} 
                    completed={activeStep > 4} 
                    dashed={!showVerification}
                  />
                  <div className={`transition-opacity duration-500 ${showVerification ? 'opacity-100' : 'opacity-30'}`}>
                    <FlowNode 
                      {...steps[4]} 
                      active={activeStep === 4 && showVerification} 
                      completed={activeStep > 4 && showVerification}
                    />
                  </div>
                </>
              )}
              
              {/* Premium Verification */}
              {(showPremium || activeStep >= 5) && (
                <>
                  <FlowConnector 
                    active={activeStep === 4} 
                    completed={activeStep > 5} 
                    dashed={!showPremium}
                  />
                  <div className={`transition-opacity duration-500 ${showPremium ? 'opacity-100' : 'opacity-30'}`}>
                    <FlowNode 
                      {...steps[5]} 
                      active={activeStep === 5 && showPremium} 
                      completed={activeStep > 5 && showPremium}
                    />
                  </div>
                </>
              )}
              
              {/* Final Answer */}
              <FlowConnector 
                active={activeStep === 5 || activeStep === 6} 
                completed={activeStep >= 6}
              />
              <FlowNode 
                {...steps[6]} 
                active={activeStep >= 6} 
                completed={activeStep >= 7}
                confidence={activeStep >= 6 ? confidence : undefined}
              />
            </div>
          </div>

          {/* Trust Message */}
          <div className="mt-8 text-center">
            <p 
              key={messageIndex}
              className="text-lg text-muted-foreground italic animate-fade-in"
            >
              "{trustMessages[messageIndex]}"
            </p>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-16 text-center">
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            Proxinex
          </p>
          <p className="text-lg text-gradient">
            Control Intelligence.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes flowParticle {
          0%, 100% { 
            transform: translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateX(100px) scale(0.5);
            opacity: 0;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};
