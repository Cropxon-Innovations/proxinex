import { useModelRecommendation, getQueryTypeLabel, QueryType } from "@/hooks/useModelRecommendation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Brain, 
  Code, 
  Search, 
  Pen, 
  Image, 
  Video, 
  Eye, 
  MessageSquare,
  ChevronRight,
  Zap
} from "lucide-react";

interface ModelRecommendationBannerProps {
  query: string;
  onSelectModel?: (modelId: string) => void;
  selectedModels?: string[];
}

const iconMap: Record<string, any> = {
  Code,
  Pen,
  Search,
  Brain,
  Image,
  Video,
  Eye,
  MessageSquare,
};

export const ModelRecommendationBanner = ({ 
  query, 
  onSelectModel,
  selectedModels = []
}: ModelRecommendationBannerProps) => {
  const { type, confidence, recommendations } = useModelRecommendation(query);

  if (!query.trim() || confidence < 30) {
    return null;
  }

  const typeLabel = getQueryTypeLabel(type);
  const topRecommendations = recommendations.slice(0, 3);
  const alreadySelected = topRecommendations.filter(r => selectedModels.includes(r.id));
  const notSelected = topRecommendations.filter(r => !selectedModels.includes(r.id));

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-foreground">Smart Model Recommendation</h4>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              {confidence}% confidence
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            Your query appears to be <span className="text-primary font-medium">{typeLabel}</span>. 
            Here are the best models for this task:
          </p>

          <div className="flex flex-wrap gap-2">
            {topRecommendations.map((rec) => {
              const isSelected = selectedModels.includes(rec.id);
              return (
                <button
                  key={rec.id}
                  onClick={() => onSelectModel?.(rec.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <div className="text-sm font-medium">{rec.name}</div>
                      <div className="text-xs text-muted-foreground">{rec.reason}</div>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-[10px] ${isSelected ? "bg-primary/20 text-primary" : ""}`}
                  >
                    {rec.confidence}%
                  </Badge>
                </button>
              );
            })}
          </div>

          {alreadySelected.length > 0 && (
            <p className="text-xs text-primary mt-2">
              ✓ {alreadySelected.length} recommended model{alreadySelected.length > 1 ? "s" : ""} already selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
