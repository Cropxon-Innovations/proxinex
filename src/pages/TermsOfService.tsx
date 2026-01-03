import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Proxinex</title>
        <meta name="description" content="Proxinex Terms of Service. Read our terms and conditions for using the Proxinex AI Intelligence Control Plane." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: August 15, 2025</p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Proxinex, an AI Intelligence Control Plane product developed and operated by 
                  <strong className="text-foreground"> CROPXON INNOVATIONS PVT LTD</strong> ("Company", "we", "us", or "our"), 
                  a company registered in India. These Terms of Service ("Terms") govern your access to and use of 
                  the Proxinex platform, website, APIs, and related services (collectively, the "Service").
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with 
                  any part of the terms, you may not access the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Proxinex provides an AI intelligence control plane that enables users to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Route queries to optimal AI models based on task requirements</li>
                  <li>Receive accuracy scoring and confidence metrics for AI responses</li>
                  <li>Track costs associated with AI model usage</li>
                  <li>Access multiple AI models through a unified API</li>
                  <li>Use Inline Ask™ technology for contextual follow-up queries</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Beta Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Proxinex is currently in Beta phase (launched August 2025). During this period:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>The Service may contain bugs, errors, or incomplete features</li>
                  <li>We may modify, suspend, or discontinue features without notice</li>
                  <li>Service availability may be limited or interrupted</li>
                  <li>Pricing and usage limits may change</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To access certain features of the Service, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Promptly notify us of any unauthorized access</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Acceptable Use</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Generate harmful, illegal, or malicious content</li>
                  <li>Infringe upon intellectual property rights</li>
                  <li>Attempt to circumvent rate limits or security measures</li>
                  <li>Resell or redistribute the Service without authorization</li>
                  <li>Interfere with or disrupt the Service infrastructure</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Payment Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Paid features are billed in Indian Rupees (INR). By subscribing to paid plans, you agree to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Pay all applicable fees as described in our pricing</li>
                  <li>Provide valid payment information</li>
                  <li>Accept automatic renewal unless cancelled</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service and its original content, features, and functionality are owned by 
                  CROPXON INNOVATIONS PVT LTD and are protected by international copyright, trademark, 
                  and other intellectual property laws. Proxinex, Inline Ask™, and the Proxinex logo 
                  are trademarks of CROPXON INNOVATIONS PVT LTD.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, CROPXON INNOVATIONS PVT LTD shall not be liable 
                  for any indirect, incidental, special, consequential, or punitive damages arising from 
                  your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of India. 
                  Any disputes arising from these Terms shall be subject to the exclusive jurisdiction 
                  of the courts in Bangalore, Karnataka, India.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                  <p className="text-foreground font-medium">CROPXON INNOVATIONS PVT LTD</p>
                  <p className="text-muted-foreground">Email: legal@proxinex.com</p>
                  <p className="text-muted-foreground">Website: <a href="https://www.cropxon.com/" className="text-primary hover:underline">www.cropxon.com</a></p>
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

export default TermsOfService;
