import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const RefundPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Refund Policy - Proxinex</title>
        <meta name="description" content="Proxinex Refund Policy. Learn about our refund and cancellation terms for paid subscriptions." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-foreground mb-2">Refund Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: August 15, 2025</p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This Refund Policy outlines the terms and conditions for refunds on Proxinex paid 
                  subscriptions and services offered by OriginX Labs PVT. LTD.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Free Tier</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Proxinex offers a free tier with limited usage. No payment is required for the free tier, 
                  and therefore no refunds apply.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Paid Subscriptions</h2>
                
                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">3.1 Monthly Plans</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monthly subscriptions are billed at the beginning of each billing cycle. You may cancel 
                  at any time, and your subscription will remain active until the end of the current billing period. 
                  <strong className="text-foreground"> We do not offer prorated refunds for unused portions of monthly plans.</strong>
                </p>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">3.2 Annual Plans</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Annual subscriptions receive a discount compared to monthly billing. If you cancel an annual 
                  subscription within the first 30 days, you may request a full refund. After 30 days, no 
                  refunds will be issued, but you will retain access until the subscription period ends.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Usage-Based Billing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Charges for API usage beyond included limits are non-refundable once the usage has occurred. 
                  These charges are based on actual consumption and are billed in arrears.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Refund Eligibility</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Refunds may be granted in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Technical issues that prevent you from using the Service and cannot be resolved</li>
                  <li>Duplicate or erroneous charges</li>
                  <li>Annual plan cancellation within 30 days of purchase</li>
                  <li>Service unavailability exceeding our SLA commitments (Enterprise plans)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Refund Process</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To request a refund:
                </p>
                <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Contact our support team at billing@proxinex.com</li>
                  <li>Provide your account email and reason for the refund request</li>
                  <li>Include relevant transaction details or invoice numbers</li>
                  <li>Allow 5-7 business days for review</li>
                </ol>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Approved refunds will be processed to the original payment method within 10-14 business days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Non-Refundable Items</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Consumed API usage credits</li>
                  <li>Monthly subscriptions after the billing period has started</li>
                  <li>Annual subscriptions after 30 days</li>
                  <li>Add-on services that have been utilized</li>
                  <li>Enterprise custom development or integration work</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cancellation</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You can cancel your subscription at any time through your account settings. Upon cancellation:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>You will retain access until the end of your current billing period</li>
                  <li>No further charges will be made</li>
                  <li>Your data will be retained for 30 days, then permanently deleted</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For billing and refund inquiries:
                </p>
                <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                  <p className="text-foreground font-medium">OriginX Labs PVT. LTD</p>
                  <p className="text-muted-foreground">Billing Support: billing@proxinex.com</p>
                  <p className="text-muted-foreground">Response Time: 24-48 hours</p>
                </div>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default RefundPolicy;
