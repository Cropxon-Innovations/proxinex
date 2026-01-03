import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, Zap, Building2, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out Proxinex",
    price: "₹0",
    period: "forever",
    icon: Zap,
    features: [
      "50 queries per day",
      "Access to all models",
      "Basic accuracy scoring",
      "Community support",
    ],
    cta: "Get Started",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    description: "For individuals and small teams",
    price: "₹999",
    period: "/month",
    icon: Rocket,
    popular: true,
    features: [
      "Unlimited queries",
      "Priority model routing",
      "Advanced accuracy scoring",
      "Inline Ask™",
      "API access",
      "Priority support",
      "Cost analytics dashboard",
    ],
    cta: "Start Free Trial",
    variant: "default" as const,
  },
  {
    name: "Enterprise",
    description: "For organizations at scale",
    price: "Custom",
    period: "",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Dedicated infrastructure",
      "Custom model fine-tuning",
      "SLA guarantees",
      "SSO & advanced security",
      "Dedicated success manager",
      "Volume discounts",
    ],
    cta: "Contact Sales",
    variant: "outline" as const,
  },
];

const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>Pricing - Proxinex AI Plans & Pricing</title>
        <meta 
          name="description" 
          content="Simple, transparent pricing for Proxinex. Start free, upgrade when you need more. India-optimized pricing with no hidden costs." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-sm text-primary font-medium">Pricing</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Simple, Transparent Pricing
              </h1>
              <p className="text-lg text-muted-foreground">
                Start free, upgrade when you're ready. No hidden costs, ever.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`relative rounded-lg border bg-card p-6 animate-fade-up ${
                    plan.popular 
                      ? 'border-primary glow' 
                      : 'border-border'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="p-2 rounded-lg bg-secondary w-fit mb-4">
                      <plan.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={plan.name === "Enterprise" ? "/contact" : "/app"}>
                    <Button 
                      className={`w-full ${
                        plan.variant === "default" 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'border-border hover:bg-secondary'
                      }`}
                      variant={plan.variant}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="max-w-2xl mx-auto mt-24">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-2">How does pay-per-query work?</h3>
                  <p className="text-sm text-muted-foreground">
                    You only pay for what you use. Each query is priced based on the model used, with full cost 
                    transparency before and after each request.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Can I switch plans anytime?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! Upgrade or downgrade anytime. Changes take effect immediately, and we'll prorate 
                    your billing accordingly.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Is there a free trial?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! The Free plan lets you try Proxinex with 50 queries per day. Pro plan comes with a 
                    14-day free trial, no credit card required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Pricing;
