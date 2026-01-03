import { AlertTriangle, HelpCircle, DollarSign, Clock } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "AI is a Black Box",
    description: "You don't know which model answered. You can't verify accuracy. You just have to trust it.",
  },
  {
    icon: HelpCircle,
    title: "No Control Over Quality",
    description: "Different queries need different models. But you're stuck with one provider's routing decisions.",
  },
  {
    icon: DollarSign,
    title: "Hidden Costs",
    description: "You pay per token, but can't see the cost per query. Budgets blow up without warning.",
  },
  {
    icon: Clock,
    title: "Outdated Information",
    description: "Training cutoffs mean stale answers. You never know when the data is from.",
  },
];

export const ProblemSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            The Problem with AI Today
          </h2>
          <p className="text-lg text-muted-foreground">
            Every AI tool asks you to trust blindly. Proxinex gives you control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className="p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-all group animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                  <problem.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground">{problem.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
