import { ArrowRight } from "lucide-react";

const flowSteps = [
  {
    step: "01",
    title: "You Ask",
    description: "Send any query—research, code, analysis, creative—to Proxinex.",
  },
  {
    step: "02",
    title: "We Route",
    description: "Proxinex analyzes your query and routes it to the optimal AI model for that task.",
  },
  {
    step: "03",
    title: "You Verify",
    description: "See accuracy scores, freshness indicators, sources, and exact cost—all in one view.",
  },
  {
    step: "04",
    title: "You Control",
    description: "Inline Ask™ lets you dig deeper into any part of the answer. Full control, always.",
  },
];

export const FlowSection = () => {
  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Proxinex Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Intelligence routing that puts you in control at every step.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {flowSteps.map((item, index) => (
              <div key={item.step} className="relative animate-fade-up" style={{ animationDelay: `${index * 0.15}s` }}>
                {/* Connector Arrow (desktop only) */}
                {index < flowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-3 z-10">
                    <ArrowRight className="h-6 w-6 text-primary/50" />
                  </div>
                )}

                <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 hover:glow transition-all h-full">
                  <div className="text-4xl font-bold text-primary/30 mb-4">{item.step}</div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
