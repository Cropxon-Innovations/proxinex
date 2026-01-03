import { ArrowRight, Sparkles } from "lucide-react";

interface RelatedQueriesProps {
  queries: string[];
  onQueryClick: (query: string) => void;
}

export const RelatedQueries = ({ queries, onQueryClick }: RelatedQueriesProps) => {
  if (queries.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-secondary/30 rounded-xl border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Related searches</span>
      </div>
      <div className="grid gap-2">
        {queries.map((query, index) => (
          <button
            key={index}
            onClick={() => onQueryClick(query)}
            className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-secondary/50 hover:border-primary/30 transition-all group text-left"
          >
            <span className="text-sm text-foreground/80 group-hover:text-foreground">
              {query}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};
