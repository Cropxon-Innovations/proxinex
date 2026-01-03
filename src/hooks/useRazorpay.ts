import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    email?: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const initiatePayment = useCallback(async (plan: 'go' | 'pro', currency: 'INR' | 'USD') => {
    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { plan, currency },
      });

      if (orderError || !orderData) {
        throw new Error(orderError?.message || 'Failed to create order');
      }

      const planNames = {
        go: 'Proxinex Go',
        pro: 'Proxinex Pro',
      };

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Proxinex',
        description: `${planNames[plan]} Subscription`,
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
                user_id: user?.id,
              },
            });

            if (verifyError) {
              throw new Error(verifyError.message);
            }

            toast({
              title: 'Payment Successful!',
              description: `Welcome to ${planNames[plan]}! Your subscription is now active.`,
            });

            // Reload to reflect new plan
            window.location.reload();
          } catch (error: any) {
            toast({
              title: 'Payment Verification Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        },
        prefill: {
          email: user?.email || '',
        },
        theme: {
          color: '#7c3aed',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast({
        title: 'Payment Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [loadRazorpayScript, toast, user]);

  return { initiatePayment, loading };
};
