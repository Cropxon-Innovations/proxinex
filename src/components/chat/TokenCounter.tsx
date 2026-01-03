import { useMemo } from "react";
import { Coins, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TokenCounterProps {
  text: string;
  model?: string;
}

// Pricing per 1K tokens (in INR)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gemini-2.5-flash": { input: 0.0035, output: 0.014 },
  "gemini-2.5-pro": { input: 0.0175, output: 0.07 },
  "gpt-5": { input: 0.35, output: 1.05 },
  "gpt-5-mini": { input: 0.0105, output: 0.042 },
  "claude-opus-4.5": { input: 0.21, output: 0.63 },
  "claude-sonnet-4.5": { input: 0.042, output: 0.126 },
  "llama-3.3-70b": { input: 0.0035, output: 0.014 },
  "mistral-large": { input: 0.028, output: 0.084 },
  "deepseek-r1": { input: 0.0035, output: 0.014 },
  "o3": { input: 0.21, output: 0.63 },
  "grok-3": { input: 0.07, output: 0.21 },
  "gemini-3-pro": { input: 0.0175, output: 0.07 },
};

// Estimate tokens (rough approximation: 4 chars = 1 token)
function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// Estimate output tokens based on query type
function estimateOutputTokens(inputTokens: number): number {
  // Assume output is roughly 3-5x input for a typical response
  return Math.ceil(inputTokens * 4);
}

export const TokenCounter = ({ text, model = "gemini-2.5-flash" }: TokenCounterProps) => {
  const { tokens, estimatedCost, estimatedOutputTokens } = useMemo(() => {
    const inputTokens = estimateTokens(text);
    const outputTokens = estimateOutputTokens(inputTokens);
    
    const pricing = MODEL_PRICING[model] || MODEL_PRICING["gemini-2.5-flash"];
    const cost = ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1000;
    
    return {
      tokens: inputTokens,
      estimatedCost: Math.max(cost, 0.001),
      estimatedOutputTokens: outputTokens
    };
  }, [text, model]);

  if (!text || tokens === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full border border-border">
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-primary" />
              <span>{tokens} tokens</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>~₹{estimatedCost.toFixed(3)}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            <p><strong>Input:</strong> ~{tokens} tokens</p>
            <p><strong>Est. Output:</strong> ~{estimatedOutputTokens} tokens</p>
            <p><strong>Est. Cost:</strong> ₹{estimatedCost.toFixed(4)}</p>
            <p className="text-muted-foreground">Based on {model}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
