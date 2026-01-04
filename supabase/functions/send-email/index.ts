import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "payment_confirmation" | "subscription_renewal_reminder" | "cancellation_confirmation";
  to: string;
  name: string;
  data: Record<string, any>;
}

function getPaymentConfirmationEmail(name: string, data: Record<string, any>) {
  const { plan, amount, currency, invoiceNumber, invoiceDate } = data;
  const formattedAmount = currency === "INR" ? `₹${amount / 100}` : `$${amount / 100}`;
  
  return {
    subject: "Payment Confirmed - Proxinex",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Payment Successful! ✓</h1>
          </div>
          <div style="padding: 32px; color: #fafafa;">
            <p style="margin: 0 0 16px;">Hello ${name},</p>
            <p style="margin: 0 0 24px; color: #a1a1aa;">Thank you for your payment. Your subscription has been activated.</p>
            
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px; color: #fafafa;">Invoice Details</h3>
              <table style="width: 100%; color: #a1a1aa; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0;">Invoice Number:</td>
                  <td style="text-align: right; color: #fafafa;">${invoiceNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Date:</td>
                  <td style="text-align: right; color: #fafafa;">${invoiceDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Plan:</td>
                  <td style="text-align: right; color: #fafafa;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</td>
                </tr>
                <tr style="border-top: 1px solid rgba(255,255,255,0.1);">
                  <td style="padding: 16px 0 8px; font-weight: bold; color: #fafafa;">Total:</td>
                  <td style="text-align: right; font-weight: bold; color: #6366f1; font-size: 18px;">${formattedAmount}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 14px;">
              You can view and download your invoice anytime from your account settings.
            </p>
            
            <a href="https://proxinex.com/app/settings" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">
              View My Account
            </a>
          </div>
          <div style="padding: 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0; color: #71717a; font-size: 12px;">
              © ${new Date().getFullYear()} Proxinex. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

function getRenewalReminderEmail(name: string, data: Record<string, any>) {
  const { plan, amount, currency, renewalDate, daysUntilRenewal } = data;
  const formattedAmount = currency === "INR" ? `₹${amount / 100}` : `$${amount / 100}`;
  
  return {
    subject: `Subscription Renewal Reminder - ${daysUntilRenewal} days left`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Renewal Reminder 📅</h1>
          </div>
          <div style="padding: 32px; color: #fafafa;">
            <p style="margin: 0 0 16px;">Hello ${name},</p>
            <p style="margin: 0 0 24px; color: #a1a1aa;">Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} subscription will renew in <strong style="color: #f59e0b;">${daysUntilRenewal} days</strong>.</p>
            
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 16px; color: #fafafa;">Renewal Details</h3>
              <table style="width: 100%; color: #a1a1aa; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0;">Plan:</td>
                  <td style="text-align: right; color: #fafafa;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Renewal Date:</td>
                  <td style="text-align: right; color: #fafafa;">${renewalDate}</td>
                </tr>
                <tr style="border-top: 1px solid rgba(255,255,255,0.1);">
                  <td style="padding: 16px 0 8px; font-weight: bold; color: #fafafa;">Amount:</td>
                  <td style="text-align: right; font-weight: bold; color: #f59e0b; font-size: 18px;">${formattedAmount}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 14px;">
              No action needed - your subscription will automatically renew. If you wish to make changes, please visit your account settings.
            </p>
            
            <a href="https://proxinex.com/app/settings" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">
              Manage Subscription
            </a>
          </div>
          <div style="padding: 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0; color: #71717a; font-size: 12px;">
              © ${new Date().getFullYear()} Proxinex. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

function getCancellationConfirmationEmail(name: string, data: Record<string, any>) {
  const { plan, gracePeriodEndDate } = data;
  
  return {
    subject: "Subscription Cancelled - Proxinex",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Subscription Cancelled</h1>
          </div>
          <div style="padding: 32px; color: #fafafa;">
            <p style="margin: 0 0 16px;">Hello ${name},</p>
            <p style="margin: 0 0 24px; color: #a1a1aa;">We're sorry to see you go. Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} subscription has been cancelled.</p>
            
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px; color: #fafafa;">⚠️ Important</h3>
              <p style="margin: 0; color: #a1a1aa; font-size: 14px;">
                Your current plan features will remain active until <strong style="color: #ef4444;">${gracePeriodEndDate}</strong>. 
                After this date, your account will be downgraded to the Free plan.
              </p>
            </div>
            
            <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 14px;">
              Changed your mind? You can reactivate your subscription anytime before the grace period ends.
            </p>
            
            <a href="https://proxinex.com/app/settings" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500;">
              Reactivate Subscription
            </a>
          </div>
          <div style="padding: 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0; color: #71717a; font-size: 12px;">
              © ${new Date().getFullYear()} Proxinex. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, name, data }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${to}`);

    let emailContent;
    switch (type) {
      case "payment_confirmation":
        emailContent = getPaymentConfirmationEmail(name, data);
        break;
      case "subscription_renewal_reminder":
        emailContent = getRenewalReminderEmail(name, data);
        break;
      case "cancellation_confirmation":
        emailContent = getCancellationConfirmationEmail(name, data);
        break;
      default:
        throw new Error("Invalid email type");
    }

    const emailResponse = await resend.emails.send({
      from: "Proxinex <noreply@proxinex.com>",
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
