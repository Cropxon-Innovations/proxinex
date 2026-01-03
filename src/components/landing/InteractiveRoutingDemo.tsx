import { useState, useEffect, useCallback } from "react";
import { 
  Send, 
  Brain, 
  Zap, 
  Shield, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  MessageSquare,
  Cpu,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Stage {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  isActive: boolean;
  isComplete: boolean;
}

interface ModelOption {
  name: string;
  type: "open" | "premium";
  confidence: number;
  selected: boolean;
}

const sampleQueries = [
  "What is the capital of France?",
  "Explain quantum computing in simple terms",
  "What are the latest AI regulations in EU?",
  "How do I optimize React performance?",
  "What's the current stock price of Apple?",
];

const getIntentType = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("stock") || lowerQuery.includes("price") || lowerQuery.includes("latest") || lowerQuery.includes("current")) {
    return "Real-time Data";
  }
  if (lowerQuery.includes("explain") || lowerQuery.includes("how") || lowerQuery.includes("what is")) {
    return "Knowledge Query";
  }
  if (lowerQuery.includes("code") || lowerQuery.includes("programming") || lowerQuery.includes("react") || lowerQuery.includes("optimize")) {
    return "Technical Query";
  }
  if (lowerQuery.includes("regulation") || lowerQuery.includes("law") || lowerQuery.includes("legal")) {
    return "Compliance Query";
  }
  return "General Query";
};

const needsVerification = (query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  return lowerQuery.includes("stock") || 
         lowerQuery.includes("regulation") || 
         lowerQuery.includes("legal") || 
         lowerQuery.includes("latest") ||
         lowerQuery.includes("current");
};

export const InteractiveRoutingDemo = () => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [intentType, setIntentType] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [selectedModel, setSelectedModel] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [typingPlaceholder, setTypingPlaceholder] = useState(0);

  // Animated placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingPlaceholder(prev => (prev + 1) % sampleQueries.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const resetDemo = useCallback(() => {
    setCurrentStageIndex(-1);
    setIntentType("");
    setShowVerification(false);
    setConfidence(0);
    setSelectedModel("");
    setShowResult(false);
    setIsProcessing(false);
  }, []);

  const processQuery = useCallback(async () => {
    if (!query.trim()) return;
    
    resetDemo();
    setIsProcessing(true);
    
    // Stage 1: Intent Detection
    setCurrentStageIndex(0);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIntentType(getIntentType(query));
    
    // Stage 2: Model Routing
    setCurrentStageIndex(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const models = ["Gemini Pro", "GPT-4", "Claude 3", "Llama 3"];
    setSelectedModel(models[Math.floor(Math.random() * models.length)]);
    
    // Stage 3: Processing
    setCurrentStageIndex(2);
    await new Promise(resolve => setTimeout(resolve, 900));
    
    // Stage 4: Verification (conditional)
    const requiresVerification = needsVerification(query);
    setShowVerification(requiresVerification);
    
    if (requiresVerification) {
      setCurrentStageIndex(3);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Stage 5: Result
    setCurrentStageIndex(4);
    setConfidence(requiresVerification ? 94 + Math.floor(Math.random() * 5) : 85 + Math.floor(Math.random() * 10));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setShowResult(true);
    setIsProcessing(false);
  }, [query, resetDemo]);

  const stages: Stage[] = [
    {
      id: "intent",
      label: "Intent Detection",
      icon: <Brain className="w-5 h-5" />,
      description: intentType || "Analyzing query...",
      isActive: currentStageIndex === 0,
      isComplete: currentStageIndex > 0,
    },
    {
      id: "routing",
      label: "Smart Routing",
      icon: <Zap className="w-5 h-5" />,
      description: selectedModel ? `Selected: ${selectedModel}` : "Finding optimal model...",
      isActive: currentStageIndex === 1,
      isComplete: currentStageIndex > 1,
    },
    {
      id: "processing",
      label: "Processing",
      icon: <Cpu className="w-5 h-5" />,
      description: "Generating response...",
      isActive: currentStageIndex === 2,
      isComplete: currentStageIndex > 2,
    },
    {
      id: "verification",
      label: "Verification",
      icon: <Shield className="w-5 h-5" />,
      description: "Cross-referencing sources...",
      isActive: currentStageIndex === 3,
      isComplete: currentStageIndex > 3 && showVerification,
    },
    {
      id: "result",
      label: "Answer",
      icon: <CheckCircle className="w-5 h-5" />,
      description: confidence ? `${confidence}% Confidence` : "Delivering result...",
      isActive: currentStageIndex === 4,
      isComplete: showResult,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Demo Container */}
      <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        {/* Header */}
        <div className="relative border-b border-border/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Proxinex Intelligence Router</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary font-medium">Live Demo</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6 md:p-8">
          {/* Input Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-3">
              Try it yourself — ask any question
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && processQuery()}
                  placeholder={sampleQueries[typingPlaceholder]}
                  className="pl-12 pr-4 h-14 bg-background/50 border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground/50"
                  disabled={isProcessing}
                />
              </div>
              <Button 
                onClick={processQuery}
                disabled={isProcessing || !query.trim()}
                size="lg"
                className="h-14 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Route
                  </>
                )}
              </Button>
            </div>
            
            {/* Sample queries */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs text-muted-foreground">Try:</span>
              {sampleQueries.slice(0, 3).map((sample, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(sample)}
                  disabled={isProcessing}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {sample.length > 30 ? sample.slice(0, 30) + "..." : sample}
                </button>
              ))}
            </div>
          </div>

          {/* Routing Visualization */}
          <div className="relative">
            {/* Connection Lines */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/30 -translate-y-1/2 hidden md:block" />
            
            {/* Animated flow line */}
            {isProcessing && (
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary to-accent -translate-y-1/2 hidden md:block transition-all duration-500 ease-out"
                style={{ 
                  width: `${Math.min(100, (currentStageIndex + 1) * 25)}%`,
                }}
              />
            )}

            {/* Stages */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-2">
              {stages.map((stage, index) => {
                // Hide verification if not needed
                if (stage.id === "verification" && !showVerification && currentStageIndex >= 3) {
                  return (
                    <div key={stage.id} className="hidden md:flex items-center justify-center">
                      <div className="text-xs text-muted-foreground/50 italic">Skipped</div>
                    </div>
                  );
                }

                return (
                  <div
                    key={stage.id}
                    className={`relative flex flex-col items-center p-4 rounded-xl transition-all duration-500 ${
                      stage.isActive
                        ? "bg-primary/10 border-2 border-primary scale-105 shadow-lg shadow-primary/20"
                        : stage.isComplete
                        ? "bg-green-500/10 border border-green-500/30"
                        : "bg-secondary/30 border border-transparent"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                        stage.isActive
                          ? "bg-primary text-primary-foreground animate-pulse"
                          : stage.isComplete
                          ? "bg-green-500 text-white"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {stage.isComplete ? <CheckCircle className="w-5 h-5" /> : stage.icon}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-sm font-medium mb-1 transition-colors ${
                        stage.isActive || stage.isComplete ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stage.label}
                    </span>

                    {/* Description */}
                    <span
                      className={`text-xs text-center transition-colors ${
                        stage.isActive ? "text-primary" : stage.isComplete ? "text-green-500" : "text-muted-foreground/50"
                      }`}
                    >
                      {(stage.isActive || stage.isComplete) ? stage.description : "Waiting..."}
                    </span>

                    {/* Active indicator */}
                    {stage.isActive && (
                      <div className="absolute -inset-0.5 rounded-xl bg-primary/20 blur-sm -z-10 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result Display */}
          {showResult && (
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-foreground">Query Routed Successfully</h4>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                      {confidence}% Confidence
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Intent:</span>
                      <span className="ml-2 text-foreground font-medium">{intentType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Model:</span>
                      <span className="ml-2 text-foreground font-medium">{selectedModel}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Verified:</span>
                      <span className="ml-2 text-foreground font-medium">{showVerification ? "Yes" : "Not Required"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Initial State */}
          {currentStageIndex === -1 && !isProcessing && (
            <div className="mt-8 p-6 rounded-xl bg-secondary/30 border border-dashed border-border/50 text-center">
              <Sparkles className="w-8 h-8 text-primary/50 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Enter a query above to see how Proxinex intelligently routes your request
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
