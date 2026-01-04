import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type UserPlan = "free" | "go" | "pro";

interface PlanFeatures {
  chat: boolean;
  research: boolean;
  documents: boolean;
  notebooks: boolean;
  images: boolean;
  video: boolean;
  sandbox: boolean;
  apiPlayground: boolean;
}

const planFeatures: Record<UserPlan, PlanFeatures> = {
  free: {
    chat: true,
    research: true,
    documents: true, // Metered - 3 prompts
    notebooks: true, // Metered - 5 notebooks
    images: true, // Metered - 3 prompts
    video: true, // Metered - 3 prompts
    sandbox: true, // Metered - 3 prompts
    apiPlayground: false,
  },
  go: {
    chat: true,
    research: true,
    documents: true,
    notebooks: true, // Unlimited
    images: true, // Metered - 10
    video: true, // Metered - 5
    sandbox: true, // Metered - 10
    apiPlayground: false,
  },
  pro: {
    chat: true,
    research: true,
    documents: true,
    notebooks: true,
    images: true,
    video: true,
    sandbox: true,
    apiPlayground: true,
  },
};

export const useUserPlan = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<UserPlan>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) {
        setPlan("free");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user plan:", error);
          setPlan("free");
        } else if (data?.plan && ["free", "go", "pro"].includes(data.plan)) {
          setPlan(data.plan as UserPlan);
        } else {
          setPlan("free");
        }
      } catch (error) {
        console.error("Error fetching user plan:", error);
        setPlan("free");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user]);

  const features = planFeatures[plan];

  const isFeatureAvailable = (feature: keyof PlanFeatures): boolean => {
    return features[feature];
  };

  const getRequiredPlan = (feature: keyof PlanFeatures): UserPlan => {
    if (planFeatures.free[feature]) return "free";
    if (planFeatures.go[feature]) return "go";
    return "pro";
  };

  const getUpgradeHint = (feature: keyof PlanFeatures): string => {
    const requiredPlan = getRequiredPlan(feature);
    if (requiredPlan === "go") {
      return "Upgrade to Go plan to unlock this feature";
    }
    return "Upgrade to Pro plan to unlock this feature";
  };

  return {
    plan,
    loading,
    features,
    isFeatureAvailable,
    getRequiredPlan,
    getUpgradeHint,
  };
};
