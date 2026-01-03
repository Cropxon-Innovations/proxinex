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
  Sparkles,
  BookOpen,
  Network,
  Zap,
  Layers
} from "lucide-react";
import proxinexLogo from "@/assets/proxinex-logo.png";

interface SourceVerificationLoaderProps {
  sources?: string[];
  isComplete?: boolean;
  isDeepResearch?: boolean;
}

const basicSteps = [
  { icon: Search, label: "Searching web sources", color: "text-blue-500" },
  { icon: Database, label: "Querying knowledge bases", color: "text-purple-500" },
  { icon: FileSearch, label: "Analyzing documents", color: "text-amber-500" },
  { icon: Shield, label: "Verifying credibility", color: "text-emerald-500" },
  { icon: Brain, label: "Cross-referencing facts", color: "text-pink-500" },
  { icon: Sparkles, label: "Synthesizing answer", color: "text-primary" },
];

const deepResearchSteps = [
  { icon: Search, label: "Searching web sources", color: "text-blue-500" },
  { icon: Database, label: "Querying knowledge bases", color: "text-purple-500" },
  { icon: Network, label: "Connecting data sources", color: "text-cyan-500" },
  { icon: FileSearch, label: "Analyzing documents", color: "text-amber-500" },
  { icon: BookOpen, label: "Reading academic papers", color: "text-indigo-500" },
  { icon: Shield, label: "Verifying credibility", color: "text-emerald-500" },
  { icon: Brain, label: "Cross-referencing facts", color: "text-pink-500" },
  { icon: Layers, label: "Deep analysis", color: "text-orange-500" },
  { icon: Zap, label: "Generating insights", color: "text-yellow-500" },
  { icon: Sparkles, label: "Synthesizing answer", color: "text-primary" },
];

export const SourceVerificationLoader = ({ 
  sources = [], 
  isComplete = false,
  isDeepResearch = true
}: SourceVerificationLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [foundSources, setFoundSources] = useState<string[]>([]);
  const [logoRotation, setLogoRotation] = useState(0);

  const verificationSteps = isDeepResearch ? deepResearchSteps : basicSteps;

  useEffect(() => {
    if (isComplete) {
      setCompletedSteps(verificationSteps.map((_, i) => i));
      return;
    }

    // Logo rotation animation
    const rotationInterval = setInterval(() => {
      setLogoRotation(prev => prev + 1);
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < verificationSteps.length) {
          setCompletedSteps((c) => [...c, prev]);
          return next;
        }
        return prev;
      });
    }, isDeepResearch ? 500 : 700);

    return () => {
      clearInterval(stepInterval);
      clearInterval(rotationInterval);
    };
  }, [isComplete, verificationSteps.length, isDeepResearch]);

  useEffect(() => {
    if (sources.length > 0 && foundSources.length < sources.length) {
      const interval = setInterval(() => {
        setFoundSources((prev) => {
          if (prev.length < sources.length) {
            return [...prev, sources[prev.length]];
          }
          return prev;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [sources, foundSources.length]);

  const progressPercent = Math.round(((completedSteps.length + (currentStep < verificationSteps.length ? 0.5 : 0)) / verificationSteps.length) * 100);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      {/* Header with Animated Proxinex Logo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {/* Animated Logo Container */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-cyan-500/30 to-primary/30 blur-lg animate-pulse"
            />
            <img 
              src={proxinexLogo} 
              alt="Proxinex" 
              className="w-12 h-12 object-contain relative z-10"
              style={{ 
                transform: isComplete ? 'rotate(0deg)' : `rotate(${logoRotation}deg)`,
                transition: isComplete ? 'transform 0.5s ease-out' : 'none'
              }}
            />
          </div>
          {/* Status indicator */}
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${isComplete ? 'bg-emerald-500' : 'bg-primary'}`}>
            {isComplete ? (
              <CheckCircle2 className="h-2.5 w-2.5 text-white" />
            ) : (
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            )}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
            {isDeepResearch ? 'Deep Research Mode' : 'Verifying Sources'}
            {isDeepResearch && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Extended Analysis
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isComplete 
              ? 'Research complete! Sources verified.' 
              : isDeepResearch 
                ? 'Performing deep analysis with extended verification...'
                : 'Finding and validating information...'}
          </p>
        </div>
      </div>

      {/* Verification Steps Grid */}
      <div className={`grid gap-2 ${isDeepResearch ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-3'}`}>
        {verificationSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === index;
          const isCompleted = completedSteps.includes(index);

          return (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 ${
                isCompleted
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : isActive
                  ? "bg-primary/10 text-primary border border-primary/20 animate-pulse"
                  : "bg-muted/30 text-muted-foreground border border-transparent"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
              ) : (
                <Icon className={`h-4 w-4 flex-shrink-0 ${step.color}`} />
              )}
              <span className="truncate text-xs font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Found Sources Animation */}
      {foundSources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Sources found: {foundSources.length}
            </p>
            {isDeepResearch && (
              <span className="text-[10px] text-primary">Deep verification active</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {foundSources.map((source, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs animate-fade-in border border-primary/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span className="max-w-[120px] truncate font-medium">{source}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-emerald-500 to-primary rounded-full transition-all duration-500 relative overflow-hidden"
            style={{
              width: `${((completedSteps.length + 1) / verificationSteps.length) * 100}%`,
            }}
          >
            {/* Shimmer effect */}
            {!isComplete && (
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
