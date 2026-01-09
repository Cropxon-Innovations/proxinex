import { useEffect, useState } from "react";
import { ProxinexIcon } from "@/components/Logo";

interface PageLoaderProps {
  onComplete?: () => void;
  minimal?: boolean;
}

export const PageLoader = ({ onComplete, minimal = false }: PageLoaderProps) => {
  const [phase, setPhase] = useState<"entering" | "active" | "exiting">("entering");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("active"), 300);
    const activeTimer = setTimeout(() => setPhase("exiting"), minimal ? 800 : 1500);
    const exitTimer = setTimeout(() => onComplete?.(), minimal ? 1000 : 1800);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(activeTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete, minimal]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center transition-opacity duration-300 ${
        phase === "exiting" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Main content */}
      <div className={`relative flex flex-col items-center gap-6 transition-all duration-500 ${
        phase === "entering" ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}>
        {/* Animated logo */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-2xl bg-primary/30 animate-pulse" />
          
          {/* Outer rotating ring */}
          <div className="absolute -inset-4 animate-spin" style={{ animationDuration: "4s" }}>
            <div className="w-full h-full rounded-full border border-primary/20" />
          </div>
          
          {/* Main logo */}
          <div className="relative animate-page-loader-logo">
            <ProxinexIcon className="h-20 w-20 text-primary drop-shadow-[0_0_25px_hsl(var(--primary)/0.5)]" />
          </div>

          {/* Orbiting particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
            <div className="absolute -top-2 left-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }}>
            <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 rounded-full bg-primary/70 shadow-[0_0_8px_hsl(var(--primary))]" />
          </div>
        </div>

        {/* Brand text */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-wider animate-page-loader-text">
            PROXINEX
          </h1>
          <p className="text-sm text-muted-foreground animate-page-loader-text-delay max-w-xs">
            AI Intelligence Control Plane
          </p>
          <p className="text-xs text-muted-foreground/80 animate-page-loader-text-delay-2">
            Intelligent Model Routing Platform
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-1.5 mt-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      {/* Company branding */}
      <div className={`absolute bottom-8 text-center transition-opacity duration-500 ${
        phase === "active" ? "opacity-100" : "opacity-0"
      }`}>
        <p className="text-xs text-muted-foreground mb-1">
          Powered By
        </p>
        <a 
          href="https://www.cropxon.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-foreground font-semibold hover:text-primary transition-colors"
        >
          CROPXON INNOVATIONS PVT. LTD.
        </a>
        <p className="text-[10px] text-muted-foreground/70 mt-2">
          Building the Future of AI Intelligence
        </p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">
          Beta v0.1.0
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes page-loader-logo {
          0% { transform: scale(0.8) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.05) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes page-loader-text {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-page-loader-logo {
          animation: page-loader-logo 0.6s ease-out forwards;
        }
        .animate-page-loader-text {
          animation: page-loader-text 0.4s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-page-loader-text-delay {
          animation: page-loader-text 0.4s ease-out 0.35s forwards;
          opacity: 0;
        }
        .animate-page-loader-text-delay-2 {
          animation: page-loader-text 0.4s ease-out 0.5s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};
