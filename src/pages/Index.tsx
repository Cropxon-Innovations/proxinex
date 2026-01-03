import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SandboxPreview } from "@/components/landing/SandboxPreview";
import { CTASection } from "@/components/landing/CTASection";
import { IntelligenceFlow } from "@/components/landing/IntelligenceFlow";
import { HeroLivePreview } from "@/components/landing/HeroLivePreview";
import { PricingCalculator } from "@/components/landing/PricingCalculator";
import { VideoShowcase } from "@/components/landing/VideoShowcase";
import { IntelligenceShowcase } from "@/components/landing/IntelligenceShowcase";
import { InteractiveRoutingDemo } from "@/components/landing/InteractiveRoutingDemo";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Proxinex - AI Intelligence Control Plane | Control Intelligence</title>
        <meta 
          name="description" 
          content="Proxinex is the AI Intelligence Control Plane. Route queries to optimal AI models, verify accuracy with trust scores, and see exact costs. Control your AI." 
        />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          
          {/* Interactive Routing Demo */}
          <section className="py-20 bg-gradient-to-b from-background via-card/30 to-background relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-primary">Interactive Demo</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  See Intelligent Routing{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    In Action
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Type any query and watch how Proxinex analyzes intent, selects the optimal model, and delivers verified results.
                </p>
              </div>
              <InteractiveRoutingDemo />
            </div>
          </section>
          
          {/* Live Preview Section */}
          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Inline Ask™ & Citation Verification
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Watch how Inline Ask™, citation verification, and accuracy scoring work together.
                </p>
              </div>
              <HeroLivePreview />
            </div>
          </section>

          <ProblemSection />
          <IntelligenceShowcase />
          <IntelligenceFlow />
          <VideoShowcase />
          <HowItWorksSection />
          <PricingCalculator />
          <SandboxPreview />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
