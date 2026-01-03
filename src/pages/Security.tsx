import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Lock, Server, Eye, FileCheck, AlertTriangle } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Security = () => {
  return (
    <>
      <Helmet>
        <title>Security - Proxinex</title>
        <meta name="description" content="Proxinex Security. Learn about our security practices, certifications, and how we protect your data." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-16">
          {/* Hero */}
          <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Shield className="h-4 w-4" />
                  <span>Security First</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                  Security at Proxinex
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Your data security is our top priority. Learn about the measures we take 
                  to protect your information.
                </p>
              </div>
            </div>
          </section>

          {/* Security Features */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Lock,
                      title: "Encryption",
                      description: "All data encrypted in transit (TLS 1.3) and at rest (AES-256). API keys secured with industry-standard hashing."
                    },
                    {
                      icon: Server,
                      title: "Infrastructure",
                      description: "Hosted on enterprise-grade cloud infrastructure with physical security, redundancy, and disaster recovery."
                    },
                    {
                      icon: Eye,
                      title: "Access Control",
                      description: "Role-based access, multi-factor authentication, and audit logging for all system access."
                    },
                    {
                      icon: FileCheck,
                      title: "Compliance",
                      description: "SOC 2 Type II certified. GDPR, HIPAA-ready, and ISO 27001 aligned security controls."
                    },
                    {
                      icon: AlertTriangle,
                      title: "Monitoring",
                      description: "24/7 security monitoring, intrusion detection, and automated threat response systems."
                    },
                    {
                      icon: Shield,
                      title: "Penetration Testing",
                      description: "Regular third-party security audits and penetration testing by certified professionals."
                    }
                  ].map((feature, index) => (
                    <div 
                      key={feature.title}
                      className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Report Vulnerability */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Report a Vulnerability
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  If you discover a security vulnerability, please report it responsibly. 
                  We appreciate your help in keeping Proxinex secure.
                </p>
                <div className="p-6 bg-card border border-border rounded-xl">
                  <p className="text-foreground font-medium mb-2">Security Team</p>
                  <p className="text-muted-foreground">Email: security@proxinex.com</p>
                  <p className="text-muted-foreground">PGP Key available upon request</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Security;
