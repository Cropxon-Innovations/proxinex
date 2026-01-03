import { 
  Layers, 
  MessageSquareText, 
  Shield, 
  DollarSign, 
  RefreshCw, 
  Code 
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Multi-Model Sandbox",
    description: "Compare GPT-4, Claude, Gemini, Llama side-by-side. See which model works best for your use case.",
    tag: "Sandbox",
  },
  {
    icon: MessageSquareText,
    title: "Inline Ask™",
    description: "Highlight any part of an answer and ask follow-up questions. Turn responses into living documents.",
    tag: "Signature Feature",
  },
  {
    icon: Shield,
    title: "Accuracy Scoring",
    description: "Every answer comes with a trust score, source citations, and freshness indicators.",
    tag: "Trust",
  },
  {
    icon: DollarSign,
    title: "Cost Transparency",
    description: "See exactly what each query costs in real-time. Set budgets, get alerts, never overspend.",
    tag: "Cost Control",
  },
  {
    icon: RefreshCw,
    title: "Live Freshness",
    description: "Know when data was last updated. Get real-time information when you need it.",
    tag: "Freshness",
  },
  {
    icon: Code,
    title: "Developer APIs",
    description: "Full API access with SDKs for Python, JavaScript, and more. Build AI into your products.",
    tag: "API",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Control AI
          </h2>
          <p className="text-lg text-muted-foreground">
            Built for researchers, developers, and enterprises who demand transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-lg bg-card border border-border hover:border-primary/50 hover:glow transition-all animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-5 w-5" />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                  {feature.tag}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
