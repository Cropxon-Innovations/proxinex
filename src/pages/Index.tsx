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
          
          {/* Live Preview Section */}
          <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  See Proxinex in Action
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Watch how Inline Ask™, citation verification, and accuracy scoring work together.
                </p>
              </div>
              <HeroLivePreview />
            </div>
          </section>

          <ProblemSection />
          <IntelligenceFlow />
          <HowItWorksSection />
          <FeaturesSection />
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
