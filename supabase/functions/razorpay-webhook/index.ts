import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

// Plan pricing in paise/cents
const planPricing: Record<string, Record<string, number>> = {
  go: { INR: 19900, USD: 500 },
  pro: { INR: 49900, USD: 1200 },
};

// Generate invoice number
function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${year}${month}-${random}`;
}

// Log webhook event to database
async function logWebhookEvent(
  supabase: any,
  eventType: string,
  eventId: string | null,
  payload: any,
  signature: string | null,
  status: 'received' | 'processed' | 'failed',
  errorMessage?: string
) {
  try {
    await supabase
      .from('webhook_events')
      .insert({
        event_type: eventType,
        event_id: eventId,
        payload,
        signature,
        status,
        error_message: errorMessage,
        processed_at: status !== 'received' ? new Date().toISOString() : null,
      });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  let eventType = 'unknown';
  let eventId: string | null = null;
  let payload: any = null;
  let signature: string | null = null;

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }

    const body = await req.text();
    signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      throw new Error('Missing webhook signature');
    }

    // Verify webhook signature
    const expectedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature verification failed');
      throw new Error('Invalid webhook signature');
    }

    payload = JSON.parse(body);
    eventType = payload.event || 'unknown';
    eventId = payload.payload?.payment?.entity?.id || payload.payload?.subscription?.entity?.id || null;
    
    const paymentEntity = payload.payload?.payment?.entity;
    const subscriptionEntity = payload.payload?.subscription?.entity;

    console.log('Razorpay webhook event:', eventType);

    // Log received event
    await logWebhookEvent(supabase, eventType, eventId, payload, signature, 'received');

    switch (eventType) {
      case 'payment.captured': {
        // Payment successful - handled by verify-razorpay-payment
        console.log('Payment captured:', paymentEntity?.id);
        break;
      }

      case 'payment.failed': {
        // Payment failed
        console.log('Payment failed:', paymentEntity?.id);
        
        if (paymentEntity?.notes?.user_id) {
          // Send failure notification email
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'payment_confirmation',
              to: paymentEntity.email,
              name: paymentEntity.notes?.user_name || 'User',
              data: {
                plan: paymentEntity.notes?.plan || 'unknown',
                amount: paymentEntity.amount,
                currency: paymentEntity.currency?.toUpperCase(),
                invoiceNumber: 'N/A',
                invoiceDate: new Date().toLocaleDateString('en-IN'),
                status: 'failed',
              },
            },
          });
        }
        break;
      }

      case 'subscription.activated': {
        console.log('Subscription activated:', subscriptionEntity?.id);
        
        const userId = subscriptionEntity?.notes?.user_id;
        if (userId) {
          // Update subscription record
          await supabase
            .from('subscriptions')
            .update({
              razorpay_subscription_id: subscriptionEntity.id,
              status: 'active',
              auto_renew: true,
            })
            .eq('user_id', userId)
            .eq('status', 'active');
        }
        break;
      }

      case 'subscription.charged': {
        // Recurring payment successful
        console.log('Subscription charged:', subscriptionEntity?.id);
        
        const userId = subscriptionEntity?.notes?.user_id;
        const plan = subscriptionEntity?.notes?.plan;
        
        if (userId && plan) {
          const currency = subscriptionEntity.plan_id?.includes('usd') ? 'USD' : 'INR';
          const amount = planPricing[plan]?.[currency] || 0;
          
          // Get user email
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single();

          // Create new invoice for renewal
          const invoiceNumber = generateInvoiceNumber();
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          // Update subscription expiry
          await supabase
            .from('subscriptions')
            .update({
              expires_at: expiresAt.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('status', 'active');

          // Create invoice
          await supabase
            .from('invoices')
            .insert({
              user_id: userId,
              invoice_number: invoiceNumber,
              plan,
              amount,
              currency,
              status: 'paid',
              razorpay_payment_id: subscriptionEntity.payment_id,
              billing_email: profile?.email,
              billing_name: profile?.full_name,
              paid_at: new Date().toISOString(),
            });

          // Send confirmation email
          if (profile?.email) {
            await supabase.functions.invoke('send-email', {
              body: {
                type: 'payment_confirmation',
                to: profile.email,
                name: profile.full_name || 'User',
                data: {
                  plan,
                  amount,
                  currency,
                  invoiceNumber,
                  invoiceDate: new Date().toLocaleDateString('en-IN'),
                },
              },
            });
          }
        }
        break;
      }

      case 'subscription.pending': {
        // Payment pending for renewal
        console.log('Subscription pending:', subscriptionEntity?.id);
        break;
      }

      case 'subscription.halted': {
        // Subscription halted due to multiple failed payments
        console.log('Subscription halted:', subscriptionEntity?.id);
        
        const userId = subscriptionEntity?.notes?.user_id;
        if (userId) {
          const gracePeriodEnds = new Date();
          gracePeriodEnds.setDate(gracePeriodEnds.getDate() + 7);

          await supabase
            .from('subscriptions')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              grace_period_ends_at: gracePeriodEnds.toISOString(),
              auto_renew: false,
            })
            .eq('user_id', userId)
            .eq('status', 'active');

          // Get user info for email
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name, plan')
            .eq('id', userId)
            .single();

          if (profile?.email) {
            await supabase.functions.invoke('send-email', {
              body: {
                type: 'cancellation_confirmation',
                to: profile.email,
                name: profile.full_name || 'User',
                data: {
                  plan: profile.plan,
                  gracePeriodEndDate: gracePeriodEnds.toLocaleDateString('en-IN'),
                },
              },
            });
          }
        }
        break;
      }

      case 'subscription.cancelled': {
        console.log('Subscription cancelled:', subscriptionEntity?.id);
        
        const userId = subscriptionEntity?.notes?.user_id;
        if (userId) {
          const gracePeriodEnds = new Date();
          gracePeriodEnds.setDate(gracePeriodEnds.getDate() + 7);

          await supabase
            .from('subscriptions')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              grace_period_ends_at: gracePeriodEnds.toISOString(),
              auto_renew: false,
            })
            .eq('user_id', userId);
        }
        break;
      }

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    // Log successful processing
    await logWebhookEvent(supabase, eventType, eventId, payload, signature, 'processed');

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failed event
    await logWebhookEvent(supabase, eventType, eventId, payload, signature, 'failed', message);
    
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
