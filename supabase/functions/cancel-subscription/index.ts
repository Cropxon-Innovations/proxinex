import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscription_id, user_id } = await req.json();
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get current subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscription_id)
      .eq('user_id', user_id)
      .single();

    if (fetchError || !subscription) {
      throw new Error('Subscription not found');
    }

    // Check if cancellation is allowed (3 days before expiration)
    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    const threeDaysBeforeExpiry = new Date(expiresAt);
    threeDaysBeforeExpiry.setDate(threeDaysBeforeExpiry.getDate() - 3);

    if (now > threeDaysBeforeExpiry) {
      throw new Error('Cannot cancel subscription within 3 days of expiration. Your plan will continue until the end of the billing period.');
    }

    // Calculate grace period (7 days from now)
    const gracePeriodEnds = new Date();
    gracePeriodEnds.setDate(gracePeriodEnds.getDate() + 7);

    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        grace_period_ends_at: gracePeriodEnds.toISOString(),
        auto_renew: false,
      })
      .eq('id', subscription_id);

    if (updateError) {
      throw new Error('Failed to cancel subscription');
    }

    console.log('Subscription cancelled:', { subscription_id, user_id, grace_period_ends: gracePeriodEnds });

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, plan')
      .eq('id', user_id)
      .single();

    // Send cancellation confirmation email
    if (profile?.email) {
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'cancellation_confirmation',
            to: profile.email,
            name: profile.full_name || 'User',
            data: {
              plan: profile.plan || subscription.plan,
              gracePeriodEndDate: gracePeriodEnds.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            },
          },
        });
        console.log('Cancellation email sent to:', profile.email);
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Subscription cancelled successfully',
      grace_period_ends_at: gracePeriodEnds.toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error cancelling subscription:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, success: false }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
