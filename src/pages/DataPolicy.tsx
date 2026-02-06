import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const DataPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Data Policy - Proxinex</title>
        <meta name="description" content="Proxinex Data Policy. Learn how we handle, process, and protect your data across our AI Intelligence Control Plane." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-bold text-foreground mb-2">Data Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: August 15, 2025</p>

            <div className="prose prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This Data Policy explains how OriginX Labs PVT. LTD handles data within the 
                  Proxinex AI Intelligence Control Plane. We are committed to transparency about our 
                  data practices and protecting your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Data Categories</h2>
                
                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.1 Account Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Information you provide when creating an account, including name, email, and organization details.
                </p>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.2 Query Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Prompts and queries you submit to Proxinex for processing by AI models.
                </p>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.3 Response Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI-generated responses, accuracy scores, and metadata associated with each query.
                </p>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">2.4 Usage Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  API usage statistics, model preferences, and performance metrics.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Processing</h2>
                
                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">3.1 AI Model Routing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you submit a query, Proxinex analyzes it to determine the optimal AI model. 
                  Your query is then forwarded to one or more third-party AI providers (such as OpenAI, 
                  Anthropic, or Google) for processing.
                </p>

                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">3.2 Third-Party AI Providers</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Each AI provider has their own data handling policies. By using Proxinex, you 
                  acknowledge that your queries may be processed by these providers according to 
                  their respective terms:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>OpenAI (GPT models)</li>
                  <li>Anthropic (Claude models)</li>
                  <li>Google (Gemini models)</li>
                  <li>Meta (Llama models, via hosting providers)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Storage</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Data is stored in secure cloud infrastructure with the following characteristics:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Primary data centers located in India and Singapore</li>
                  <li>Encryption at rest using AES-256</li>
                  <li>Encryption in transit using TLS 1.3</li>
                  <li>Regular backups with geographic redundancy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Retention</h2>
                <table className="w-full mt-4 border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-foreground font-medium">Data Type</th>
                      <th className="text-left py-3 text-foreground font-medium">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <td className="py-3">Account Data</td>
                      <td className="py-3">Until account deletion + 30 days</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3">Chat History</td>
                      <td className="py-3">90 days (default, configurable)</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3">API Logs</td>
                      <td className="py-3">30 days</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3">Usage Statistics</td>
                      <td className="py-3">12 months (aggregated)</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3">Billing Records</td>
                      <td className="py-3">7 years (legal requirement)</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Use for Training</h2>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Proxinex does not use your queries or responses to train AI models.</strong> 
                  However, we may use aggregated, anonymized usage patterns to improve our routing algorithms 
                  and accuracy scoring systems.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Export</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You can export your data at any time through:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Account Settings → Data Export</li>
                  <li>API endpoint: GET /v1/user/export</li>
                  <li>Request to privacy@proxinex.com</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Deletion</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To delete your data:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                  <li>Individual chat sessions: Delete from Chat History</li>
                  <li>All query data: Account Settings → Clear History</li>
                  <li>Complete account deletion: Settings → Delete Account</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Deletion is permanent and cannot be undone. Some data may be retained in backups 
                  for up to 30 days before permanent deletion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact</h2>
                <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                  <p className="text-foreground font-medium">Data Protection Officer</p>
                  <p className="text-foreground">OriginX Labs PVT. LTD</p>
                  <p className="text-muted-foreground">Email: data@proxinex.com</p>
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

export default DataPolicy;
