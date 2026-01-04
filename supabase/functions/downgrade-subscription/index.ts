import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const planOrder = ['free', 'go', 'pro'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, target_plan } = await req.json();
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    const currentPlanIndex = planOrder.indexOf(profile.plan || 'free');
    const targetPlanIndex = planOrder.indexOf(target_plan);

    if (targetPlanIndex >= currentPlanIndex) {
      throw new Error('Can only downgrade to a lower plan');
    }

    // Get active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscription) {
      // Cancel current subscription, but plan stays active until end of billing
      await supabase
        .from('subscriptions')
        .update({
          status: 'downgrade_scheduled',
          auto_renew: false,
        })
        .eq('id', subscription.id);
    }

    // If downgrading to free, update profile immediately (plan stays until expiry)
    if (target_plan === 'free' && !subscription) {
      await supabase
        .from('profiles')
        .update({
          plan: 'free',
          plan_updated_at: new Date().toISOString(),
        })
        .eq('id', user_id);
    }

    console.log('Downgrade scheduled:', { user_id, from: profile.plan, to: target_plan });

    return new Response(JSON.stringify({
      success: true,
      message: subscription 
        ? `Downgrade scheduled. Your current plan will remain active until ${new Date(subscription.expires_at).toLocaleDateString()}`
        : 'Plan downgraded successfully',
      current_plan_expires: subscription?.expires_at,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error downgrading subscription:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, success: false }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
