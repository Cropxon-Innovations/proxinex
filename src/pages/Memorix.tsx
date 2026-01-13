import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  FileText, 
  Mic, 
  Video, 
  Link as LinkIcon, 
  Search, 
  BarChart3,
  Presentation,
  Network,
  Shield,
  Sparkles,
  Zap,
  ArrowRight,
  Play,
  Check,
  Building2,
  Users,
  Globe,
  Lock,
  ChevronRight
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const Memorix = () => {
  const [animatedStage, setAnimatedStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedStage((prev) => (prev + 1) % 6);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: FileText,
      title: "Upload PDFs, Docs, Audio, Video, URLs",
      description: "Ingest any knowledge source into your intelligence memory",
    },
    {
      icon: Brain,
      title: "Build Long-term Knowledge Memory",
      description: "Create persistent memory that grows smarter over time",
    },
    {
      icon: Search,
      title: "Ask Questions with Verifiable Citations",
      description: "Every answer backed by traceable sources",
    },
    {
      icon: Presentation,
      title: "Generate Slides, Charts, Infographics",
      description: "Transform insights into presentation-ready visuals",
    },
    {
      icon: Video,
      title: "Create Videos from Documents & Audio",
      description: "Turn static content into dynamic video content",
    },
    {
      icon: Network,
      title: "Visualize Memory Maps & Concept Graphs",
      description: "See the connections in your knowledge network",
    },
    {
      icon: Shield,
      title: "Enterprise-grade Data Isolation",
      description: "Your data stays private and secure, always",
    },
  ];

  const useCases = [
    { icon: Building2, label: "Enterprise Research Teams", description: "Synthesize reports from thousands of documents" },
    { icon: Users, label: "Analysts & Consultants", description: "Build client-ready insights in minutes" },
    { icon: Globe, label: "Knowledge Workers", description: "Never lose context across projects" },
    { icon: Lock, label: "Legal & Compliance", description: "Audit-ready intelligence with citations" },
  ];

  const processingStages = [
    { icon: "📥", label: "Ingesting documents...", progress: 15 },
    { icon: "🧩", label: "Chunking knowledge...", progress: 30 },
    { icon: "🧠", label: "Creating memory embeddings...", progress: 50 },
    { icon: "🔗", label: "Linking concepts...", progress: 70 },
    { icon: "⚡", label: "Routing through Proxinex AI...", progress: 85 },
    { icon: "📊", label: "Generating intelligence...", progress: 100 },
  ];

  return (
    <>
      <Helmet>
        <title>Proxinex Memorix (Beta) - Your Organization's Thinking Memory</title>
        <meta 
          name="description" 
          content="Turn documents, audio, video, and knowledge into answers, insights, presentations, videos, and intelligence — instantly. Your AI-powered Intelligence Memory Engine." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navigation Header - Separate for Memorix */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4">
            <div className="h-16 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-2">
                  <Logo size="sm" />
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                  <a href="#overview" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Overview</a>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                  <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Use Cases</a>
                  <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</a>
                  <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/app/memorix">
                  <Button className="gap-2 glow">
                    <Sparkles className="h-4 w-4" />
                    Try Memorix
                    <Badge variant="secondary" className="ml-1 text-[10px] bg-primary/20 text-primary border-0">Beta</Badge>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-16">
          {/* Hero Section */}
          <section id="overview" className="relative py-24 md:py-32 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="container mx-auto px-4 relative">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Badge variant="outline" className="px-4 py-1.5 text-sm border-primary/30 bg-primary/5">
                    <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
                    Proxinex Memorix
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">BETA</span>
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                  Your Organization's
                  <span className="block text-primary">Thinking Memory</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Turn documents, audio, video, and knowledge into answers, insights, presentations, videos, and intelligence — instantly.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <Link to="/app/memorix">
                    <Button size="lg" className="gap-2 glow text-lg px-8 py-6 h-auto">
                      <Sparkles className="h-5 w-5" />
                      Try Memorix (Beta)
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6 h-auto">
                    <Play className="h-5 w-5" />
                    Explore Intelligence
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Used by analysts, founders, enterprises, and research teams
                </p>
              </div>

              {/* Animated Brain Network Visual */}
              <div className="mt-16 relative max-w-3xl mx-auto">
                <div className="aspect-[16/9] rounded-2xl border border-primary/20 bg-card/50 backdrop-blur overflow-hidden relative">
                  {/* Neural Network Animation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      {/* Central Brain */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center animate-pulse">
                          <Brain className="h-12 w-12 text-primary" />
                        </div>
                      </div>

                      {/* Input Nodes */}
                      {[FileText, Mic, Video, LinkIcon].map((Icon, i) => (
                        <div
                          key={i}
                          className="absolute w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border"
                          style={{
                            left: `${50 + 45 * Math.cos((i * Math.PI) / 2 - Math.PI / 4)}%`,
                            top: `${50 + 45 * Math.sin((i * Math.PI) / 2 - Math.PI / 4)}%`,
                            transform: "translate(-50%, -50%)",
                            animation: `fadeInScale 0.5s ease-out ${i * 0.2}s both`,
                          }}
                        >
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      ))}

                      {/* Output Nodes */}
                      {[BarChart3, Presentation, Video, FileText].map((Icon, i) => (
                        <div
                          key={`out-${i}`}
                          className="absolute w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30"
                          style={{
                            right: `${-10 + 45 * Math.cos((i * Math.PI) / 2 + Math.PI / 4)}%`,
                            top: `${50 + 45 * Math.sin((i * Math.PI) / 2 + Math.PI / 4)}%`,
                            transform: "translate(50%, -50%)",
                            animation: `fadeInScale 0.5s ease-out ${0.8 + i * 0.2}s both`,
                          }}
                        >
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Processing Status */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{processingStages[animatedStage].icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{processingStages[animatedStage].label}</p>
                        <div className="mt-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${processingStages[animatedStage].progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4">Features</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  A Private AI Trained Only on Your Knowledge
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Memorix transforms any knowledge source into interactive intelligence you can query, visualize, and share.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section id="use-cases" className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4">Use Cases</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Built for Knowledge-Intensive Work
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {useCases.map((useCase, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-xl border border-border bg-card/50 text-center hover:bg-card transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <useCase.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{useCase.label}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gamified Intelligence Engine Preview */}
          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4">Intelligence Engine</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Watch Your Intelligence Build in Real-Time
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Experience mission-control-level visibility as Memorix processes your knowledge.
                </p>
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="rounded-2xl border border-border bg-background p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Building your Intelligence Memory…</h3>
                    <p className="text-sm text-muted-foreground">Processing 3 documents, 2 audio files</p>
                  </div>

                  <div className="space-y-4">
                    {processingStages.map((stage, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                          index <= animatedStage
                            ? "bg-primary/10 border border-primary/30"
                            : "bg-secondary/50 border border-transparent"
                        }`}
                      >
                        <span className="text-2xl">{stage.icon}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${index <= animatedStage ? "text-foreground" : "text-muted-foreground"}`}>
                            {stage.label}
                          </p>
                        </div>
                        {index < animatedStage && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                        {index === animatedStage && (
                          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Achievement Badges */}
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <Badge variant="outline" className={`px-3 py-1.5 ${animatedStage >= 2 ? "border-primary/50 text-primary" : "opacity-50"}`}>
                      🏅 Knowledge Indexed
                    </Badge>
                    <Badge variant="outline" className={`px-3 py-1.5 ${animatedStage >= 4 ? "border-primary/50 text-primary" : "opacity-50"}`}>
                      🧠 Memory Created
                    </Badge>
                    <Badge variant="outline" className={`px-3 py-1.5 ${animatedStage >= 5 ? "border-primary/50 text-primary" : "opacity-50"}`}>
                      ⚡ Intelligence Ready
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section id="security" className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <Badge variant="outline" className="mb-4">Security</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Enterprise-Grade Security
                </h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Your data never leaves your control. Memorix is built with security-first architecture.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <Lock className="h-8 w-8 text-primary mb-4 mx-auto" />
                    <h3 className="font-semibold mb-2">Data Isolation</h3>
                    <p className="text-sm text-muted-foreground">Your data is never used to train our models</p>
                  </div>
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <Shield className="h-8 w-8 text-primary mb-4 mx-auto" />
                    <h3 className="font-semibold mb-2">SOC 2 Compliant</h3>
                    <p className="text-sm text-muted-foreground">Enterprise-ready security certifications</p>
                  </div>
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <Building2 className="h-8 w-8 text-primary mb-4 mx-auto" />
                    <h3 className="font-semibold mb-2">On-Premise Option</h3>
                    <p className="text-sm text-muted-foreground">Deploy in your own infrastructure</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section id="pricing" className="py-20 bg-primary/5">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Ready to Transform Your Knowledge?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Join the beta and experience the future of organizational intelligence.
                </p>
                <Link to="/auth">
                  <Button size="lg" className="gap-2 glow text-lg px-10 py-6 h-auto">
                    <Sparkles className="h-5 w-5" />
                    Start Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Logo size="sm" />
                <span className="text-sm text-muted-foreground">Memorix is a Proxinex product</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default Memorix;
