import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Send, 
  GitBranch, 
  Shield, 
  Eye,
  ArrowRight,
  Brain,
  Cpu,
  BarChart3
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { ProxinexIcon } from "@/components/Logo";

const ProductHowItWorks = () => {
  return (
    <>
      <Helmet>
        <title>How Proxinex Works - AI Intelligence Routing Explained</title>
        <meta 
          name="description" 
          content="Learn how Proxinex routes your queries to optimal AI models, scores accuracy, and provides complete cost transparency. The AI control plane explained." 
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
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up">
                  How Proxinex Works
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  The intelligent layer between you and AI models. 
                  Understand the flow from query to verified response.
                </p>
              </div>
            </div>
          </section>

          {/* Flow Diagram */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    {
                      icon: Send,
                      step: "01",
                      title: "You Ask",
                      description: "Send any query to Proxinex—research, code, analysis, creative, or conversational."
                    },
                    {
                      icon: GitBranch,
                      step: "02",
                      title: "We Route",
                      description: "Our intelligence layer analyzes your query and routes it to the optimal model."
                    },
                    {
                      icon: Shield,
                      step: "03",
                      title: "We Verify",
                      description: "Every response is scored for accuracy and enriched with source citations."
                    },
                    {
                      icon: Eye,
                      step: "04",
                      title: "You Control",
                      description: "See model, accuracy, cost, and freshness. Dig deeper with Inline Ask™."
                    }
                  ].map((item, index) => (
                    <div 
                      key={item.step}
                      className="relative p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fade-up"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      {index < 3 && (
                        <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                          <ArrowRight className="h-6 w-6 text-primary/50" />
                        </div>
                      )}
                      <div className="text-4xl font-bold text-primary/20 mb-4">{item.step}</div>
                      <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Model Routing */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                      <Brain className="h-4 w-4" />
                      <span>Intelligent Routing</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                      The Right Model for Every Query
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Not all AI models are equal. GPT-4 excels at reasoning, Claude at analysis, 
                      Gemini at multimodal tasks. Proxinex knows which to use—and when.
                    </p>
                    <p className="text-muted-foreground">
                      Our routing engine considers task type, complexity, cost constraints, 
                      and historical performance to select the optimal model automatically.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-3xl" />
                    <div className="relative bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-center justify-center mb-6">
                        <ProxinexIcon className="h-12 w-12 text-primary" />
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { model: "GPT-4", task: "Complex Reasoning", match: 95 },
                          { model: "Claude 3.5", task: "Long-form Analysis", match: 92 },
                          { model: "Gemini Pro", task: "Multimodal Tasks", match: 88 },
                          { model: "Llama 3", task: "Code Generation", match: 85 }
                        ].map((item, index) => (
                          <div key={item.model} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <Cpu className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{item.model}</p>
                              <p className="text-xs text-muted-foreground">{item.task}</p>
                            </div>
                            <div className="text-sm font-medium text-primary">{item.match}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Accuracy Scoring */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/20 rounded-2xl blur-3xl" />
                    <div className="relative bg-card border border-border rounded-2xl p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Confidence Score</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-success w-[96%]" />
                            </div>
                            <span className="text-sm font-medium text-success">96%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Source Citations</span>
                          <span className="text-sm font-medium text-foreground">4 verified sources</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Data Freshness</span>
                          <span className="text-sm font-medium text-foreground">Real-time (Web)</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Factual Verification</span>
                          <span className="text-sm font-medium text-success">Passed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="order-1 lg:order-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                      <BarChart3 className="h-4 w-4" />
                      <span>Trust Verification</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                      Know What You Can Trust
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Every Proxinex response includes accuracy scoring based on source 
                      verification, factual cross-referencing, and confidence analysis.
                    </p>
                    <p className="text-muted-foreground">
                      No more blind trust. See exactly how reliable each answer is, 
                      where the information comes from, and how fresh the data is.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  See It in Action
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Try the Proxinex Sandbox to experience intelligent routing, 
                  accuracy scoring, and cost tracking firsthand.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link to="/sandbox">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                      Try Sandbox
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/docs">
                    <Button size="lg" variant="outline" className="border-border">
                      Read Documentation
                    </Button>
                  </Link>
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

export default ProductHowItWorks;
