import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Rocket, Building2, IndianRupee, DollarSign, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useCurrency, Currency } from "@/hooks/useCurrency";

interface PlanDetails {
  name: string;
  description: string;
  priceINR: string;
  priceUSD: string;
  period: string;
  icon: typeof Zap;
  popular?: boolean;
  features: string[];
  planKey: "free" | "go" | "pro";
}

const plans: PlanDetails[] = [
  {
    name: "Free",
    description: "Get started with basics",
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
    ],
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
    ],
  },
  {
    name: "Pro",
    description: "Full power for teams",
    priceINR: "₹499",
    priceUSD: "$12",
    period: "/month",
    icon: Building2,
    popular: true,
    planKey: "pro",
    features: [
      "Unlimited queries",
      "Everything in Go",
      "Image & Video generation",
      "Sandbox & API Playground",
      "Inline Ask™",
      "Priority support",
    ],
  },
];

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const { currency, setCurrency, isDetecting } = useCurrency();
  const { initiatePayment, loading } = useRazorpay();
  const { plan: currentPlan } = useUserPlan();
  const navigate = useNavigate();

  const handleSubscribe = async (planKey: "go" | "pro") => {
    onOpenChange(false);
    navigate(`/checkout?plan=${planKey}&currency=${currency}`);
  };

  const getPlanIndex = (planKey: string) => plans.findIndex(p => p.planKey === planKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade Your Plan
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm mt-1">
            Unlock more features and capabilities
          </p>

          {/* Currency Toggle */}
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center gap-1 p-1 bg-secondary rounded-lg">
              <button
                onClick={() => setCurrency("INR")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  currency === "INR"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <IndianRupee className="h-3 w-3" />
                INR
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  currency === "USD"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <DollarSign className="h-3 w-3" />
                USD
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlan === plan.planKey;
              const isDowngrade = currentPlan !== "free" && getPlanIndex(plan.planKey) < getPlanIndex(currentPlan);
              const PlanIcon = plan.icon;

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-lg border bg-card p-4 flex flex-col ${
                    plan.popular ? "border-primary ring-1 ring-primary" : "border-border"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-full">
                      Popular
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="p-1.5 rounded-md bg-secondary w-fit mb-2">
                      <PlanIcon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="mb-3">
                    <span className="text-2xl font-bold text-foreground">
                      {currency === "INR" ? plan.priceINR : plan.priceUSD}
                    </span>
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="space-y-1.5 mb-4 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.planKey === "free" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isCurrentPlan}
                      className="w-full text-xs"
                    >
                      {isCurrentPlan ? "Current Plan" : "Free Plan"}
                    </Button>
                  ) : (
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      size="sm"
                      disabled={loading || isCurrentPlan}
                      onClick={() => handleSubscribe(plan.planKey as "go" | "pro")}
                      className="w-full text-xs"
                    >
                      {loading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : isDowngrade ? (
                        "Downgrade"
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-4">
            All plans include access to our AI Intelligence Control Plane. 
            Upgrade or downgrade anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
