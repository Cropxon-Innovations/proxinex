import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceData {
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

function generateInvoiceHTML(invoice: InvoiceData): string {
  const formattedAmount = invoice.currency === 'INR' 
    ? `₹${(invoice.amount / 100).toFixed(2)}` 
    : `$${(invoice.amount / 100).toFixed(2)}`;
  
  const invoiceDate = invoice.paid_at 
    ? new Date(invoice.paid_at).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : new Date(invoice.created_at).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

  const planDetails: Record<string, { name: string; description: string }> = {
    go: { name: 'Go Plan', description: '500 queries/day, Documents, Notebooks, Full Research, Email support' },
    pro: { name: 'Pro Plan', description: 'Unlimited queries, Images, Video, Sandbox, API Access, Priority support' },
  };

  const plan = planDetails[invoice.plan] || { name: invoice.plan, description: 'Subscription plan' };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #fff;
          color: #18181b;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 48px;
          border-bottom: 2px solid #6366f1;
          padding-bottom: 24px;
        }
        .logo {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h1 {
          font-size: 32px;
          color: #18181b;
          margin-bottom: 8px;
        }
        .invoice-number {
          color: #71717a;
          font-size: 14px;
        }
        .invoice-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 48px;
        }
        .meta-section h3 {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #71717a;
          margin-bottom: 8px;
        }
        .meta-section p {
          font-size: 14px;
          line-height: 1.6;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }
        .status-paid {
          background: #dcfce7;
          color: #166534;
        }
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
        }
        .items-table th {
          background: #f4f4f5;
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #71717a;
          border-bottom: 1px solid #e4e4e7;
        }
        .items-table td {
          padding: 16px;
          border-bottom: 1px solid #e4e4e7;
        }
        .items-table .description {
          font-size: 12px;
          color: #71717a;
          margin-top: 4px;
        }
        .items-table .amount {
          text-align: right;
          font-weight: 500;
        }
        .totals {
          margin-left: auto;
          width: 300px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .totals-row.total {
          border-top: 2px solid #18181b;
          margin-top: 8px;
          padding-top: 16px;
          font-size: 18px;
          font-weight: 700;
        }
        .totals-row.total .amount {
          color: #6366f1;
        }
        .footer {
          margin-top: 64px;
          padding-top: 24px;
          border-top: 1px solid #e4e4e7;
          text-align: center;
          color: #71717a;
          font-size: 12px;
        }
        .footer p {
          margin-bottom: 4px;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Proxinex</div>
        <div class="invoice-title">
          <h1>INVOICE</h1>
          <p class="invoice-number">${invoice.invoice_number}</p>
        </div>
      </div>
      
      <div class="invoice-meta">
        <div class="meta-section">
          <h3>Billed To</h3>
          <p>
            <strong>${invoice.billing_name || 'Customer'}</strong><br>
            ${invoice.billing_email || ''}
          </p>
        </div>
        <div class="meta-section" style="text-align: right;">
          <h3>Invoice Details</h3>
          <p>
            <strong>Date:</strong> ${invoiceDate}<br>
            <strong>Status:</strong> <span class="status-badge status-${invoice.status}">${invoice.status}</span>
          </p>
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${plan.name}</strong>
              <p class="description">${plan.description}</p>
            </td>
            <td>1</td>
            <td class="amount">${formattedAmount}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${formattedAmount}</span>
        </div>
        <div class="totals-row">
          <span>Tax</span>
          <span>${invoice.currency === 'INR' ? '₹0.00' : '$0.00'}</span>
        </div>
        <div class="totals-row total">
          <span>Total</span>
          <span class="amount">${formattedAmount}</span>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>Proxinex</strong></p>
        <p>Thank you for your business!</p>
        <p>For questions, contact support@proxinex.com</p>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { invoice_id } = await req.json();

    if (!invoice_id) {
      throw new Error('Invoice ID is required');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    // Generate HTML
    const html = generateInvoiceHTML(invoice as InvoiceData);

    return new Response(JSON.stringify({ 
      success: true, 
      html,
      invoice_number: invoice.invoice_number,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error generating invoice:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, success: false }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
