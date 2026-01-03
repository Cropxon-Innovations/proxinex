import { useEffect, useState } from "react";
import { ProxinexIcon } from "./Logo";

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"entering" | "active" | "exiting">("entering");

  useEffect(() => {
    // Start active phase after entering animation
    const enterTimer = setTimeout(() => setPhase("active"), 500);
    // Start exit phase
    const activeTimer = setTimeout(() => setPhase("exiting"), 2000);
    // Complete and unmount
    const exitTimer = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(activeTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-500 ${
        phase === "exiting" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      
      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-32 h-32 rounded-full border border-primary/20 animate-[ping_2s_ease-in-out_infinite]" />
        <div className="absolute w-48 h-48 rounded-full border border-primary/10 animate-[ping_2s_ease-in-out_infinite_0.3s]" />
        <div className="absolute w-64 h-64 rounded-full border border-primary/5 animate-[ping_2s_ease-in-out_infinite_0.6s]" />
      </div>

      {/* Logo container */}
      <div 
        className={`relative flex flex-col items-center gap-6 transition-all duration-700 ${
          phase === "entering" 
            ? "opacity-0 scale-75" 
            : phase === "active"
            ? "opacity-100 scale-100"
            : "opacity-0 scale-110"
        }`}
      >
        {/* Animated logo */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-2xl bg-primary/30 animate-pulse" />
          
          {/* Main logo */}
          <div className="relative animate-splash-logo">
            <ProxinexIcon className="h-24 w-24 text-primary drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)]" />
          </div>

          {/* Orbiting particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
            <div className="absolute -top-2 left-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }}>
            <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 rounded-full bg-primary/70 shadow-[0_0_8px_hsl(var(--primary))]" />
          </div>
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold text-foreground tracking-wider animate-splash-text">
            PROXINEX
          </h1>
          <p className="text-sm text-muted-foreground animate-splash-text-delay">
            AI Intelligence Control Plane
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-1 mt-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      {/* Company branding */}
      <div className={`absolute bottom-8 text-center transition-opacity duration-500 ${
        phase === "active" ? "opacity-100" : "opacity-0"
      }`}>
        <p className="text-xs text-muted-foreground">
          A Product by{" "}
          <span className="text-foreground font-medium">CROPXON INNOVATIONS PVT LTD</span>
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">Beta v0.1.0</p>
      </div>

      <style>{`
        @keyframes splash-logo {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes splash-text {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-splash-logo {
          animation: splash-logo 0.8s ease-out forwards;
        }
        .animate-splash-text {
          animation: splash-text 0.5s ease-out 0.3s forwards;
          opacity: 0;
        }
        .animate-splash-text-delay {
          animation: splash-text 0.5s ease-out 0.5s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};
