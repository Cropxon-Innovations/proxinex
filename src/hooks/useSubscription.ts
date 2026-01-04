import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  currency: string;
  amount: number;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  grace_period_ends_at: string | null;
  auto_renew: boolean;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  billing_name: string | null;
  billing_email: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last_four: string | null;
  card_brand: string | null;
  upi_id: string | null;
  is_default: boolean;
  created_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch active subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'cancelled', 'grace_period'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subData) {
        setSubscription(subData as Subscription);
      }

      // Fetch invoices
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (invoiceData) {
        setInvoices(invoiceData as Invoice[]);
      }

      // Fetch payment methods
      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (paymentData) {
        setPaymentMethods(paymentData as PaymentMethod[]);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const cancelSubscription = useCallback(async () => {
    if (!subscription || !user) return { success: false, error: 'No active subscription' };

    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscription_id: subscription.id,
          user_id: user.id,
        },
      });

      if (error) throw error;
      
      await fetchSubscription();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [subscription, user, fetchSubscription]);

  const downgrade = useCallback(async (targetPlan: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.functions.invoke('downgrade-subscription', {
        body: {
          user_id: user.id,
          target_plan: targetPlan,
        },
      });

      if (error) throw error;
      
      await fetchSubscription();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [user, fetchSubscription]);

  const isInGracePeriod = subscription?.status === 'cancelled' && subscription?.grace_period_ends_at;
  const gracePeriodDaysLeft = isInGracePeriod && subscription?.grace_period_ends_at
    ? Math.ceil((new Date(subscription.grace_period_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const canCancelSubscription = () => {
    if (!subscription?.expires_at) return false;
    const expiresAt = new Date(subscription.expires_at);
    const threeDaysBeforeExpiry = new Date(expiresAt);
    threeDaysBeforeExpiry.setDate(threeDaysBeforeExpiry.getDate() - 3);
    return new Date() < threeDaysBeforeExpiry;
  };

  return {
    subscription,
    invoices,
    paymentMethods,
    loading,
    cancelSubscription,
    downgrade,
    fetchSubscription,
    isInGracePeriod,
    gracePeriodDaysLeft,
    canCancelSubscription,
  };
};
