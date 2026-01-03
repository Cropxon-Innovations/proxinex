import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
    research: true, // Limited
    documents: false,
    notebooks: false,
    images: false,
    video: false,
    sandbox: false,
    apiPlayground: false,
  },
  go: {
    chat: true,
    research: true,
    documents: true,
    notebooks: true,
    images: false,
    video: false,
    sandbox: false,
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

  useEffect(() => {
    // In a real app, this would fetch from database/API
    // For now, default to free plan
    if (user) {
      // Could check user metadata or a subscription table
      setPlan("free");
    }
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
    features,
    isFeatureAvailable,
    getRequiredPlan,
    getUpgradeHint,
  };
};
