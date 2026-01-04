import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate invoice number
function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${year}${month}-${random}`;
}

// Plan pricing in paise/cents
const planPricing: Record<string, Record<string, number>> = {
  go: { INR: 19900, USD: 500 },
  pro: { INR: 49900, USD: 1200 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      plan, 
      user_id,
      currency = 'INR',
      user_email,
      user_name
    } = await req.json();
    
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }

    // Verify signature
    const expectedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Payment verification failed - invalid signature');
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const amount = planPricing[plan]?.[currency] || 0;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Create subscription record
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id,
        plan,
        status: 'active',
        currency,
        amount,
        razorpay_order_id,
        razorpay_payment_id,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        auto_renew: true,
      })
      .select()
      .single();

    if (subError) {
      console.error('Error creating subscription:', subError);
    }

    // Generate and save invoice
    const invoiceNumber = generateInvoiceNumber();
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id,
        subscription_id: subscription?.id,
        invoice_number: invoiceNumber,
        plan,
        amount,
        currency,
        status: 'paid',
        razorpay_payment_id,
        razorpay_order_id,
        billing_name: user_name,
        billing_email: user_email,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
    }

    // Update user's plan in profiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        plan: plan,
        plan_updated_at: new Date().toISOString(),
        razorpay_payment_id: razorpay_payment_id,
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('Error updating user plan:', updateError);
    }

    console.log('Payment verified successfully:', {
      user_id,
      plan,
      invoice_number: invoiceNumber,
      payment_id: razorpay_payment_id
    });

    // Send confirmation email
    if (user_email) {
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'payment_confirmation',
            to: user_email,
            name: user_name || 'User',
            data: {
              plan,
              amount,
              currency,
              invoiceNumber,
              invoiceDate: new Date().toLocaleDateString('en-IN'),
            },
          },
        });
        console.log('Confirmation email sent to:', user_email);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment verified successfully',
      plan,
      invoice: invoice ? {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        amount: invoice.amount,
        currency: invoice.currency,
        paid_at: invoice.paid_at,
      } : null,
      subscription: subscription ? {
        id: subscription.id,
        expires_at: subscription.expires_at,
      } : null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, success: false }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
