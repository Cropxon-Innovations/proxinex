import { 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  TrendingUp,
  Zap,
  AlertTriangle,
  Info
} from "lucide-react";
import { Citation } from "@/lib/tavily";

interface ResearchSummaryCardProps {
  answer: string;
  confidence: number;
  confidence_label: string;
  citations: Citation[];
}

export const ResearchSummaryCard = ({
  answer,
  confidence,
  confidence_label,
  citations,
}: ResearchSummaryCardProps) => {
  // Extract key findings from the answer (first 2-3 sentences or bullet points)
  const extractKeyFindings = (text: string): string[] => {
    // Try to find bullet points first
    const bulletPoints = text.match(/[-•]\s*\*\*([^*]+)\*\*/g);
    if (bulletPoints && bulletPoints.length >= 2) {
      return bulletPoints.slice(0, 3).map(bp => 
        bp.replace(/[-•]\s*\*\*/, '').replace(/\*\*/, '').trim()
      );
    }
    
    // Otherwise extract sentences
    const sentences = text
      .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+/g, '') // Remove citation markers
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.length > 20 && s.length < 200)
      .slice(0, 3);
    
    return sentences.map(s => s.trim());
  };

  const keyFindings = extractKeyFindings(answer);
  const avgSourceScore = citations.length > 0 
    ? Math.round(citations.reduce((sum, c) => sum + (c.score > 1 ? c.score : c.score * 100), 0) / citations.length)
    : 0;

  const getConfidenceColor = () => {
    if (confidence >= 80) return "text-emerald-500";
    if (confidence >= 60) return "text-amber-500";
    if (confidence >= 40) return "text-orange-500";
    return "text-destructive";
  };

  const getConfidenceBg = () => {
    if (confidence >= 80) return "bg-emerald-500/10 border-emerald-500/20";
    if (confidence >= 60) return "bg-amber-500/10 border-amber-500/20";
    if (confidence >= 40) return "bg-orange-500/10 border-orange-500/20";
    return "bg-destructive/10 border-destructive/20";
  };

  const getConfidenceIcon = () => {
    if (confidence >= 80) return ShieldCheck;
    if (confidence >= 60) return TrendingUp;
    if (confidence >= 40) return Info;
    return AlertTriangle;
  };

  const ConfidenceIcon = getConfidenceIcon();

  return (
    <div className="bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-5 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Research Summary</h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Sources Count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">{citations.length} sources</span>
          </div>
          {/* Confidence Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${getConfidenceBg()}`}>
            <ConfidenceIcon className={`h-3.5 w-3.5 ${getConfidenceColor()}`} />
            <span className={`text-xs font-medium ${getConfidenceColor()}`}>
              {confidence}% {confidence_label}
            </span>
          </div>
        </div>
      </div>

      {/* Key Findings */}
      {keyFindings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-primary" />
            <span className="font-medium">Key Findings</span>
          </div>
          <ul className="space-y-1.5">
            {keyFindings.map((finding, index) => (
              <li 
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="line-clamp-2">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs text-muted-foreground">
            Avg. source quality: <span className="font-medium text-foreground">{avgSourceScore}%</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">
            Citations: <span className="font-medium text-foreground">{citations.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
