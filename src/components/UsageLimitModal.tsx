import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, AlertCircle } from "lucide-react";
import { UpgradeModal } from "./UpgradeModal";
import { useState } from "react";

interface UsageLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  usageCount: number;
  limit: number;
  requiredPlan: "go" | "pro";
}

export const UsageLimitModal = ({
  open,
  onOpenChange,
  feature,
  usageCount,
  limit,
  requiredPlan,
}: UsageLimitModalProps) => {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const featureLabels: Record<string, string> = {
    documents: "Documents",
    images: "Images",
    video: "Videos",
    sandbox: "Sandbox Prompts",
    notebooks: "Notebooks",
  };

  const planInfo = {
    go: {
      label: "Go",
      icon: Sparkles,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    pro: {
      label: "Pro",
      icon: Crown,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  };

  const plan = planInfo[requiredPlan];
  const PlanIcon = plan.icon;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl">
              {featureLabels[feature] || feature} Limit Reached
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              You've used {usageCount} out of {limit} {featureLabels[feature]?.toLowerCase() || feature} on the Free plan.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${plan.bgColor} flex items-center justify-center`}>
                <PlanIcon className={`h-5 w-5 ${plan.color}`} />
              </div>
              <div>
                <h4 className="font-semibold">Upgrade to {plan.label} Plan</h4>
                <p className="text-sm text-muted-foreground">
                  {requiredPlan === "go" ? "Get unlimited access" : "Get full unlimited access to all features"}
                </p>
              </div>
            </div>
            
            <ul className="text-sm text-muted-foreground space-y-1 ml-13 mb-4">
              {requiredPlan === "go" ? (
                <>
                  <li>• Unlimited Documents</li>
                  <li>• Unlimited Notebooks</li>
                  <li>• 10 Images per month</li>
                  <li>• 5 Videos per month</li>
                </>
              ) : (
                <>
                  <li>• Unlimited everything</li>
                  <li>• Priority support</li>
                  <li>• Advanced features</li>
                </>
              )}
            </ul>

            <Button 
              onClick={() => {
                onOpenChange(false);
                setUpgradeModalOpen(true);
              }}
              className="w-full"
            >
              <PlanIcon className="h-4 w-4 mr-2" />
              Upgrade to {plan.label}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Your usage resets at the start of each billing cycle
          </p>
        </DialogContent>
      </Dialog>

      <UpgradeModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen}
      />
    </>
  );
};
