import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Zap, 
  Shield, 
  DollarSign, 
  Layers, 
  Brain, 
  Target,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { ProxinexIcon } from "@/components/Logo";

const features = [
  {
    icon: Brain,
    title: "Intelligent Model Routing",
    description: "Automatically route queries to the optimal AI model based on task complexity, accuracy requirements, and cost constraints."
  },
  {
    icon: Shield,
    title: "Trust & Accuracy Scoring",
    description: "Every response includes a confidence score, freshness indicator, and source citations so you know exactly what to trust."
  },
  {
    icon: DollarSign,
    title: "Real-Time Cost Tracking",
    description: "See the exact cost of every query before and after execution. Set budgets, track usage, and optimize spending."
  },
  {
    icon: Layers,
    title: "Multi-Model Orchestration",
    description: "Access GPT-4, Claude, Gemini, Llama, and more through a single unified API. No vendor lock-in."
  },
  {
    icon: Target,
    title: "Inline Ask™ Technology",
    description: "Highlight any part of an AI response and ask follow-up questions. Deep-dive without losing context."
  },
  {
    icon: Zap,
    title: "Real-Time Research",
    description: "Web-grounded responses with live data. Never get stale answers from training cutoffs again."
  }
];

const ProductOverview = () => {
  return (
    <>
      <Helmet>
        <title>Product Overview - Proxinex AI Intelligence Control Plane</title>
        <meta 
          name="description" 
          content="Discover how Proxinex gives you complete control over AI. Intelligent routing, accuracy scoring, cost tracking, and multi-model orchestration." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-16">
          {/* Hero Section */}
          <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
            
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
                  <ProxinexIcon className="h-5 w-5" />
                  <span>The AI Intelligence Control Plane</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  Control Your AI.
                  <br />
                  <span className="text-primary">Trust Your Results.</span>
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
                  Proxinex is the control layer between you and AI. Route to optimal models, 
                  verify accuracy, track costs, and dig deeper into any answer.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                  <Link to="/app">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                      Start Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/sandbox">
                    <Button size="lg" variant="outline" className="border-border">
                      Try Sandbox
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Everything You Need to Control AI
                </h2>
                <p className="text-lg text-muted-foreground">
                  From intelligent routing to deep accuracy verification—Proxinex gives you 
                  complete visibility and control.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:glow transition-all duration-300 animate-fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Preview */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                      AI That Works <span className="text-primary">For You</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                      Unlike traditional AI tools that operate as black boxes, Proxinex 
                      puts you in complete control of every interaction.
                    </p>

                    <ul className="space-y-4">
                      {[
                        "See which model answered your query",
                        "Verify accuracy with confidence scores",
                        "Track exact costs per request",
                        "Dig deeper with Inline Ask™",
                        "Get real-time, web-grounded data"
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8">
                      <Link to="/product/how-it-works">
                        <Button variant="outline" className="border-border">
                          Learn How It Works
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-3xl" />
                    <div className="relative bg-card border border-border rounded-2xl p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <ProxinexIcon className="h-8 w-8 text-primary" />
                        <span className="font-semibold text-foreground">Proxinex Response</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Model</span>
                          <span className="text-sm font-medium text-foreground">Claude 3.5 Sonnet</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Accuracy</span>
                          <span className="text-sm font-medium text-success">96%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Cost</span>
                          <span className="text-sm font-medium text-foreground">₹0.018</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Freshness</span>
                          <span className="text-sm font-medium text-foreground">Real-time</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Ready to Take Control?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join the beta and experience AI the way it should be—transparent, 
                  accurate, and cost-effective.
                </p>
                <Link to="/app">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                    Start Free Beta
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

export default ProductOverview;
