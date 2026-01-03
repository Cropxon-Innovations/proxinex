import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Brain, 
  Zap, 
  Shield, 
  CheckCircle, 
  Sparkles,
  Cpu,
  Quote
} from "lucide-react";

interface Stage {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  isActive: boolean;
  isComplete: boolean;
}

const sampleQueries = [
  {
    query: "What is the capital of France?",
    intent: "Knowledge Query",
    model: "Gemini Pro",
    verified: false,
    confidence: 92,
    response: "Paris is the capital and largest city of France, located in the north-central part of the country."
  },
  {
    query: "Explain quantum computing in simple terms",
    intent: "Educational Query",
    model: "GPT-4",
    verified: false,
    confidence: 89,
    response: "Quantum computing uses quantum bits (qubits) that can be 0 and 1 simultaneously, enabling parallel processing for complex calculations."
  },
  {
    query: "What are the latest AI regulations in EU?",
    intent: "Compliance Query",
    model: "Claude 3",
    verified: true,
    confidence: 96,
    response: "The EU AI Act (2024) classifies AI systems by risk level, with strict requirements for high-risk applications and bans on certain uses."
  },
  {
    query: "How do I optimize React performance?",
    intent: "Technical Query",
    model: "GPT-4",
    verified: false,
    confidence: 91,
    response: "Use React.memo, useMemo, useCallback hooks, code splitting with lazy loading, and avoid unnecessary re-renders."
  },
  {
    query: "What's the current stock price of Apple?",
    intent: "Real-time Data",
    model: "Gemini Pro",
    verified: true,
    confidence: 98,
    response: "AAPL is currently trading at $198.50 (+1.2%), with market cap of $3.1T. Data verified via live market feeds."
  },
  {
    query: "Summarize the key points of climate change",
    intent: "Knowledge Query",
    model: "Claude 3",
    verified: false,
    confidence: 88,
    response: "Climate change involves rising global temperatures, melting ice caps, extreme weather, and ecosystem disruption from greenhouse gases."
  },
  {
    query: "What's the legal drinking age in Japan?",
    intent: "Factual Query",
    model: "Gemini Pro",
    verified: true,
    confidence: 97,
    response: "The legal drinking age in Japan is 20 years old, as established by the Minor Drinking Prohibition Act."
  },
  {
    query: "How does blockchain technology work?",
    intent: "Technical Query",
    model: "GPT-4",
    verified: false,
    confidence: 90,
    response: "Blockchain is a decentralized ledger where transactions are recorded in blocks, cryptographically linked in an immutable chain."
  },
];

export const InteractiveRoutingDemo = () => {
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout[]>([]);

  const currentQuery = sampleQueries[currentQueryIndex];

  const clearTimeouts = useCallback(() => {
    timeoutRef.current.forEach(t => clearTimeout(t));
    timeoutRef.current = [];
  }, []);

  const runAnimation = useCallback(() => {
    clearTimeouts();
    setIsAnimating(true);
    setShowResult(false);
    setCurrentStageIndex(-1);

    // Stage 0: Intent Detection
    timeoutRef.current.push(setTimeout(() => setCurrentStageIndex(0), 300));
    
    // Stage 1: Model Routing
    timeoutRef.current.push(setTimeout(() => setCurrentStageIndex(1), 1200));
    
    // Stage 2: Processing
    timeoutRef.current.push(setTimeout(() => setCurrentStageIndex(2), 2100));
    
    // Stage 3: Verification (if needed)
    const needsVerification = currentQuery.verified;
    if (needsVerification) {
      timeoutRef.current.push(setTimeout(() => setCurrentStageIndex(3), 3000));
      timeoutRef.current.push(setTimeout(() => setCurrentStageIndex(4), 3800));
    } else {
      timeoutRef.current.push(setTimeout(() => setCurrentStageIndex(4), 3000));
    }
    
    // Show result
    timeoutRef.current.push(setTimeout(() => {
      setShowResult(true);
      setIsAnimating(false);
    }, needsVerification ? 4200 : 3400));

    // Move to next query
    timeoutRef.current.push(setTimeout(() => {
      setCurrentQueryIndex(prev => (prev + 1) % sampleQueries.length);
    }, needsVerification ? 7500 : 6700));
  }, [currentQuery.verified, clearTimeouts]);

  useEffect(() => {
    runAnimation();
    return () => clearTimeouts();
  }, [currentQueryIndex, runAnimation, clearTimeouts]);

  const stages: Stage[] = [
    {
      id: "intent",
      label: "Intent",
      icon: <Brain className="w-4 h-4" />,
      description: currentQuery.intent,
      isActive: currentStageIndex === 0,
      isComplete: currentStageIndex > 0,
    },
    {
      id: "routing",
      label: "Routing",
      icon: <Zap className="w-4 h-4" />,
      description: currentQuery.model,
      isActive: currentStageIndex === 1,
      isComplete: currentStageIndex > 1,
    },
    {
      id: "processing",
      label: "Process",
      icon: <Cpu className="w-4 h-4" />,
      description: "Generating...",
      isActive: currentStageIndex === 2,
      isComplete: currentStageIndex > 2,
    },
    {
      id: "verification",
      label: "Verify",
      icon: <Shield className="w-4 h-4" />,
      description: "Sources checked",
      isActive: currentStageIndex === 3,
      isComplete: currentStageIndex > 3 && currentQuery.verified,
    },
    {
      id: "result",
      label: "Answer",
      icon: <CheckCircle className="w-4 h-4" />,
      description: `${currentQuery.confidence}%`,
      isActive: currentStageIndex === 4,
      isComplete: showResult,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative bg-card/60 backdrop-blur-xl rounded-xl border border-border/50 shadow-xl overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        {/* Header */}
        <div className="relative border-b border-border/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs font-medium text-muted-foreground hidden sm:block">Intelligence Router</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-primary font-medium">Live</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-4 md:p-6">
          {/* Query Display */}
          <div className="mb-5">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
              <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm md:text-base text-foreground font-medium leading-relaxed">
                {currentQuery.query}
              </p>
            </div>
          </div>

          {/* Compact Stages Flow */}
          <div className="relative mb-5">
            {/* Connection Line */}
            <div className="absolute top-5 left-0 right-0 h-px bg-border/40 hidden sm:block" />
            
            {/* Progress Line */}
            <div 
              className="absolute top-5 left-0 h-px bg-gradient-to-r from-primary to-accent hidden sm:block transition-all duration-500 ease-out"
              style={{ 
                width: `${Math.max(0, Math.min(100, (currentStageIndex + 1) * 20))}%`,
              }}
            />

            {/* Stages Grid */}
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {stages.map((stage, index) => {
                const isSkipped = stage.id === "verification" && !currentQuery.verified && currentStageIndex >= 3;
                
                return (
                  <div
                    key={stage.id}
                    className={`relative flex flex-col items-center text-center transition-all duration-300 ${
                      isSkipped ? "opacity-30" : ""
                    }`}
                  >
                    {/* Icon Circle */}
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1.5 transition-all duration-300 relative z-10 ${
                        stage.isActive
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-card"
                          : stage.isComplete
                          ? "bg-green-500 text-white"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {stage.isComplete ? <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : stage.icon}
                      {stage.isActive && (
                        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                      )}
                    </div>

                    {/* Label */}
                    <span className={`text-[10px] sm:text-xs font-medium transition-colors ${
                      stage.isActive || stage.isComplete ? "text-foreground" : "text-muted-foreground/60"
                    }`}>
                      {stage.label}
                    </span>

                    {/* Description - only on larger screens */}
                    {(stage.isActive || stage.isComplete) && !isSkipped && (
                      <span className="hidden sm:block text-[10px] text-primary mt-0.5 animate-fade-in">
                        {stage.description}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result Display */}
          <div className={`transition-all duration-500 ${showResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            {showResult && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-foreground">{currentQuery.model}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary">
                        {currentQuery.intent}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-500">
                        {currentQuery.confidence}% Confident
                      </span>
                      {currentQuery.verified && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentQuery.response}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Query Indicator Dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {sampleQueries.map((_, i) => (
              <button
                key={i}
                onClick={() => !isAnimating && setCurrentQueryIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentQueryIndex 
                    ? "bg-primary w-4" 
                    : "bg-border hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
