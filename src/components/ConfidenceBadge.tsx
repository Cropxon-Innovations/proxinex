import { CheckCircle, AlertTriangle, AlertCircle, TrendingUp } from "lucide-react";

interface ConfidenceBadgeProps {
  score: number;
  label?: string;
}

export const ConfidenceBadge = ({ score, label }: ConfidenceBadgeProps) => {
  let bgColor = "bg-destructive/20";
  let textColor = "text-destructive";
  let displayLabel = label || "Low confidence";
  let Icon = AlertTriangle;

  if (score >= 80) {
    bgColor = "bg-green-500/20";
    textColor = "text-green-400";
    displayLabel = label || "High confidence";
    Icon = CheckCircle;
  } else if (score >= 60) {
    bgColor = "bg-yellow-500/20";
    textColor = "text-yellow-400";
    displayLabel = label || "Good confidence";
    Icon = TrendingUp;
  } else if (score >= 40) {
    bgColor = "bg-orange-500/20";
    textColor = "text-orange-400";
    displayLabel = label || "Medium confidence";
    Icon = AlertCircle;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full ${bgColor} ${textColor}`}>
      <Icon className="h-3 w-3" />
      <span>{displayLabel}</span>
      <span className="opacity-75">({score}%)</span>
    </span>
  );
};
