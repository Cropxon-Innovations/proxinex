import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const GDPRPolicy = () => {
  return (
    <>
      <Helmet>
        <title>GDPR Compliance - Proxinex</title>
        <meta name="description" content="Proxinex GDPR Compliance. Learn about your rights under the General Data Protection Regulation." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-foreground mb-2">GDPR Compliance</h1>
            <p className="text-muted-foreground mb-8">Last updated: August 15, 2025</p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  OriginX Labs PVT. LTD is committed to protecting the personal data of individuals 
                  in the European Economic Area (EEA), United Kingdom, and Switzerland in accordance with 
                  the General Data Protection Regulation (GDPR).
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  This page explains your rights under GDPR and how we ensure compliance when processing 
                  your personal data through Proxinex.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Data Controller</h2>
                <div className="p-4 bg-card border border-border rounded-lg">
                  <p className="text-foreground font-medium">OriginX Labs PVT. LTD</p>
                  <p className="text-muted-foreground">Operating as: Proxinex</p>
                  <p className="text-muted-foreground">Data Protection Officer: dpo@proxinex.com</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Legal Basis for Processing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We process personal data under the following legal bases:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-4 mt-4">
                  <li>
                    <strong className="text-foreground">Contract Performance (Article 6(1)(b)):</strong> Processing necessary 
                    to provide the Proxinex service as agreed in our Terms of Service.
                  </li>
                  <li>
                    <strong className="text-foreground">Legitimate Interests (Article 6(1)(f)):</strong> Processing for 
                    service improvement, security, and fraud prevention.
                  </li>
                  <li>
                    <strong className="text-foreground">Consent (Article 6(1)(a)):</strong> Where you have explicitly 
                    consented, such as for marketing communications.
                  </li>
                  <li>
                    <strong className="text-foreground">Legal Obligation (Article 6(1)(c)):</strong> When required 
                    by applicable law.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Your GDPR Rights</h2>
                
                <div className="space-y-6 mt-6">
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <h3 className="text-lg font-medium text-foreground mb-2">Right of Access (Article 15)</h3>
                    <p className="text-muted-foreground text-sm">
                      You can request a copy of all personal data we hold about you.
                    </p>
                  </div>

                  <div className="p-4 bg-card border border-border rounded-lg">
                    <h3 className="text-lg font-medium text-foreground mb-2">Right to Rectification (Article 16)</h3>
                    <p className="text-muted-foreground text-sm">
                      You can request correction of inaccurate or incomplete personal data.
                    </p>
                  </div>

                  <div className="p-4 bg-card border border-border rounded-lg">
                    <h3 className="text-lg font-medium text-foreground mb-2">Right to Erasure (Article 17)</h3>
                    <p className="text-muted-foreground text-sm">
                      You can request deletion of your personal data ("right to be forgotten").
                    </p>
                  </div>

                  <div className="p-4 bg-card border border-border rounded-lg">
                    <h3 className="text-lg font-medium text-foreground mb-2">Right to Restrict Processing (Article 18)</h3>
                    <p className="text-muted-foreground text-sm">
                      You can request limitation of processing in certain circumstances.
                    </p>
                  </div>

                  <div className="p-4 bg-card border border-border rounded-lg">
                    <h3 className="text-lg font-medium text-foreground mb-2">Right to Data Portability (Article 20)</h3>
                    <p className="text-muted-foreground text-sm">
                      You can receive your data in a structured, machine-readable format.
                    </p>
                  </div>

                  <div className="p-4 bg-card border border-border rounded-lg">
                    <h3 className="text-lg font-medium text-foreground mb-2">Right to Object (Article 21)</h3>
                    <p className="text-muted-foreground text-sm">
                      You can object to processing based on legitimate interests or for direct marketing.
                    </p>
                  </div>

                  <div className="p-4 bg-card border border-border rounded-lg">
                    <h3 className="text-lg font-medium text-foreground mb-2">Rights Related to Automated Decision-Making (Article 22)</h3>
                    <p className="text-muted-foreground text-sm">
                      You can request human intervention in automated decisions that significantly affect you.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When we transfer personal data outside the EEA, we ensure appropriate safeguards:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                  <li>Transfers to countries with adequacy decisions</li>
                  <li>Binding Corporate Rules where applicable</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Processing Agreements</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For enterprise customers, we offer Data Processing Agreements (DPAs) that comply with 
                  GDPR Article 28 requirements. Contact enterprise@proxinex.com to request a DPA.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Protection Impact Assessments</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We conduct Data Protection Impact Assessments (DPIAs) for processing activities that 
                  may result in high risk to individuals' rights and freedoms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Breach Notification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In the event of a personal data breach that poses a risk to individuals' rights and 
                  freedoms, we will notify the relevant supervisory authority within 72 hours and 
                  affected individuals without undue delay.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Exercising Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To exercise any of your GDPR rights, contact us at:
                </p>
                <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                  <p className="text-foreground font-medium">Data Protection Officer</p>
                  <p className="text-muted-foreground">Email: dpo@proxinex.com</p>
                  <p className="text-muted-foreground">Response Time: Within 30 days</p>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  You may also lodge a complaint with your local Data Protection Authority.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Supervisory Authority</h2>
                <p className="text-muted-foreground leading-relaxed">
                  While we are based in India, we cooperate with EU Data Protection Authorities regarding 
                  GDPR compliance matters. You have the right to lodge a complaint with your local 
                  supervisory authority.
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default GDPRPolicy;
