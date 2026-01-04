import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Running renewal reminder job at:', new Date().toISOString());

    // Find subscriptions expiring in 7 days or 3 days
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Get active subscriptions expiring in the next 7 days
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan,
        amount,
        currency,
        expires_at,
        auto_renew
      `)
      .eq('status', 'active')
      .eq('auto_renew', true)
      .gte('expires_at', now.toISOString())
      .lte('expires_at', sevenDaysFromNow.toISOString());

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions expiring soon`);

    const emailsSent: string[] = [];
    const errors: string[] = [];

    for (const subscription of subscriptions || []) {
      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', subscription.user_id)
          .single();

        if (!profile?.email) {
          console.log(`No email found for user ${subscription.user_id}`);
          continue;
        }

        // Calculate days until renewal
        const expiresAt = new Date(subscription.expires_at);
        const daysUntilRenewal = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Only send reminders at 7 days and 3 days
        if (daysUntilRenewal !== 7 && daysUntilRenewal !== 3) {
          continue;
        }

        console.log(`Sending ${daysUntilRenewal}-day reminder to ${profile.email}`);

        const amount = planPricing[subscription.plan]?.[subscription.currency] || subscription.amount;

        // Send renewal reminder email
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            type: 'subscription_renewal_reminder',
            to: profile.email,
            name: profile.full_name || 'User',
            data: {
              plan: subscription.plan,
              amount,
              currency: subscription.currency,
              renewalDate: expiresAt.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              daysUntilRenewal,
            },
          },
        });

        if (emailError) {
          console.error(`Failed to send email to ${profile.email}:`, emailError);
          errors.push(`${profile.email}: ${emailError.message}`);
        } else {
          emailsSent.push(profile.email);
          console.log(`Successfully sent reminder to ${profile.email}`);
        }
      } catch (err) {
        console.error(`Error processing subscription ${subscription.id}:`, err);
        errors.push(`Subscription ${subscription.id}: ${err}`);
      }
    }

    console.log(`Renewal reminder job completed. Sent: ${emailsSent.length}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${subscriptions?.length || 0} subscriptions`,
        emailsSent: emailsSent.length,
        errors: errors.length,
        details: {
          sent: emailsSent,
          errors,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Renewal reminder job error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});