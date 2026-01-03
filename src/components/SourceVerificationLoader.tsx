import { useState, useEffect } from "react";
import { 
  Globe, 
  Search, 
  CheckCircle2, 
  Loader2, 
  Shield, 
  Database,
  FileSearch,
  Brain,
  Sparkles
} from "lucide-react";

interface SourceVerificationLoaderProps {
  sources?: string[];
  isComplete?: boolean;
}

const verificationSteps = [
  { icon: Search, label: "Searching web sources", color: "text-blue-500" },
  { icon: Database, label: "Querying knowledge bases", color: "text-purple-500" },
  { icon: FileSearch, label: "Analyzing documents", color: "text-amber-500" },
  { icon: Shield, label: "Verifying credibility", color: "text-emerald-500" },
  { icon: Brain, label: "Cross-referencing facts", color: "text-pink-500" },
  { icon: Sparkles, label: "Synthesizing answer", color: "text-primary" },
];

export const SourceVerificationLoader = ({ 
  sources = [], 
  isComplete = false 
}: SourceVerificationLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [foundSources, setFoundSources] = useState<string[]>([]);

  useEffect(() => {
    if (isComplete) {
      setCompletedSteps([0, 1, 2, 3, 4, 5]);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < verificationSteps.length) {
          setCompletedSteps((c) => [...c, prev]);
          return next;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isComplete]);

  useEffect(() => {
    if (sources.length > 0 && foundSources.length < sources.length) {
      const interval = setInterval(() => {
        setFoundSources((prev) => {
          if (prev.length < sources.length) {
            return [...prev, sources[prev.length]];
          }
          return prev;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [sources, foundSources.length]);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Globe className="h-6 w-6 text-primary animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Verifying Sources</h3>
          <p className="text-xs text-muted-foreground">Finding and validating information...</p>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {verificationSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === index;
          const isCompleted = completedSteps.includes(index);

          return (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                isCompleted
                  ? "bg-emerald-500/10 text-emerald-500"
                  : isActive
                  ? "bg-primary/10 text-primary animate-pulse"
                  : "bg-muted/30 text-muted-foreground"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
              ) : (
                <Icon className={`h-4 w-4 flex-shrink-0 ${step.color}`} />
              )}
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Found Sources Animation */}
      {foundSources.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Sources found: {foundSources.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {foundSources.map((source, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span className="max-w-[150px] truncate">{source}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary via-emerald-500 to-primary rounded-full transition-all duration-500"
          style={{
            width: `${((completedSteps.length + 1) / verificationSteps.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};
