import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  MousePointer2, 
  MessageSquare, 
  Layers, 
  Zap,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useState } from "react";

const ProductInlineAsk = () => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const demoText = "Quantum computing leverages quantum mechanical phenomena like superposition and entanglement to process information in fundamentally different ways than classical computers. While classical bits can only be 0 or 1, quantum bits (qubits) can exist in multiple states simultaneously.";

  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Inline Ask™ - Deep Dive into Any AI Response | Proxinex</title>
        <meta 
          name="description" 
          content="Inline Ask™ lets you highlight any part of an AI response and ask follow-up questions. Deep-dive into answers without losing context." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-16">
          {/* Hero Section */}
          <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
                  <Sparkles className="h-4 w-4" />
                  <span>Proxinex Exclusive Feature</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  Inline Ask™
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
                  The revolutionary way to explore AI responses. Highlight any text, 
                  ask a question, and get instant, contextual answers.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                  <Link to="/app">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                      Try Inline Ask™
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Demo */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Try It Yourself
                  </h2>
                  <p className="text-muted-foreground">
                    Select any text below to see Inline Ask™ in action
                  </p>
                </div>

                <div className="relative">
                  <div className="bg-card border border-border rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <div className="w-3 h-3 rounded-full bg-success" />
                    </div>

                    <p 
                      className="text-lg text-foreground leading-relaxed cursor-text select-text"
                      onMouseUp={handleTextSelect}
                    >
                      {demoText}
                    </p>

                    {showTooltip && selectedText && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 mt-4 z-50 animate-fade-up">
                        <div className="bg-popover border border-border rounded-lg shadow-xl p-4 w-72">
                          <p className="text-xs text-muted-foreground mb-2">Selected: "{selectedText.slice(0, 30)}..."</p>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              placeholder="Ask about this..."
                              className="flex-1 bg-secondary/50 border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                            />
                            <Button size="sm" className="bg-primary text-primary-foreground">
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    How Inline Ask™ Works
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: MousePointer2,
                      step: "01",
                      title: "Select Text",
                      description: "Highlight any part of an AI response that you want to explore further."
                    },
                    {
                      icon: MessageSquare,
                      step: "02",
                      title: "Ask Your Question",
                      description: "Type your follow-up question about the selected text in the popup."
                    },
                    {
                      icon: Zap,
                      step: "03",
                      title: "Get Instant Context",
                      description: "Receive a focused answer that builds on the original response."
                    }
                  ].map((item, index) => (
                    <div 
                      key={item.step}
                      className="relative p-6 rounded-xl bg-card border border-border animate-fade-up"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="text-4xl font-bold text-primary/20 mb-4">{item.step}</div>
                      <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                      Why Inline Ask™ Changes Everything
                    </h2>
                    
                    <div className="space-y-6">
                      {[
                        {
                          icon: Layers,
                          title: "Never Lose Context",
                          description: "Follow-up questions maintain full awareness of the original response."
                        },
                        {
                          icon: Zap,
                          title: "Faster Research",
                          description: "Drill down into specific concepts without starting new conversations."
                        },
                        {
                          icon: Sparkles,
                          title: "Deeper Understanding",
                          description: "Explore complex topics layer by layer, at your own pace."
                        }
                      ].map((benefit, index) => (
                        <div key={benefit.title} className="flex gap-4 animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit">
                            <benefit.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                            <p className="text-sm text-muted-foreground">{benefit.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-3xl" />
                    <div className="relative bg-card border border-border rounded-2xl overflow-hidden">
                      <div className="p-4 border-b border-border bg-secondary/30">
                        <span className="text-sm font-medium text-foreground">Inline Ask™ Thread</span>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Original text</p>
                          <p className="text-sm text-foreground">"quantum bits (qubits) can exist in multiple states"</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-lg border-l-2 border-primary">
                          <p className="text-sm text-muted-foreground mb-1">Your question</p>
                          <p className="text-sm text-foreground">"How many states can a qubit be in?"</p>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Contextual answer</p>
                          <p className="text-sm text-foreground">A qubit can exist in an infinite number of superposition states between |0⟩ and |1⟩, represented as α|0⟩ + β|1⟩...</p>
                        </div>
                      </div>
                    </div>
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
                  Experience the Future of AI Interaction
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Inline Ask™ is available in Proxinex Beta. Start exploring AI responses 
                  like never before.
                </p>
                <Link to="/app">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                    Try Inline Ask™ Free
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

export default ProductInlineAsk;
