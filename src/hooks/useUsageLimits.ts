import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserPlan } from "./useUserPlan";

type UsageFeature = "documents" | "images" | "video" | "sandbox" | "notebooks";

interface UsageLimits {
  documents: number;
  images: number;
  video: number;
  sandbox: number;
  notebooks: number;
}

// Free plan limits
const freePlanLimits: UsageLimits = {
  documents: 3,
  images: 3,
  video: 3,
  sandbox: 3,
  notebooks: 5,
};

// Go plan limits (unlimited for most, some restrictions)
const goPlanLimits: UsageLimits = {
  documents: Infinity,
  images: 10,
  video: 5,
  sandbox: 10,
  notebooks: Infinity,
};

// Pro plan - unlimited
const proPlanLimits: UsageLimits = {
  documents: Infinity,
  images: Infinity,
  video: Infinity,
  sandbox: Infinity,
  notebooks: Infinity,
};

interface UsageData {
  feature: string;
  usage_count: number;
  reset_at: string | null;
}

export const useUsageLimits = () => {
  const { user } = useAuth();
  const { plan } = useUserPlan();
  const [usage, setUsage] = useState<Record<UsageFeature, number>>({
    documents: 0,
    images: 0,
    video: 0,
    sandbox: 0,
    notebooks: 0,
  });
  const [loading, setLoading] = useState(true);

  const getLimits = useCallback((): UsageLimits => {
    switch (plan) {
      case "pro":
        return proPlanLimits;
      case "go":
        return goPlanLimits;
      default:
        return freePlanLimits;
    }
  }, [plan]);

  // Get next reset date based on subscription
  const getNextResetDate = useCallback(async (): Promise<Date | null> => {
    if (!user) return null;

    // Get active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("expires_at, started_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscription?.expires_at) {
      return new Date(subscription.expires_at);
    }

    // For free users, reset monthly from when they started
    if (subscription?.started_at) {
      const startDate = new Date(subscription.started_at);
      const now = new Date();
      
      // Calculate next monthly reset
      const nextReset = new Date(startDate);
      while (nextReset <= now) {
        nextReset.setMonth(nextReset.getMonth() + 1);
      }
      return nextReset;
    }

    // Default: reset at start of next month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }, [user]);

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_usage")
        .select("feature, usage_count, reset_at")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching usage:", error);
      } else if (data) {
        const now = new Date();
        const usageMap: Record<string, number> = {};
        const needsReset: string[] = [];

        data.forEach((item: UsageData) => {
          // Check if usage needs to be reset
          if (item.reset_at && new Date(item.reset_at) <= now) {
            needsReset.push(item.feature);
            usageMap[item.feature] = 0;
          } else {
            usageMap[item.feature] = item.usage_count;
          }
        });

        // Reset expired usage counts
        if (needsReset.length > 0) {
          const nextReset = await getNextResetDate();
          for (const feature of needsReset) {
            await supabase
              .from("user_usage")
              .update({
                usage_count: 0,
                reset_at: nextReset?.toISOString() || null,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user.id)
              .eq("feature", feature);
          }
        }

        setUsage({
          documents: usageMap.documents || 0,
          images: usageMap.images || 0,
          video: usageMap.video || 0,
          sandbox: usageMap.sandbox || 0,
          notebooks: usageMap.notebooks || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
    } finally {
      setLoading(false);
    }
  }, [user, getNextResetDate]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const incrementUsage = useCallback(async (feature: UsageFeature): Promise<boolean> => {
    if (!user) return false;

    const limits = getLimits();
    const currentUsage = usage[feature];
    const limit = limits[feature];

    // Check if limit exceeded
    if (currentUsage >= limit) {
      return false;
    }

    try {
      // Get next reset date for new records
      const nextReset = await getNextResetDate();

      // Upsert usage record with reset date
      const { error } = await supabase
        .from("user_usage")
        .upsert({
          user_id: user.id,
          feature,
          usage_count: currentUsage + 1,
          reset_at: nextReset?.toISOString() || null,
        }, {
          onConflict: "user_id,feature",
        });

      if (error) {
        console.error("Error incrementing usage:", error);
        return false;
      }

      // Update local state
      setUsage(prev => ({
        ...prev,
        [feature]: prev[feature] + 1,
      }));

      return true;
    } catch (error) {
      console.error("Error incrementing usage:", error);
      return false;
    }
  }, [user, usage, getLimits, getNextResetDate]);

  const canUseFeature = useCallback((feature: UsageFeature): boolean => {
    const limits = getLimits();
    return usage[feature] < limits[feature];
  }, [usage, getLimits]);

  const getRemainingUsage = useCallback((feature: UsageFeature): number => {
    const limits = getLimits();
    const limit = limits[feature];
    if (limit === Infinity) return Infinity;
    return Math.max(0, limit - usage[feature]);
  }, [usage, getLimits]);

  const getUsageDisplay = useCallback((feature: UsageFeature): string => {
    const limits = getLimits();
    const limit = limits[feature];
    if (limit === Infinity) return "Unlimited";
    return `${usage[feature]}/${limit}`;
  }, [usage, getLimits]);

  const getRequiredPlanForUnlimited = useCallback((feature: UsageFeature): "go" | "pro" => {
    // For notebooks, Go plan gives unlimited
    if (feature === "notebooks") return "go";
    // For images, video, sandbox - Pro plan gives unlimited
    return "pro";
  }, []);

  return {
    usage,
    loading,
    limits: getLimits(),
    incrementUsage,
    canUseFeature,
    getRemainingUsage,
    getUsageDisplay,
    getRequiredPlanForUnlimited,
    refreshUsage: fetchUsage,
  };
};
