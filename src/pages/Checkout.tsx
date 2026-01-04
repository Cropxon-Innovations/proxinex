import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRazorpay } from "@/hooks/useRazorpay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowLeft, Shield, Zap, Rocket, Building2, Loader2, IndianRupee, DollarSign } from "lucide-react";
import { Helmet } from "react-helmet-async";
import proxinexLogo from "@/assets/proxinex-logo.png";

type Currency = "INR" | "USD";
type Plan = "go" | "pro";

interface PlanDetails {
  name: string;
  description: string;
  priceINR: number;
  priceUSD: number;
  displayPriceINR: string;
  displayPriceUSD: string;
  icon: any;
  features: string[];
}

const planDetails: Record<Plan, PlanDetails> = {
  go: {
    name: "Proxinex Go",
    description: "For creators and professionals",
    priceINR: 199,
    priceUSD: 5,
    displayPriceINR: "₹199",
    displayPriceUSD: "$5",
    icon: Rocket,
    features: [
      "500 queries per day",
      "Documents generation",
      "Notebooks for research",
      "Full Research mode",
      "Email support",
    ],
  },
  pro: {
    name: "Proxinex Pro",
    description: "Full power for teams and power users",
    priceINR: 499,
    priceUSD: 12,
    displayPriceINR: "₹499",
    displayPriceUSD: "$12",
    icon: Building2,
    features: [
      "Unlimited queries",
      "Image generation",
      "Video generation",
      "Sandbox environment",
      "API Playground access",
      "Inline Ask™",
      "Priority support",
    ],
  },
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { initiatePayment, loading: paymentLoading } = useRazorpay();

  const planParam = searchParams.get("plan") as Plan | null;
  const currencyParam = (searchParams.get("currency") as Currency) || "INR";

  const [plan] = useState<Plan>(planParam && ["go", "pro"].includes(planParam) ? planParam : "go");
  const [currency, setCurrency] = useState<Currency>(currencyParam);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const selectedPlan = planDetails[plan];

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!authLoading && !user) {
      navigate(`/auth?redirect=/checkout?plan=${plan}&currency=${currency}`);
    }
  }, [user, authLoading, navigate, plan, currency]);

  const handlePayment = () => {
    initiatePayment(plan, currency, {
      userName,
      userPhone,
      onSuccess: (result) => {
        console.log("Payment successful:", result);
      },
      onFailure: (error) => {
        console.error("Payment failed:", error);
      },
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout - {selectedPlan.name} | Proxinex</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Minimal Header */}
        <header className="border-b border-border bg-card">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <img src={proxinexLogo} alt="Proxinex" className="h-8" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <selectedPlan.icon className="h-5 w-5 text-primary" />
                  {selectedPlan.name}
                </CardTitle>
                <CardDescription>{selectedPlan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Currency Toggle */}
                <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg w-fit">
                  <button
                    onClick={() => setCurrency("INR")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      currency === "USD"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <DollarSign className="h-3 w-3" />
                    USD
                  </button>
                </div>

                <div className="text-3xl font-bold text-foreground">
                  {currency === "INR" ? selectedPlan.displayPriceINR : selectedPlan.displayPriceUSD}
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-foreground mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">
                      {currency === "INR" ? selectedPlan.displayPriceINR : selectedPlan.displayPriceUSD}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (included)</span>
                    <span className="text-foreground">₹0</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">
                      {currency === "INR" ? selectedPlan.displayPriceINR : selectedPlan.displayPriceUSD}/month
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Purchase</CardTitle>
                <CardDescription>
                  Enter your details below. Payment is processed securely by Razorpay.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Invoice will be sent to this email</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name (for invoice)</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Pay {currency === "INR" ? selectedPlan.displayPriceINR : selectedPlan.displayPriceUSD}
                    </>
                  )}
                </Button>

                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>256-bit SSL encrypted payment</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    By completing this purchase, you agree to our{" "}
                    <a href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cancel anytime. No questions asked.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default Checkout;
