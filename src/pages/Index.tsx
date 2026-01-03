import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { FlowSection } from "@/components/landing/FlowSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SandboxPreview } from "@/components/landing/SandboxPreview";
import { CTASection } from "@/components/landing/CTASection";
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
          <ProblemSection />
          <FlowSection />
          <FeaturesSection />
          <SandboxPreview />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
