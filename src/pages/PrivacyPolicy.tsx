import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Proxinex</title>
        <meta name="description" content="Proxinex Privacy Policy. Learn how we collect, use, and protect your personal information." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: August 15, 2025</p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  OriginX Labs PVT. LTD ("Company", "we", "us", or "our") operates Proxinex, 
                  an AI Intelligence Control Plane. This Privacy Policy explains how we collect, use, 
                  disclose, and safeguard your information when you use our Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.1 Personal Information</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Name and email address</li>
                  <li>Account credentials</li>
                  <li>Payment information (processed securely via third-party providers)</li>
                  <li>Communication preferences</li>
                </ul>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.2 Usage Information</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Queries submitted to the Service</li>
                  <li>API usage patterns and statistics</li>
                  <li>Device and browser information</li>
                  <li>IP addresses and location data</li>
                </ul>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.3 AI Interaction Data</h3>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Prompts and queries sent to AI models</li>
                  <li>Model responses and metadata</li>
                  <li>Feedback and rating data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>To provide and maintain the Service</li>
                  <li>To process transactions and billing</li>
                  <li>To improve our AI routing and accuracy algorithms</li>
                  <li>To send administrative communications</li>
                  <li>To respond to customer support requests</li>
                  <li>To detect and prevent fraud or abuse</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We may share data with:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li><strong className="text-foreground">AI Model Providers:</strong> Queries are sent to third-party AI providers (e.g., OpenAI, Anthropic, Google) to generate responses</li>
                  <li><strong className="text-foreground">Service Providers:</strong> Third parties who assist in operating our Service</li>
                  <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your data for as long as your account is active or as needed to provide the Service. 
                  Chat history and query logs are retained for 90 days by default, after which they are 
                  automatically deleted. You can request earlier deletion through your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures including:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure data centers with physical security</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use essential cookies to operate the Service and optional analytics cookies 
                  to improve user experience. You can manage cookie preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Service is not intended for users under 18 years of age. We do not knowingly 
                  collect personal information from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For privacy-related inquiries:
                </p>
                <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                  <p className="text-foreground font-medium">Data Protection Officer</p>
                  <p className="text-foreground">OriginX Labs PVT. LTD</p>
                  <p className="text-muted-foreground">Email: privacy@proxinex.com</p>
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

export default PrivacyPolicy;
