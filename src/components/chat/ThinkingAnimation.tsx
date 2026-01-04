import { useState, useEffect } from "react";
import { 
  Brain, 
  Search, 
  Globe, 
  FileText, 
  CheckCircle, 
  Sparkles,
  Loader2,
  BookOpen,
  Target,
  Lightbulb,
  Shield,
  Database,
  Network,
  Layers,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProxinexIcon } from "@/components/Logo";

interface ThinkingStep {
  id: string;
  icon: React.ElementType;
  label: string;
  subLabel?: string;
  status: "pending" | "active" | "complete";
}

interface ThinkingAnimationProps {
  isResearchMode?: boolean;
  sources?: string[];
  className?: string;
}

const researchSteps: Omit<ThinkingStep, "status">[] = [
  { id: "understand", icon: Brain, label: "Understanding query", subLabel: "Analyzing intent..." },
  { id: "search", icon: Search, label: "Searching sources", subLabel: "Querying knowledge bases..." },
  { id: "gather", icon: Globe, label: "Gathering information", subLabel: "Collecting data from sources..." },
  { id: "verify", icon: FileText, label: "Verifying facts", subLabel: "Cross-referencing sources..." },
  { id: "synthesize", icon: Target, label: "Synthesizing answer", subLabel: "Building comprehensive response..." },
  { id: "cite", icon: BookOpen, label: "Adding citations", subLabel: "Linking to verified sources..." },
];

const chatSteps: Omit<ThinkingStep, "status">[] = [
  { id: "understand", icon: Brain, label: "Understanding request", subLabel: "Parsing context..." },
  { id: "reason", icon: Lightbulb, label: "Reasoning through problem", subLabel: "Analyzing approach..." },
  { id: "generate", icon: Sparkles, label: "Generating response", subLabel: "Crafting answer..." },
];

export const ThinkingAnimation = ({ 
  isResearchMode = false, 
  sources = [],
  className 
}: ThinkingAnimationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ThinkingStep[]>([]);
  const [foundSources, setFoundSources] = useState<string[]>([]);

  const baseSteps = isResearchMode ? researchSteps : chatSteps;

  // Initialize steps with pending status
  useEffect(() => {
    setSteps(baseSteps.map((step, index) => ({
      ...step,
      status: index === 0 ? "active" : "pending"
    })));
    setCurrentStep(0);
    setFoundSources([]);
  }, [isResearchMode]);

  // Progress through steps
  useEffect(() => {
    if (steps.length === 0) return;

    const stepDuration = isResearchMode ? 1200 : 800;
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          // Loop back or stay at last step
          return steps.length - 1;
        }
        return next;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [steps.length, isResearchMode]);

  // Update step statuses based on current step
  useEffect(() => {
    if (steps.length === 0) return;

    setSteps(prev => prev.map((step, index) => ({
      ...step,
      status: index < currentStep ? "complete" : index === currentStep ? "active" : "pending"
    })));
  }, [currentStep]);

  // Animate found sources
  useEffect(() => {
    if (sources.length > 0 && foundSources.length < sources.length) {
      const timer = setTimeout(() => {
        setFoundSources(prev => [...prev, sources[prev.length]]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [sources, foundSources.length]);

  return (
    <div className={cn("py-4", className)}>
      <div className="bg-card/50 border border-border rounded-xl p-4">
        {/* Header with Animated Proxinex Logo */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 flex items-center justify-center">
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/40 blur-xl animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-cyan-500/40 to-primary/30 blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} />
              {/* Logo with spin animation */}
              <ProxinexIcon 
                className="w-10 h-10 relative z-10 text-primary drop-shadow-[0_0_15px_hsl(var(--primary)/0.6)] animate-spin"
              />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-foreground block">
              {isResearchMode ? "Deep Research Mode" : "Thinking..."}
            </span>
            <span className="text-xs text-muted-foreground">
              {isResearchMode ? "Extended analysis with verified sources" : "Processing your request"}
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.status === "active";
            const isComplete = step.status === "complete";
            const isPending = step.status === "pending";

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-all duration-300",
                  isActive && "bg-primary/10",
                  isComplete && "opacity-70",
                  isPending && "opacity-40"
                )}
              >
                {/* Step Icon */}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                  isComplete && "bg-green-500/20",
                  isActive && "bg-primary/20",
                  isPending && "bg-muted"
                )}>
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "text-sm font-medium transition-colors",
                    isActive && "text-primary",
                    isComplete && "text-foreground",
                    isPending && "text-muted-foreground"
                  )}>
                    {step.label}
                  </div>
                  {isActive && step.subLabel && (
                    <div className="text-xs text-muted-foreground animate-pulse">
                      {step.subLabel}
                    </div>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "absolute left-6 mt-10 w-px h-4 transition-all",
                    isComplete ? "bg-green-500/50" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Found Sources (Research Mode Only) */}
        {isResearchMode && foundSources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Sources found ({foundSources.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {foundSources.map((source, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-secondary rounded-full text-foreground/80 animate-fade-in"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
