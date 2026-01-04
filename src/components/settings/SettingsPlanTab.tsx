import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useSubscription } from "@/hooks/useSubscription";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Crown, 
  CreditCard, 
  FileText, 
  Download, 
  Check, 
  AlertTriangle,
  Loader2,
  Calendar,
  IndianRupee,
  DollarSign,
  Eye
} from "lucide-react";
import { format } from "date-fns";

interface PlanDetails {
  name: string;
  priceINR: string;
  priceUSD: string;
  features: string[];
  planKey: string;
}

const plans: PlanDetails[] = [
  {
    name: "Free",
    priceINR: "₹0",
    priceUSD: "$0",
    planKey: "free",
    features: ["50 queries/day", "Chat with AI", "Limited Research", "Community support"],
  },
  {
    name: "Go",
    priceINR: "₹199",
    priceUSD: "$5",
    planKey: "go",
    features: ["500 queries/day", "Documents", "Notebooks", "Full Research", "Email support"],
  },
  {
    name: "Pro",
    priceINR: "₹499",
    priceUSD: "$12",
    planKey: "pro",
    features: ["Unlimited queries", "Images", "Video", "Sandbox", "API Access", "Priority support"],
  },
];

interface SettingsPlanTabProps {
  currency?: "INR" | "USD";
}

export const SettingsPlanTab = ({ currency = "INR" }: SettingsPlanTabProps) => {
  const { user } = useAuth();
  const { plan: currentPlan, loading: planLoading } = useUserPlan();
  const { 
    subscription, 
    invoices, 
    paymentMethods, 
    loading: subLoading,
    cancelSubscription,
    downgrade,
    isInGracePeriod,
    gracePeriodDaysLeft,
    canCancelSubscription
  } = useSubscription();
  const { initiatePayment, loading: paymentLoading } = useRazorpay();
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  const loading = planLoading || subLoading;

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingInvoice(invoiceId);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoice_id: invoiceId },
      });

      if (error) throw error;

      if (data?.html) {
        // Open in new window for printing/saving as PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.html);
          printWindow.document.close();
          printWindow.focus();
          // Auto-trigger print dialog
          setTimeout(() => printWindow.print(), 250);
        }
        toast({
          title: "Invoice Generated",
          description: "Print dialog opened. Save as PDF to download.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleUpgrade = (planKey: string) => {
    if (planKey === "go" || planKey === "pro") {
      initiatePayment(planKey as "go" | "pro", currency);
    }
  };

  const handleDowngrade = async (targetPlan: string) => {
    const result = await downgrade(targetPlan);
    if (result.success) {
      toast({
        title: "Downgrade Scheduled",
        description: result.data?.message || "Your plan will be downgraded at the end of the billing period.",
      });
    } else {
      toast({
        title: "Downgrade Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    const result = await cancelSubscription();
    setCancelling(false);
    setCancelDialogOpen(false);

    if (result.success) {
      toast({
        title: "Subscription Cancelled",
        description: `Your plan will remain active for 7 more days until ${format(new Date(result.data?.grace_period_ends_at), "PPP")}.`,
      });
    } else {
      toast({
        title: "Cancellation Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const formatAmount = (amount: number, curr: string) => {
    const value = amount / 100;
    return curr === "INR" ? `₹${value}` : `$${value}`;
  };

  const getPlanIndex = (plan: string) => plans.findIndex(p => p.planKey === plan);
  const currentPlanIndex = getPlanIndex(currentPlan);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grace Period Warning */}
      {isInGracePeriod && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive">Subscription Cancelled</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your subscription has been cancelled. You have {gracePeriodDaysLeft} days left to use your current plan features.
                  {subscription?.grace_period_ends_at && (
                    <span className="block mt-1">
                      Access ends on {format(new Date(subscription.grace_period_ends_at), "PPP")}
                    </span>
                  )}
                </p>
                <Button 
                  size="sm" 
                  className="mt-3"
                  onClick={() => handleUpgrade(currentPlan === "go" ? "go" : "pro")}
                >
                  Reactivate Subscription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Current Plan
              </CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </div>
            <Badge className="bg-primary text-primary-foreground capitalize">{currentPlan}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, index) => {
              const isCurrent = plan.planKey === currentPlan;
              const isUpgrade = index > currentPlanIndex;
              const isDowngrade = index < currentPlanIndex;

              return (
                <div
                  key={plan.name}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {isCurrent && <Badge variant="secondary">Current</Badge>}
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-bold">
                      {currency === "INR" ? plan.priceINR : plan.priceUSD}
                    </span>
                    {plan.planKey !== "free" && (
                      <span className="text-muted-foreground text-sm">/month</span>
                    )}
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrent ? "outline" : isUpgrade ? "default" : "secondary"}
                    size="sm"
                    className="w-full"
                    disabled={isCurrent || paymentLoading}
                    onClick={() => isUpgrade ? handleUpgrade(plan.planKey) : handleDowngrade(plan.planKey)}
                  >
                    {paymentLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : isUpgrade ? (
                      "Upgrade"
                    ) : (
                      "Downgrade"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Subscription Info */}
          {subscription && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Billing Period</h4>
                  <p className="text-sm text-muted-foreground">
                    {subscription.expires_at && (
                      <>Renews on {format(new Date(subscription.expires_at), "PPP")}</>
                    )}
                    {!subscription.auto_renew && " (Auto-renewal disabled)"}
                  </p>
                </div>
                {currentPlan !== "free" && canCancelSubscription() && (
                  <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        Cancel Subscription
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Subscription?</DialogTitle>
                        <DialogDescription>
                          Your subscription will remain active for 7 days after cancellation. After that, you'll be downgraded to the Free plan.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-3 justify-end mt-4">
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                          Keep Subscription
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleCancelSubscription}
                          disabled={cancelling}
                        >
                          {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Cancel Subscription
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {currentPlan !== "free" && !canCancelSubscription() && (
                  <p className="text-xs text-muted-foreground">
                    Cannot cancel within 3 days of renewal
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage your saved payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">
                        {method.type === "card" && method.card_brand
                          ? `${method.card_brand} •••• ${method.last_four}`
                          : method.upi_id || method.type}
                      </p>
                      {method.is_default && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No saved payment methods. Payment details will be saved after your first purchase.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices
          </CardTitle>
          <CardDescription>View and download your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{invoice.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.paid_at && format(new Date(invoice.paid_at), "PPP")} • {formatAmount(invoice.amount, invoice.currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={invoice.status === "paid" ? "default" : "secondary"}
                        className={invoice.status === "paid" ? "bg-green-500/20 text-green-600" : ""}
                      >
                        {invoice.status}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Invoice {invoice.invoice_number}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">
                                  {invoice.paid_at && format(new Date(invoice.paid_at), "PPP")}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Status</p>
                                <Badge className="bg-green-500/20 text-green-600">{invoice.status}</Badge>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Plan</p>
                                <p className="font-medium capitalize">{invoice.plan}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-medium">{formatAmount(invoice.amount, invoice.currency)}</p>
                              </div>
                              {invoice.billing_email && (
                                <div className="col-span-2">
                                  <p className="text-muted-foreground">Billed To</p>
                                  <p className="font-medium">{invoice.billing_name || invoice.billing_email}</p>
                                  <p className="text-sm text-muted-foreground">{invoice.billing_email}</p>
                                </div>
                              )}
                            </div>
                            <Separator />
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                              disabled={downloadingInvoice === invoice.id}
                            >
                              {downloadingInvoice === invoice.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              Download PDF
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No invoices yet. Invoices will appear here after your first payment.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
