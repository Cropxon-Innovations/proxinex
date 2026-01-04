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
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    plan?: string;
    user_id?: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
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
      close: () => void;
    };
  }
}

interface PaymentResult {
  success: boolean;
  invoice?: {
    id: string;
    invoice_number: string;
    amount: number;
    currency: string;
    paid_at: string;
  };
  error?: string;
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

  const initiatePayment = useCallback(async (
    plan: 'go' | 'pro', 
    currency: 'INR' | 'USD',
    options?: {
      onSuccess?: (result: PaymentResult) => void;
      onFailure?: (error: string) => void;
      userName?: string;
      userPhone?: string;
    }
  ) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to subscribe to a plan.',
        variant: 'destructive',
      });
      return;
    }

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

      const planPrices = {
        go: { INR: '₹199', USD: '$5' },
        pro: { INR: '₹499', USD: '$12' },
      };

      // Open Razorpay checkout with enhanced options
      const razorpayOptions: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Proxinex',
        description: `${planNames[plan]} - ${planPrices[plan][currency]}/month`,
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
                user_id: user.id,
                currency,
                user_email: user.email,
                user_name: options?.userName || user.email?.split('@')[0],
              },
            });

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyError?.message || verifyData?.error || 'Payment verification failed');
            }

            toast({
              title: '✅ Payment Successful!',
              description: `Welcome to ${planNames[plan]}! Your subscription is now active. Invoice: ${verifyData.invoice?.invoice_number}`,
            });

            options?.onSuccess?.({
              success: true,
              invoice: verifyData.invoice,
            });

            // Reload to reflect new plan
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } catch (error: any) {
            toast({
              title: '❌ Payment Verification Failed',
              description: error.message,
              variant: 'destructive',
            });
            options?.onFailure?.(error.message);
          }
        },
        prefill: {
          name: options?.userName || '',
          email: user.email || '',
          contact: options?.userPhone || '',
        },
        notes: {
          plan,
          user_id: user.id,
        },
        theme: {
          color: '#7c3aed',
        },
        modal: {
          escape: false,
          backdropclose: false,
          ondismiss: () => {
            setLoading(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You can try again anytime.',
            });
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error: any) {
      toast({
        title: 'Payment Error',
        description: error.message,
        variant: 'destructive',
      });
      options?.onFailure?.(error.message);
    } finally {
      setLoading(false);
    }
  }, [loadRazorpayScript, toast, user]);

  return { initiatePayment, loading };
};
