import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, Zap, Rocket, Building2, IndianRupee, DollarSign, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PricingCalculator } from "@/components/landing/PricingCalculator";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useToast } from "@/hooks/use-toast";

type Currency = "INR" | "USD";

interface PlanDetails {
  name: string;
  description: string;
  priceINR: string;
  priceUSD: string;
  period: string;
  icon: any;
  popular?: boolean;
  features: string[];
  cta: string;
  variant: "outline" | "default";
  planKey: "free" | "go" | "pro" | "enterprise";
}

const plans: PlanDetails[] = [
  {
    name: "Free",
    description: "Get started with Proxinex basics",
    priceINR: "₹0",
    priceUSD: "$0",
    period: "forever",
    icon: Zap,
    planKey: "free",
    features: [
      "50 queries per day",
      "Chat with AI models",
      "Limited Research mode",
      "Basic accuracy scoring",
      "Community support",
    ],
    cta: "Get Started Free",
    variant: "outline" as const,
  },
  {
    name: "Go",
    description: "For creators and professionals",
    priceINR: "₹199",
    priceUSD: "$5",
    period: "/month",
    icon: Rocket,
    planKey: "go",
    features: [
      "500 queries per day",
      "Everything in Free",
      "Documents generation",
      "Notebooks for research",
      "Full Research mode",
      "Email support",
    ],
    cta: "Start Go Plan",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    description: "Full power for teams and power users",
    priceINR: "₹499",
    priceUSD: "$12",
    period: "/month",
    icon: Building2,
    popular: true,
    planKey: "pro",
    features: [
      "Unlimited queries",
      "Everything in Go",
      "Image generation",
      "Video generation",
      "Sandbox environment",
      "API Playground access",
      "Inline Ask™",
      "Priority support",
      "Cost analytics dashboard",
    ],
    cta: "Start Pro Plan",
    variant: "default" as const,
  },
  {
    name: "Enterprise",
    description: "For organizations at scale",
    priceINR: "Custom",
    priceUSD: "Custom",
    period: "",
    icon: Building2,
    planKey: "enterprise",
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
  const [currency, setCurrency] = useState<Currency>("INR");
  const { initiatePayment, loading } = useRazorpay();
  const { user } = useAuth();
  const { plan: currentPlan } = useUserPlan();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = (planKey: "go" | "pro") => {
    if (!user) {
      // Redirect to auth with return URL
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to a plan.",
      });
      navigate(`/auth?redirect=/checkout?plan=${planKey}&currency=${currency}`);
      return;
    }
    
    // For logged-in users, redirect to checkout page for distraction-free experience
    navigate(`/checkout?plan=${planKey}&currency=${currency}`);
  };

  return (
    <>
      <Helmet>
        <title>Pricing - Proxinex AI Plans | Simple, Transparent Pricing</title>
        <meta 
          name="description" 
          content="Simple, transparent pricing for Proxinex AI. Start free, upgrade when you need more. India-optimized pricing with no hidden costs. Free, Go (₹199/$5), Pro (₹499/$12) plans available." 
        />
        <meta name="keywords" content="Proxinex pricing, AI pricing, affordable AI, India AI pricing, AI subscription" />
        <link rel="canonical" href="https://proxinex.com/pricing" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-12">
              <span className="text-sm text-primary font-medium">Pricing</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Simple, Transparent Pricing
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Start free, upgrade when you're ready. No hidden costs, ever.
              </p>

              {/* Currency Toggle */}
              <div className="inline-flex items-center gap-2 p-1 bg-secondary rounded-lg">
                <button
                  onClick={() => setCurrency("INR")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currency === "INR"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <IndianRupee className="h-4 w-4" />
                  India (INR)
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currency === "USD"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <DollarSign className="h-4 w-4" />
                  Global (USD)
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`relative rounded-lg border bg-card p-6 animate-fade-up flex flex-col ${
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
                    <span className="text-4xl font-bold text-foreground">
                      {currency === "INR" ? plan.priceINR : plan.priceUSD}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.planKey === "free" ? (
                    <Link to="/app">
                      <Button 
                        className="w-full border-border hover:bg-secondary"
                        variant="outline"
                      >
                        {currentPlan === "free" ? "Current Plan" : "Get Started Free"}
                      </Button>
                    </Link>
                  ) : plan.planKey === "enterprise" ? (
                    <Link to="/contact">
                      <Button 
                        className="w-full border-border hover:bg-secondary"
                        variant="outline"
                      >
                        Contact Sales
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className={`w-full ${
                        plan.variant === "default" 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'border-border hover:bg-secondary'
                      }`}
                      variant={plan.variant}
                      disabled={loading || currentPlan === plan.planKey}
                      onClick={() => handleSubscribe(plan.planKey as "go" | "pro")}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : currentPlan === plan.planKey ? (
                        "Current Plan"
                      ) : currentPlan !== "free" && plans.findIndex(p => p.planKey === plan.planKey) < plans.findIndex(p => p.planKey === currentPlan) ? (
                        "Downgrade"
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Feature Comparison Note */}
            <div className="max-w-2xl mx-auto mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                All plans include access to our AI Intelligence Control Plane. 
                Upgrade or downgrade anytime. Changes take effect at the end of your billing period.
              </p>
            </div>

            {/* Pricing Calculator */}
            <PricingCalculator />

            {/* FAQ Section */}
            <div className="max-w-2xl mx-auto mt-24">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-2">What features are included in each plan?</h3>
                  <p className="text-sm text-muted-foreground">
                    Free plan includes Chat and limited Research. Go plan unlocks Documents and Notebooks. 
                    Pro plan gives you everything including Images, Video, Sandbox, and API Playground.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Can I switch plans anytime?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! Upgrade or downgrade anytime. Upgrades take effect immediately. Downgrades 
                    take effect at the end of your current billing period.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Can I cancel my subscription?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! You can cancel anytime up to 3 days before your renewal date. After cancellation,
                    you'll have 7 days to continue using your plan features.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Why is India pricing different?</h3>
                  <p className="text-sm text-muted-foreground">
                    We offer localized pricing to make Proxinex accessible to everyone. Our India pricing 
                    is optimized for the local market while maintaining the same great features.
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
