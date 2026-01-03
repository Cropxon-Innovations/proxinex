import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Shield, 
  Lock, 
  Users,
  BarChart3,
  Headphones,
  Server,
  FileCheck,
  ArrowRight
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const ProductEnterprise = () => {
  return (
    <>
      <Helmet>
        <title>Enterprise - Proxinex for Business | AI Control at Scale</title>
        <meta 
          name="description" 
          content="Proxinex Enterprise: SSO, dedicated infrastructure, compliance certifications, SLA guarantees, and 24/7 support for large-scale AI deployments." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-16">
          {/* Hero */}
          <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
                  <Building2 className="h-4 w-4" />
                  <span>Enterprise Grade</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  AI Control at Scale
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
                  Enterprise-grade security, compliance, and support. 
                  Deploy Proxinex across your organization with confidence.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                  <Link to="/contact">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                      Contact Sales
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/docs">
                    <Button size="lg" variant="outline" className="border-border">
                      View Documentation
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Enterprise Features
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: Lock,
                      title: "SSO & SAML",
                      description: "Single Sign-On with your existing identity provider. Okta, Azure AD, Google Workspace."
                    },
                    {
                      icon: Server,
                      title: "Dedicated Infrastructure",
                      description: "Isolated compute and storage. Your data never touches shared resources."
                    },
                    {
                      icon: Shield,
                      title: "SOC 2 Type II",
                      description: "Certified security controls. Annual audits and continuous monitoring."
                    },
                    {
                      icon: FileCheck,
                      title: "GDPR Compliant",
                      description: "Full data protection compliance. DPA and BAA agreements available."
                    },
                    {
                      icon: Users,
                      title: "Team Management",
                      description: "Role-based access control. Departments, projects, and permission groups."
                    },
                    {
                      icon: BarChart3,
                      title: "Advanced Analytics",
                      description: "Usage dashboards, cost allocation, and custom reporting APIs."
                    },
                    {
                      icon: Headphones,
                      title: "24/7 Support",
                      description: "Dedicated account manager. Priority support with guaranteed response times."
                    },
                    {
                      icon: Building2,
                      title: "Custom SLA",
                      description: "99.99% uptime guarantee. Custom SLAs based on your requirements."
                    }
                  ].map((feature, index) => (
                    <div 
                      key={feature.title}
                      className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fade-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
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

          {/* Compliance */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Security & Compliance
                </h2>
                <p className="text-lg text-muted-foreground mb-12">
                  Proxinex meets the highest standards for security and data protection.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {["SOC 2 Type II", "GDPR", "HIPAA Ready", "ISO 27001"].map((cert, index) => (
                    <div 
                      key={cert}
                      className="p-6 rounded-xl bg-card border border-border animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                      <p className="font-semibold text-foreground">{cert}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Ready to Scale?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Talk to our enterprise team about your requirements. 
                  Custom pricing and deployment options available.
                </p>
                <Link to="/contact">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                    Contact Enterprise Sales
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductEnterprise;
