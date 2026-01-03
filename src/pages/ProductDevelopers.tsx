import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Code, 
  Zap, 
  Shield, 
  Terminal,
  Book,
  Github,
  ArrowRight,
  Copy,
  Check
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useState } from "react";

const ProductDevelopers = () => {
  const [copied, setCopied] = useState(false);

  const installCommand = "npm install @proxinex/sdk";

  const copyCode = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>For Developers - Proxinex API & SDKs</title>
        <meta 
          name="description" 
          content="Build with Proxinex. Simple APIs, powerful SDKs, and complete documentation for integrating AI intelligence control into your applications." 
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
                  <Code className="h-4 w-4" />
                  <span>Developer Experience</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  Built for Developers
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
                  One API. Multiple models. Complete control. 
                  Integrate AI intelligence into your apps in minutes.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                  <Link to="/docs">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                      Read the Docs
                      <Book className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/app/api-keys">
                    <Button size="lg" variant="outline" className="border-border">
                      Get API Key
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Start */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Get Started in Seconds
                  </h2>
                </div>

                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Terminal className="h-4 w-4" />
                      Terminal
                    </span>
                    <button
                      onClick={copyCode}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="p-6">
                    <pre className="text-sm font-mono text-foreground">
                      <code>$ {installCommand}</code>
                    </pre>
                  </div>
                </div>

                <div className="mt-8 bg-card border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-secondary/30">
                    <span className="text-sm font-medium text-foreground">Quick Example</span>
                  </div>
                  <div className="p-6">
                    <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`import Proxinex from '@proxinex/sdk';

const client = new Proxinex({ apiKey: process.env.PROXINEX_API_KEY });

const response = await client.chat({
  message: "Explain quantum computing",
  routing: "auto",        // Automatic model selection
  trackCost: true,        // Get cost in response
  requireSources: true    // Include citations
});

console.log(response.content);
console.log(\`Accuracy: \${response.accuracy}%\`);
console.log(\`Cost: ₹\${response.cost}\`);`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Developer Features
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Zap,
                      title: "Simple API",
                      description: "RESTful API with OpenAI-compatible endpoints. Drop-in replacement for existing integrations."
                    },
                    {
                      icon: Code,
                      title: "SDKs",
                      description: "Official SDKs for Python, JavaScript, and TypeScript. Community SDKs for Go, Rust, and more."
                    },
                    {
                      icon: Shield,
                      title: "Type-Safe",
                      description: "Full TypeScript support with complete type definitions. IntelliSense in your IDE."
                    },
                    {
                      icon: Terminal,
                      title: "CLI Tool",
                      description: "Command-line interface for quick testing, debugging, and automation scripts."
                    },
                    {
                      icon: Book,
                      title: "Documentation",
                      description: "Comprehensive docs with examples, tutorials, and API reference. Mintlify-powered."
                    },
                    {
                      icon: Github,
                      title: "Open Source",
                      description: "SDKs are open source. Contribute, report issues, and help shape the developer experience."
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

          {/* CTA */}
          <section className="py-24 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Start Building Today
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Free tier includes 1,000 requests/month. 
                  No credit card required.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link to="/docs">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow">
                      Read Documentation
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/app/api-keys">
                    <Button size="lg" variant="outline" className="border-border">
                      Get Free API Key
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

export default ProductDevelopers;
