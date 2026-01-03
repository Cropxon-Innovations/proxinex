import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-12 md:py-16 bg-background relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Stop Trusting. Start Controlling.
          </h2>
          <p className="text-base text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of developers and researchers who demand more from AI. 
            Get started free—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/app">
              <Button size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 glow group px-6">
                Start Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="default" variant="outline" className="border-border hover:bg-secondary">
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
