import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen,
  Clock,
  Target,
  ArrowRight
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const ProductTrust = () => {
  return (
    <>
      <Helmet>
        <title>Trust & Accuracy - Verified AI Responses | Proxinex</title>
        <meta 
          name="description" 
          content="Every Proxinex response includes accuracy scoring, source citations, and freshness indicators. Know what to trust with verified AI." 
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
                  <Shield className="h-4 w-4" />
                  <span>Trust Layer</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  Trust & Accuracy
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
                  AI responses you can verify. Every answer includes accuracy scoring, 
                  source citations, and data freshness indicators.
                </p>
              </div>
            </div>
          </section>

          {/* Trust Indicators */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Three Pillars of Trust
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Target,
                      title: "Accuracy Score",
                      description: "Every response includes a confidence percentage based on source verification and factual cross-referencing.",
                      example: "96% Confidence"
                    },
                    {
                      icon: BookOpen,
                      title: "Source Citations",
                      description: "See exactly where information comes from. Click through to verify sources yourself.",
                      example: "4 Verified Sources"
                    },
                    {
                      icon: Clock,
                      title: "Data Freshness",
                      description: "Know when the information is from. Real-time web data or model training cutoff.",
                      example: "Updated 2 hours ago"
                    }
                  ].map((item, index) => (
                    <div 
                      key={item.title}
                      className="p-8 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fade-up"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="p-4 rounded-xl bg-primary/10 text-primary w-fit mb-6">
                        <item.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                      <p className="text-muted-foreground mb-4">{item.description}</p>
                      <div className="px-3 py-2 bg-secondary/50 rounded-lg inline-block">
                        <span className="text-sm font-medium text-primary">{item.example}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Confidence Levels */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Understanding Confidence Levels
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Proxinex categorizes every response by confidence level
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      level: "High Confidence",
                      range: "90-100%",
                      icon: CheckCircle2,
                      color: "text-success",
                      bgColor: "bg-success/10",
                      description: "Multiple verified sources confirm the information. Safe to cite and act upon."
                    },
                    {
                      level: "Medium Confidence",
                      range: "70-89%",
                      icon: AlertTriangle,
                      color: "text-warning",
                      bgColor: "bg-warning/10",
                      description: "Some verification available. Recommend additional research for critical decisions."
                    },
                    {
                      level: "Low Confidence",
                      range: "Below 70%",
                      icon: AlertTriangle,
                      color: "text-destructive",
                      bgColor: "bg-destructive/10",
                      description: "Limited verification. Use as a starting point only. Cross-reference before acting."
                    }
                  ].map((item, index) => (
                    <div 
                      key={item.level}
                      className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-xl bg-card border border-border animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`p-3 rounded-lg ${item.bgColor} ${item.color}`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{item.level}</h3>
                          <span className={`text-sm font-medium ${item.color}`}>{item.range}</span>
                        </div>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
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
                  Experience Verified AI
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Try Proxinex and see accuracy scoring in action. 
                  Every response, verified and transparent.
                </p>
                <Link to="/app">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                    Start Free
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

export default ProductTrust;
